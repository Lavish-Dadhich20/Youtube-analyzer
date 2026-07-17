from fastapi import APIRouter
from utils.youtube_api import get_trending_videos
from database.mongo import trends_collection
from datetime import datetime

router = APIRouter(prefix="/trending", tags=["Trending"])

@router.get("/")
async def get_trending(region="IN", max_results=20):
    try:
        videos = get_trending_videos(
            region_code=region,
            max_results=max_results
        )
        result = []
        for video in videos:
            snippet = video["snippet"]
            statistics = video.get("statistics", {})
            result.append({
                "video_id": video["id"],
                "title": snippet["title"],
                "channel": snippet["channelTitle"],
                "thumbnail": snippet["thumbnails"]["high"]["url"],
                "views": int(statistics.get("viewCount", 0)),
                "likes": int(statistics.get("likeCount", 0)),
                "published_at": snippet["publishedAt"],
                "category_id": snippet.get("categoryId", "")
            })

        trends_collection.insert_one({
            "region": region,
            "videos": result,
            "fetched_at": datetime.now().isoformat()
        })

        return {
            "region": region,
            "count": len(result),
            "videos": result
        }
    except Exception as e:
        return {"error": str(e), "videos": []}

@router.get("/regions")
async def get_regions():
    return {
        "regions": [
            {"code": "IN", "name": "India"},
            {"code": "US", "name": "United States"},
            {"code": "GB", "name": "United Kingdom"},
            {"code": "CA", "name": "Canada"},
            {"code": "AU", "name": "Australia"},
            {"code": "PK", "name": "Pakistan"},
            {"code": "DE", "name": "Germany"},
            {"code": "FR", "name": "France"},
            {"code": "JP", "name": "Japan"},
            {"code": "BR", "name": "Brazil"},
            {"code": "KR", "name": "South Korea"},
            {"code": "MX", "name": "Mexico"}
        ]
    }