from fastapi import APIRouter, Header
from pydantic import BaseModel
from utils.ai_router import ask_public_ai, ask_youtuber_ai
from database.mongo import db
from datetime import datetime
import jwt
import os

router = APIRouter(prefix="/chat", tags=["Chat"])

SECRET_KEY = os.getenv("SECRET_KEY", "youtube_analyzer_secret_2026")

class ChatRequest(BaseModel):
    message: str
    history: list = []

@router.post("/public")
async def public_chat(request: ChatRequest):
    try:
        prompt = f"""
You are a friendly YouTube assistant chatbot. 
Keep ALL responses SHORT and conversational — maximum 7-8 sentences.
Never write long paragraphs or essays.
Match the energy of the message:
- If user says "hi" or greets → just greet back warmly in 1 sentence
- If user asks a simple question → answer in 4-5 sentences
- If user asks something complex → answer in 7-8 sentences max
- Never give unsolicited advice or long tips nobody asked for
- Only talk about YouTube, video creation, or content strategy
- If user asks something unrelated to YouTube → politely redirect

Conversation so far:
{chr(10).join([f"{m.get('role','user')}: {m.get('content','')}" for m in request.history[-6:]])}

User: {request.message}
Assistant:"""

        ai_result = ask_public_ai(prompt)

        return {
            "response": ai_result["response"],
            "ai_used": ai_result["ai_used"],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}

@router.post("/youtuber")
async def youtuber_chat(
    request: ChatRequest,
    authorization: str = Header(None)
):
    try:
        user_context = ""
        if authorization:
            try:
                token = authorization.replace("Bearer ", "")
                payload = jwt.decode(
                    token,
                    SECRET_KEY,
                    algorithms=["HS256"]
                )
                users = db["users"]
                user_data = users.find_one({"email": payload["email"]})
                if user_data:
                    channel_name = user_data.get("channel_name", user_data.get("channel_url", "unknown"))
                    subs = user_data.get("subscriber_count", 0)
                    videos = user_data.get("video_count", 0)
                    views = user_data.get("total_views", 0)
                    user_context = f"""
Creator: {user_data['name']}
Channel: {channel_name}
Subscribers: {subs}
Videos: {videos}
Total views: {views}
Verified: {user_data.get('verified', False)}
"""
            except:
                pass

        history_text = "\n".join([
            f"{m.get('role','user')}: {m.get('content','')}"
            for m in request.history[-6:]
        ])

        prompt = f"""
You are a personal YouTube growth advisor chatbot.
Keep ALL responses SHORT and conversational — maximum 4-5 sentences.
Never write essays or long lists unless specifically asked.
Match the energy of the message:
- If user greets → greet back and ask what they need help with (1-2 sentences)
- Simple question → direct answer in 4-5 sentences
- Advice request → give the single most important tip in 7-8 sentences
- Only expand with a list if user specifically asks for "steps" or "tips" or "list"

Creator context:
{user_context if user_context else "No channel connected yet."}

Conversation:
{history_text}

User: {request.message}
Assistant:"""

        ai_result = ask_youtuber_ai(prompt)

        return {
            "response": ai_result["response"],
            "ai_used": ai_result["ai_used"],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}