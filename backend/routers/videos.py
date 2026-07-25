from fastapi import APIRouter, HTTPException, Header
from database.mongo import db
from utils.youtube_token import get_valid_access_token
import jwt
import os
import isodate
import requests as req

router = APIRouter(prefix="/dashboard", tags=["Videos"])

SECRET_KEY = os.getenv("SECRET_KEY", "youtube_analyzer_secret_key_2026_secure")

# YouTube's current official max length for a Short. Duration is the only
# reliable signal the Data API exposes — it doesn't return aspect ratio,
# so this is an approximation, not a guarantee, for edge cases near 3 min.
SHORTS_MAX_SECONDS = 180


def parse_duration_seconds(iso_duration):
    if not iso_duration:
        return 0
    try:
        return int(isodate.parse_duration(iso_duration).total_seconds())
    except Exception:
        return 0


def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not logged in")

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("email")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def generate_video_insight(views, likes, comments, engagement_rate):
    """Lightweight rule-based insight. No external AI call — keeps this
    endpoint fast, free, and independent of any third-party API uptime."""
    tips = []

    if engagement_rate < 1:
        tips.append(
            "Engagement is on the lower side — try asking a direct question "
            "in the video or pinning a comment to spark replies."
        )
    elif engagement_rate < 3:
        tips.append(
            "Solid engagement. A stronger call-to-action in the first 30 "
            "seconds could push it higher."
        )
    else:
        tips.append(
            "Great engagement rate! Whatever you did in this video (hook, "
            "topic, CTA) — that pattern is working, repeat it."
        )

    if comments > 0 and likes / comments > 50:
        tips.append(
            "Lots of likes but relatively few comments — try ending with an "
            "open-ended question to invite discussion."
        )

    if views < 100:
        tips.append(
            "Low view count so far — check your thumbnail and title against "
            "top-performing videos in your niche."
        )

    return " ".join(tips)


@router.get("/videos")
async def list_videos(authorization: str = Header(None), page_token: str = None):
    user = get_current_user(authorization)

    if not user.get("oauth_connected") or not user.get("channel_id"):
        raise HTTPException(status_code=400, detail="Connect your YouTube channel first")

    access_token = get_valid_access_token(user)
    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="Your YouTube session expired. Please reconnect your channel from Settings."
        )

    headers = {"Authorization": f"Bearer {access_token}"}

    # Get this channel's uploads playlist ID
    ch_resp = req.get(
        "https://www.googleapis.com/youtube/v3/channels",
        params={"part": "contentDetails", "mine": "true"},
        headers=headers,
        timeout=20
    )
    ch_data = ch_resp.json()
    items = ch_data.get("items", [])
    if not items:
        raise HTTPException(status_code=404, detail="Could not find your channel's uploads")

    uploads_playlist_id = items[0]["contentDetails"]["relatedPlaylists"]["uploads"]

    playlist_params = {
        "part": "contentDetails",
        "playlistId": uploads_playlist_id,
        "maxResults": 12,
    }
    if page_token:
        playlist_params["pageToken"] = page_token

    pl_resp = req.get(
        "https://www.googleapis.com/youtube/v3/playlistItems",
        params=playlist_params,
        headers=headers,
        timeout=20
    )
    pl_data = pl_resp.json()
    video_ids = [item["contentDetails"]["videoId"] for item in pl_data.get("items", [])]

    if not video_ids:
        return {"videos": [], "next_page_token": None}

    vid_resp = req.get(
        "https://www.googleapis.com/youtube/v3/videos",
        params={"part": "snippet,statistics,contentDetails", "id": ",".join(video_ids)},
        headers=headers,
        timeout=20
    )
    vid_data = vid_resp.json()

    videos = []
    for v in vid_data.get("items", []):
        stats = v.get("statistics", {})
        snippet = v.get("snippet", {})
        duration_seconds = parse_duration_seconds(v.get("contentDetails", {}).get("duration"))
        videos.append({
            "id": v["id"],
            "title": snippet.get("title"),
            "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url"),
            "published_at": snippet.get("publishedAt"),
            "views": int(stats.get("viewCount", 0)),
            "likes": int(stats.get("likeCount", 0)),
            "comments": int(stats.get("commentCount", 0)),
            "duration_seconds": duration_seconds,
            "is_short": 0 < duration_seconds <= SHORTS_MAX_SECONDS,
        })

    return {
        "videos": videos,
        "next_page_token": pl_data.get("nextPageToken")
    }


