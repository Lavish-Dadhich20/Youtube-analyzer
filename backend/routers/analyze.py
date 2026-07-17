from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from utils.youtube_api import get_video_details
from utils.nlp import extract_video_id, analyze_title, format_duration
from utils.huggingface import analyze_sentiment, classify_content, extract_keywords
from utils.ai_router import ask_public_ai, ask_youtuber_ai
from utils.gemini import predict_trend_score, analyze_seo
from utils.thumbnail import score_thumbnail
from models.video import create_video_model, create_analysis_model
from database.mongo import videos_collection, searches_collection, db
from datetime import datetime
import jwt
import os

router = APIRouter(prefix="/analyze", tags=["Analysis"])

SECRET_KEY = os.getenv("SECRET_KEY", "youtube_analyzer_secret_key_2026_secure")

class VideoURLRequest(BaseModel):
    url: str

class VideoIdeaRequest(BaseModel):
    title: str
    description: str = ""
    category: str = "general"

@router.post("/url")
async def analyze_url(
    request: VideoURLRequest,
    authorization: str = Header(None)
):
    try:
        video_id = extract_video_id(request.url)
        if not video_id:
            raise HTTPException(
                status_code=400,
                detail="Invalid YouTube URL"
            )

        video_data = get_video_details(video_id)
        if not video_data:
            raise HTTPException(
                status_code=404,
                detail="Video not found"
            )

        snippet = video_data["snippet"]
        statistics = video_data["statistics"]
        content_details = video_data["contentDetails"]

        title = snippet["title"]
        description = snippet.get("description", "")
        tags = snippet.get("tags", [])
        thumbnail_url = snippet["thumbnails"]["high"]["url"]

        title_analysis = analyze_title(title)
        sentiment = analyze_sentiment(description[:500])
        category = classify_content(title + " " + description[:200])
        keywords = extract_keywords(title + " " + description[:300])
        duration = format_duration(content_details["duration"])
        thumbnail_score = score_thumbnail(thumbnail_url)

        trend_analysis = predict_trend_score(
            title,
            description[:300],
            snippet.get("categoryId", "general")
        )

        seo_analysis = analyze_seo(title, description, tags)

        prompt = f"""
        Analyze this YouTube video briefly:

        Title: {title}
        Views: {statistics.get('viewCount', 0)}
        Likes: {statistics.get('likeCount', 0)}
        Comments: {statistics.get('commentCount', 0)}
        Duration: {duration}
        Tags: {tags[:10]}
        Title Score: {title_analysis['score']}/100
        Sentiment: {sentiment['sentiment']}
        Category: {category['category']}
        Keywords: {keywords[:10]}

        Give:
        1. Overall performance score out of 100
        2. Is this video trending? Yes/No
        3. Top 3 strengths
        4. Top 3 improvements needed
        5. One key recommendation
        """

        ai_result = ask_public_ai(prompt)

        views = int(statistics.get("viewCount", 0))
        likes = int(statistics.get("likeCount", 0))
        comments_count = int(statistics.get("commentCount", 0))

        engagement_rate = 0
        if views > 0:
            engagement_rate = round(
                (likes + comments_count) / views * 100, 2
            )

        result = {
            "video_id": video_id,
            "url": request.url,
            "title": title,
            "channel": snippet["channelTitle"],
            "thumbnail": thumbnail_url,
            "duration": duration,
            "published_at": snippet["publishedAt"],
            "views": views,
            "likes": likes,
            "comments": comments_count,
            "engagement_rate": engagement_rate,
            "tags": tags[:20],
            "title_analysis": title_analysis,
            "sentiment": sentiment,
            "category": category,
            "keywords": keywords[:15],
            "thumbnail_score": thumbnail_score,
            "trend_analysis": trend_analysis,
            "seo_analysis": seo_analysis,
            "ai_analysis": ai_result["response"],
            "ai_used": ai_result["ai_used"],
            "analyzed_at": datetime.now().isoformat()
        }

        searches_collection.insert_one({
            "type": "url_analysis",
            "url": request.url,
            "video_id": video_id,
            "title": title,
            "analyzed_at": datetime.now().isoformat()
        })

        save_result = result.copy()
        videos_collection.update_one(
            {"video_id": video_id},
            {"$set": save_result},
            upsert=True
        )

        try:
            auth = authorization or ""
            if auth.startswith("Bearer "):
                token = auth.replace("Bearer ", "")
                payload = jwt.decode(
                    token, SECRET_KEY, algorithms=["HS256"]
                )
                email = payload.get("email")
                if email:
                    history_collection = db["video_history"]
                    history_collection.insert_one({
                        "email": email,
                        "video_id": video_id,
                        "title": title,
                        "channel": snippet["channelTitle"],
                        "thumbnail": thumbnail_url,
                        "views": views,
                        "likes": likes,
                        "title_score": title_analysis.get("score", 0),
                        "sentiment": sentiment.get("sentiment", ""),
                        "ai_used": ai_result.get("ai_used", ""),
                        "analyzed_at": datetime.now().isoformat(),
                    })
                    print(f"✅ Saved history for {email}: {title[:50]}")
        except Exception as save_err:
            print(f"Could not save history (non-critical): {save_err}")

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

@router.post("/idea")
async def analyze_idea(request: VideoIdeaRequest):
    try:
        title_analysis = analyze_title(request.title)
        sentiment = analyze_sentiment(request.title)
        category = classify_content(
            request.title + " " + request.description
        )
        keywords = extract_keywords(
            request.title + " " + request.description
        )

        trend_analysis = predict_trend_score(
            request.title,
            request.description,
            request.category
        )

        prompt = f"""
        A YouTuber wants to make this video:

        Title: {request.title}
        Description: {request.description}
        Category: {request.category}
        Title Score: {title_analysis['score']}/100
        Keywords: {keywords[:10]}

        Predict:
        1. Will this perform well? Yes/No + reason
        2. Estimated views in 30 days (give range)
        3. Viral probability percentage
        4. Competition level: Low/Medium/High
        5. Three better title suggestions
        6. Ten best tags to use
        7. Best day and time to upload
        8. Thumbnail concept suggestion
        9. One key tip to maximize performance
        """

        ai_result = ask_public_ai(prompt)

        searches_collection.insert_one({
            "type": "idea_prediction",
            "title": request.title,
            "category": request.category,
            "analyzed_at": datetime.now().isoformat()
        })

        return {
            "title": request.title,
            "title_analysis": title_analysis,
            "sentiment": sentiment,
            "category": category,
            "keywords": keywords[:15],
            "trend_analysis": trend_analysis,
            "ai_prediction": ai_result["response"],
            "ai_used": ai_result["ai_used"],
            "predicted_at": datetime.now().isoformat()
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

@router.get("/history")
async def get_analysis_history(limit: int = 10):
    try:
        history = list(
            searches_collection.find(
                {},
                {"_id": 0}
            ).sort(
                "analyzed_at", -1
            ).limit(limit)
        )
        return {
            "count": len(history),
            "history": history
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/video/{video_id}")
async def get_saved_analysis(video_id: str):
    try:
        video = videos_collection.find_one(
            {"video_id": video_id},
            {"_id": 0}
        )
        if not video:
            raise HTTPException(
                status_code=404,
                detail="Analysis not found"
            )
        return video
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )