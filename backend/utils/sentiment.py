from utils.huggingface import analyze_sentiment, analyze_comments_batch
from utils.youtube_api import get_youtube_client

def get_video_comments(video_id, max_results=50):
    try:
        youtube = get_youtube_client()
        request = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=max_results,
            order="relevance"
        )
        response = request.execute()
        comments = []
        for item in response.get("items", []):
            comment = item["snippet"]["topLevelComment"]["snippet"]
            comments.append(comment["textDisplay"])
        return comments
    except:
        return []

def analyze_video_sentiment(video_id):
    try:
        comments = get_video_comments(video_id)
        if not comments:
            return {
                "status": "no_comments",
                "message": "No comments found",
                "sentiment_summary": {
                    "positive": 0,
                    "negative": 0,
                    "neutral": 0,
                    "total_analyzed": 0
                }
            }

        sentiment_summary = analyze_comments_batch(comments)

        overall = "Positive"
        if sentiment_summary["negative"] > sentiment_summary["positive"]:
            overall = "Negative"
        elif sentiment_summary["neutral"] > 50:
            overall = "Mixed"

        return {
            "status": "success",
            "video_id": video_id,
            "total_comments_fetched": len(comments),
            "sentiment_summary": sentiment_summary,
            "overall_sentiment": overall,
            "audience_reaction": get_audience_reaction(sentiment_summary)
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_audience_reaction(sentiment_summary):
    positive = sentiment_summary["positive"]
    negative = sentiment_summary["negative"]

    if positive >= 70:
        return "Audience loves this video!"
    elif positive >= 50:
        return "Audience mostly positive"
    elif negative >= 50:
        return "Audience has concerns"
    elif negative >= 70:
        return "Audience strongly dislikes"
    else:
        return "Mixed audience reaction"