@router.get("/videos/search")
async def search_videos(q: str, authorization: str = Header(None), page_token: str = None):
    user = get_current_user(authorization)

    if not user.get("oauth_connected") or not user.get("channel_id"):
        raise HTTPException(status_code=400, detail="Connect your YouTube channel first")

    if not q or not q.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")

    access_token = get_valid_access_token(user)
    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="Your YouTube session expired. Please reconnect your channel from Settings."
        )

    headers = {"Authorization": f"Bearer {access_token}"}

    search_params = {
        "part": "snippet",
        "forMine": "true",
        "type": "video",
        "q": q.strip(),
        "maxResults": 12,
        "order": "relevance",
    }
    if page_token:
        search_params["pageToken"] = page_token

    search_resp = req.get(
        "https://www.googleapis.com/youtube/v3/search",
        params=search_params,
        headers=headers,
        timeout=20
    )
    search_data = search_resp.json()

    if "error" in search_data:
        raise HTTPException(status_code=502, detail="YouTube search failed. Please try again.")

    video_ids = [item["id"]["videoId"] for item in search_data.get("items", []) if item.get("id", {}).get("videoId")]

    if not video_ids:
        return {"videos": [], "next_page_token": None}

    vid_resp = req.get(
        "https://www.googleapis.com/youtube/v3/videos",
        params={"part": "snippet,statistics,contentDetails", "id": ",".join(video_ids)},
        headers=headers,
        timeout=20
    )
    vid_data = vid_resp.json()

    videos = []
    for v in vid_data.get("items", []):
        stats = v.get("statistics", {})
        snippet = v.get("snippet", {})
        duration_seconds = parse_duration_seconds(v.get("contentDetails", {}).get("duration"))
        videos.append({
            "id": v["id"],
            "title": snippet.get("title"),
            "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url"),
            "published_at": snippet.get("publishedAt"),
            "views": int(stats.get("viewCount", 0)),
            "likes": int(stats.get("likeCount", 0)),
            "comments": int(stats.get("commentCount", 0)),
            "duration_seconds": duration_seconds,
            "is_short": 0 < duration_seconds <= SHORTS_MAX_SECONDS,
        })

    return {
        "videos": videos,
        "next_page_token": search_data.get("nextPageToken")
    }


@router.get("/videos/{video_id}")
async def video_detail(video_id: str, authorization: str = Header(None)):
    user = get_current_user(authorization)

    access_token = get_valid_access_token(user)
    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="Your YouTube session expired. Please reconnect your channel from Settings."
        )

    headers = {"Authorization": f"Bearer {access_token}"}

    resp = req.get(
        "https://www.googleapis.com/youtube/v3/videos",
        params={"part": "snippet,statistics,contentDetails", "id": video_id},
        headers=headers,
        timeout=20
    )
    data = resp.json()
    items = data.get("items", [])
    if not items:
        raise HTTPException(status_code=404, detail="Video not found")

    v = items[0]
    stats = v.get("statistics", {})
    snippet = v.get("snippet", {})

    views = int(stats.get("viewCount", 0))
    likes = int(stats.get("likeCount", 0))
    comments = int(stats.get("commentCount", 0))
    engagement_rate = round(((likes + comments) / views) * 100, 2) if views > 0 else 0

    return {
        "id": v["id"],
        "title": snippet.get("title"),
        "description": (snippet.get("description") or "")[:300],
        "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url"),
        "published_at": snippet.get("publishedAt"),
        "duration": v.get("contentDetails", {}).get("duration"),
        "views": views,
        "likes": likes,
        "comments": comments,
        "engagement_rate": engagement_rate,
        "insight": generate_video_insight(views, likes, comments, engagement_rate),
    }