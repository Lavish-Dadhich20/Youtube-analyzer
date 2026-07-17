from datetime import datetime

def create_video_model(
    video_id,
    title,
    channel,
    channel_id,
    thumbnail,
    duration,
    views,
    likes,
    comments,
    tags,
    description,
    published_at,
    category,
    url=""
):
    return {
        "video_id": video_id,
        "url": url,
        "title": title,
        "channel": channel,
        "channel_id": channel_id,
        "thumbnail": thumbnail,
        "duration": duration,
        "views": views,
        "likes": likes,
        "comments": comments,
        "tags": tags,
        "description": description,
        "published_at": published_at,
        "category": category,
        "created_at": datetime.now().isoformat()
    }

def create_analysis_model(
    video_id,
    title_analysis,
    sentiment,
    thumbnail_score,
    trend_analysis,
    seo_analysis,
    keywords,
    predicted_views,
    ai_recommendations,
    ai_used
):
    return {
        "video_id": video_id,
        "title_analysis": title_analysis,
        "sentiment": sentiment,
        "thumbnail_score": thumbnail_score,
        "trend_analysis": trend_analysis,
        "seo_analysis": seo_analysis,
        "keywords": keywords,
        "predicted_views": predicted_views,
        "ai_recommendations": ai_recommendations,
        "ai_used": ai_used,
        "analyzed_at": datetime.now().isoformat()
    }