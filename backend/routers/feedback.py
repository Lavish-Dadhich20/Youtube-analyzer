from fastapi import APIRouter, HTTPException, Header, BackgroundTasks
from pydantic import BaseModel
from database.mongo import db
from utils.email import send_feedback_notification
from datetime import datetime
import jwt
import os

router = APIRouter(prefix="/feedback", tags=["Feedback"])

SECRET_KEY = os.getenv("SECRET_KEY", "youtube_analyzer_secret_key_2026_secure")


class FeedbackRequest(BaseModel):
    rating: int
    comment: str = ""
    category: str = ""
    context: str = "logout"  # "logout" | "delete_account"


@router.post("")
async def submit_feedback(
    request: FeedbackRequest,
    background_tasks: BackgroundTasks,
    authorization: str = Header(None)
):
    email = None
    if authorization and authorization.startswith("Bearer "):
        try:
            payload = jwt.decode(authorization.split(" ")[1], SECRET_KEY, algorithms=["HS256"])
            email = payload.get("email")
        except Exception:
            pass  # allow anonymous feedback if the token is invalid/expired

    if request.rating < 1 or request.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    feedback_doc = {
        "email": email,
        "rating": request.rating,
        "comment": request.comment.strip(),
        "category": request.category,
        "context": request.context,
        "created_at": datetime.now().isoformat(),
    }

    db["feedback"].insert_one(feedback_doc)

    # Look up the user's name and channel so the notification email is
    # actually identifiable, not just a bare email address.
    name = None
    channel_name = None
    if email:
        user = db["users"].find_one({"email": email})
        if user:
            name = user.get("name")
            channel_name = user.get("channel_name")

    # Notify the site owner — runs after the response is sent, never blocks
    # logout or account deletion.
    background_tasks.add_task(
        send_feedback_notification,
        request.rating,
        request.comment.strip(),
        email,
        request.category,
        request.context,
        name,
        channel_name,
    )

    return {"message": "Thanks for your feedback!"}