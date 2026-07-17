from fastapi import APIRouter
from pydantic import BaseModel
from utils.ai_router import ask_public_ai
from utils.nlp import analyze_title
from utils.gemini import predict_trend_score
from utils.huggingface import classify_content
from datetime import datetime

router = APIRouter(prefix="/predict", tags=["Predict"])

class VideoIdeaRequest(BaseModel):
    title: str
    description: str = ""
    category: str = "general"

@router.post("/idea")
async def predict_idea(request: VideoIdeaRequest):
    try:
        title_analysis = analyze_title(request.title)
        trend_score = predict_trend_score(
            request.title,
            request.description,
            request.category
        )
        category = classify_content(
            request.title + " " + request.description
        )

        prompt = f"""
        A YouTuber wants to make this video:
        Title: {request.title}
        Description: {request.description}
        Category: {request.category}

        Title Score: {title_analysis['score']}/100
        Trend Analysis: {trend_score}

        Provide:
        1. Will this video perform well? Yes/No and why
        2. Predicted views range (e.g. 10K-50K)
        3. Competition level: Low/Medium/High
        4. 3 improved title suggestions
        5. Best tags to use (10 tags)
        6. Best time to upload
        7. One key recommendation
        """

        ai_result = ask_public_ai(prompt)

        return {
            "title": request.title,
            "title_analysis": title_analysis,
            "trend_score": trend_score,
            "category": category,
            "ai_prediction": ai_result["response"],
            "ai_used": ai_result["ai_used"],
            "predicted_at": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}