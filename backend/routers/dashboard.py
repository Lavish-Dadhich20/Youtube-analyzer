from fastapi import APIRouter, HTTPException, Header
from utils.youtube_api import get_video_details, search_videos
from utils.ai_router import ask_youtuber_ai
from utils.nlp import analyze_title
from utils.huggingface import analyze_sentiment
from database.mongo import db
from datetime import datetime
import requests as req
import jwt
import os

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

SECRET_KEY = os.getenv("SECRET_KEY", "youtube_analyzer_secret_key_2026_secure")

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not logged in")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/overview")
async def get_overview(authorization: str = Header(None)):
    user = get_current_user(authorization)
    try:
        users = db["users"]
        user_data = users.find_one({"email": user["email"]})

        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        channel_url = user_data.get("channel_url", "")

        prompt = f"""
        A YouTuber with channel URL: {channel_url}
        wants to know their channel health.

        Give them:
        1. General YouTube growth tips
        2. Content strategy advice
        3. 5 trending video ideas for 2026
        4. Best upload schedule
        5. Engagement improvement tips
        """

        ai_result = ask_youtuber_ai(prompt)

        return {
            "user": user_data["name"],
            "email": user_data["email"],
            "terms_agreed": user_data.get("terms_agreed", False),
            "channel_url": user_data.get("channel_url", ""),
            "channel_name": user_data.get("channel_name", ""),
            "channel_id": user_data.get("channel_id", ""),
            "subscriber_count": user_data.get("subscriber_count", 0),
            "video_count": user_data.get("video_count", 0),
            "total_views": user_data.get("total_views", 0),
            "verified": user_data.get("verified", False),
            "oauth_connected": user_data.get("oauth_connected", False),
            "plan": user_data.get("plan", "free"),
            "member_since": user_data["created_at"],
            "ai_advice": ai_result["response"],
            "ai_used": ai_result["ai_used"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-channel")
async def analyze_channel(
    channel_data: dict,
    authorization: str = Header(None)
):
    user = get_current_user(authorization)
    try:
        channel_name = channel_data.get("channel_name", "")
        subscribers = channel_data.get("subscribers", 0)
        total_views = channel_data.get("total_views", 0)
        video_count = channel_data.get("video_count", 0)
        top_videos = channel_data.get("top_videos", [])
        avg_views = channel_data.get("avg_views", 0)
        upload_frequency = channel_data.get("upload_frequency", "unknown")

        from utils.groq_ai import analyze_channel_strategy
        strategy = analyze_channel_strategy({
            "name": channel_name,
            "subscribers": subscribers,
            "total_views": total_views,
            "video_count": video_count,
            "top_videos": top_videos,
            "avg_views": avg_views,
            "upload_frequency": upload_frequency
        })

        return {
            "channel_name": channel_name,
            "strategy": strategy,
            "analyzed_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations")
async def get_recommendations(authorization: str = Header(None)):
    user = get_current_user(authorization)
    try:
        prompt = """
        Give a YouTuber 5 specific video recommendations for 2026.
        Make them trending, viral potential topics.
        For each give:
        1. Title
        2. Why it will perform well
        3. Estimated views
        4. Best thumbnail concept
        5. Key tags
        """
        ai_result = ask_youtuber_ai(prompt)
        return {
            "recommendations": ai_result["response"],
            "ai_used": ai_result["ai_used"],
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/channel")
async def get_channel_data(authorization: str = Header(None)):
    user = get_current_user(authorization)
    try:
        users = db["users"]
        user_data = users.find_one({"email": user["email"]})

        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "oauth_connected": user_data.get("oauth_connected", False),
            "channel_name": user_data.get("channel_name", ""),
            "channel_url": user_data.get("channel_url", ""),
            "channel_thumbnail": user_data.get("channel_thumbnail", ""),
            "channel_id": user_data.get("channel_id", ""),
            "subscriber_count": user_data.get("subscriber_count", 0),
            "video_count": user_data.get("video_count", 0),
            "total_views": user_data.get("total_views", 0),
            "verified": user_data.get("verified", False),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_user_history(authorization: str = Header(None)):
    user = get_current_user(authorization)
    try:
        history_collection = db["video_history"]
        history = list(
            history_collection.find(
                {"email": user["email"]},
                {"_id": 0}
            ).sort("analyzed_at", -1).limit(20)
        )
        return {
            "count": len(history),
            "history": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/compare-channel")
async def compare_channel(
    channel: str,
    authorization: str = Header(None)
):
    user = get_current_user(authorization)
    try:
        api_key = os.getenv("YOUTUBE_API_KEY")
        channel_id = None
        channel = channel.strip()

        if "youtube.com/channel/" in channel:
            channel_id = channel.split("/channel/")[-1].split("/")[0].strip()

        elif "youtube.com/@" in channel or "youtube.com/%40" in channel:
            handle = channel.split("/@")[-1].split("/")[0].strip()
            res = req.get(
                "https://www.googleapis.com/youtube/v3/channels",
                params={
                    "part": "snippet,statistics",
                    "forHandle": handle,
                    "key": api_key,
                },
                timeout=10
            )
            data = res.json()
            print(f"Handle search for '{handle}': {data}")
            if data.get("items"):
                channel_id = data["items"][0]["id"]

        elif channel.startswith("@"):
            handle = channel[1:].strip()
            res = req.get(
                "https://www.googleapis.com/youtube/v3/channels",
                params={
                    "part": "snippet,statistics",
                    "forHandle": handle,
                    "key": api_key,
                },
                timeout=10
            )
            data = res.json()
            print(f"@ handle search for '{handle}': {data}")
            if data.get("items"):
                channel_id = data["items"][0]["id"]

        else:
            handle = channel.strip()
            res = req.get(
                "https://www.googleapis.com/youtube/v3/channels",
                params={
                    "part": "snippet,statistics",
                    "forHandle": handle,
                    "key": api_key,
                },
                timeout=10
            )
            data = res.json()
            print(f"Plain search for '{handle}': {data}")
            if data.get("items"):
                channel_id = data["items"][0]["id"]

            if not channel_id:
                res = req.get(
                    "https://www.googleapis.com/youtube/v3/search",
                    params={
                        "part": "snippet",
                        "q": handle,
                        "type": "channel",
                        "maxResults": 1,
                        "key": api_key,
                    },
                    timeout=10
                )
                search_data = res.json()
                print(f"Search fallback for '{handle}': {search_data}")
                if search_data.get("items"):
                    channel_id = search_data["items"][0]["snippet"]["channelId"]

        if not channel_id:
            raise HTTPException(
                status_code=404,
                detail="Channel not found. Try using @handle format e.g. @MrBeast"
            )

        res = req.get(
            "https://www.googleapis.com/youtube/v3/channels",
            params={
                "part": "snippet,statistics",
                "id": channel_id,
                "key": api_key,
            },
            timeout=10
        )
        data = res.json()

        if not data.get("items"):
            raise HTTPException(status_code=404, detail="Channel data not found")

        ch = data["items"][0]
        stats = ch["statistics"]
        snippet = ch["snippet"]

        subs = int(stats.get("subscriberCount", 0))
        videos = int(stats.get("videoCount", 0))
        views = int(stats.get("viewCount", 0))

        return {
            "channel_id": channel_id,
            "channel_name": snippet["title"],
            "channel_thumbnail": snippet["thumbnails"]["default"]["url"],
            "channel_url": f"https://youtube.com/channel/{channel_id}",
            "description": snippet.get("description", "")[:200],
            "subscriber_count": subs,
            "video_count": videos,
            "total_views": views,
            "avg_views_per_video": round(views / videos) if videos > 0 else 0,
            "country": snippet.get("country", "Unknown"),
            "created_at": snippet.get("publishedAt", "")[:10],
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Compare error: {e}")
        raise HTTPException(status_code=500, detail=str(e))