from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from database.mongo import db
from models.user import create_user_model, verify_password, create_session_model
from datetime import datetime
import jwt
import os

router = APIRouter(prefix="/auth", tags=["Auth"])

SECRET_KEY = os.getenv("SECRET_KEY", "youtube_analyzer_secret_key_2026_secure")

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    channel_url: str = ""

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(request: RegisterRequest):
    try:
        users = db["users"]
        existing = users.find_one({"email": request.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        user = create_user_model(
            name=request.name,
            email=request.email,
            password=request.password,
            channel_url=request.channel_url
        )

        print(f"Password being stored: {user['password']}")
        print(f"Hash length: {len(user['password'])}")

        result = users.insert_one(user)
        saved = users.find_one({"email": request.email})
        print(f"SAVED hash length in DB: {len(saved['password'])}")
        token = jwt.encode(
            {
                "user_id": str(result.inserted_id),
                "email": request.email
            },
            SECRET_KEY,
            algorithm="HS256"
        )

        return {
            "message": "Account created successfully!",
            "token": token,
            "name": request.name,
            "email": request.email
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login(request: LoginRequest):
    try:
        users = db["users"]
        user = users.find_one({"email": request.email})

        if not user:
            raise HTTPException(status_code=404, detail="Account not found")

        print(f"Stored hash length: {len(user['password'])}")
        print(f"Password attempt: {request.password}")
        
        result = verify_password(request.password, user["password"])
        print(f"Verify result: {result}")

        if not result:
            raise HTTPException(status_code=401, detail="Wrong password")

        users.update_one(
            {"email": request.email},
            {"$set": {"last_login": datetime.now().isoformat()}}
        )

        token = jwt.encode(
            {
                "user_id": str(user["_id"]),
                "email": request.email
            },
            SECRET_KEY,
            algorithm="HS256"
        )

        return {
            "message": "Login successful!",
            "token": token,
            "name": user["name"],
            "email": request.email,
            "channel_url": user.get("channel_url", "")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete-account")
async def delete_account(authorization: str = Header(None)):
    from datetime import datetime

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not logged in")

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("email")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        users = db["users"]
        user = users.find_one({"email": email})

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        deleted_users = db["deleted_users"]
        user["deleted_at"] = datetime.now().isoformat()
        user["deletion_reason"] = "user_requested"
        deleted_users.insert_one(user)

        if user.get("oauth_connected") and user.get("access_token"):
            try:
                import requests as req
                req.post(
                    "https://oauth2.googleapis.com/revoke",
                    params={"token": user["access_token"]},
                    timeout=10
                )
                print(f"Revoked Google token for {email}")
            except Exception as revoke_err:
                print(f"Token revoke failed (non-critical): {revoke_err}")

        users.delete_one({"email": email})
        users.delete_one({"email": email})

        return {"message": "Account deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
class FeedbackRequest(BaseModel):
    rating: int
    category: str = ""
    comment: str = ""

@router.post("/feedback")
async def submit_feedback(
    request: FeedbackRequest,
    authorization: str = Header(None)
):
    try:
        name = "Anonymous"
        email = "anonymous"

        if authorization and authorization.startswith("Bearer "):
            try:
                token = authorization.split(" ")[1]
                payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                email = payload.get("email", "anonymous")
                users = db["users"]
                user = users.find_one({"email": email})
                if user:
                    name = user.get("name", "Anonymous")
            except:
                pass

        feedback_collection = db["feedback"]
        feedback_collection.insert_one({
            "name": name,
            "email": email,
            "rating": request.rating,
            "category": request.category,
            "comment": request.comment,
            "submitted_at": datetime.now().isoformat(),
        })

        print(f"✅ Feedback from {name}: {request.rating}⭐ - {request.category}")

        return {"message": "Feedback submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))