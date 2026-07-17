from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from database.mongo import db
from models.user import create_user_model
from dotenv import load_dotenv
import jwt
import os
import json
import hashlib
import base64
import secrets
import requests as req

load_dotenv()

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

router = APIRouter(prefix="/auth", tags=["OAuth"])

SECRET_KEY = os.getenv("SECRET_KEY", "youtube_analyzer_secret_key_2026_secure")
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/youtube/callback")

CLIENT_SECRETS_FILE = os.path.join(
    os.path.dirname(__file__), "..", "client_secret.json"
)

pkce_store = {}

def get_client_config():
    with open(CLIENT_SECRETS_FILE) as f:
        return json.load(f)["web"]

def generate_pkce_pair():
    code_verifier = secrets.token_urlsafe(64)
    code_challenge = base64.urlsafe_b64encode(
        hashlib.sha256(code_verifier.encode()).digest()
    ).rstrip(b"=").decode()
    return code_verifier, code_challenge

@router.get("/youtube/login")
async def youtube_login():
    config = get_client_config()
    code_verifier, code_challenge = generate_pkce_pair()
    state = secrets.token_urlsafe(16)
    pkce_store[state] = code_verifier

    params = {
        "client_id": config["client_id"],
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join([
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/youtube.readonly",
        ]),
        "state": state,
        "access_type": "offline",
        "prompt": "consent",
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
    }

    auth_url = "https://accounts.google.com/o/oauth2/auth?" + "&".join(
        f"{k}={v}" for k, v in params.items()
    )

    return RedirectResponse(auth_url)

@router.get("/youtube/callback")
async def youtube_callback(
    code: str = None,
    error: str = None,
    state: str = None
):
    if error:
        return RedirectResponse(
            f"http://localhost:5173/dashboard?oauth_error={error}"
        )

    if not code:
        raise HTTPException(status_code=400, detail="No code received")

    try:
        config = get_client_config()
        code_verifier = pkce_store.pop(state, None)

        if not code_verifier:
            raise Exception("PKCE verifier not found — please try login again")

        token_response = req.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": config["client_id"],
                "client_secret": config["client_secret"],
                "redirect_uri": REDIRECT_URI,
                "grant_type": "authorization_code",
                "code_verifier": code_verifier,
            },
            timeout=30
        )

        token_data = token_response.json()
        print(f"Token response: {token_data}")

        if "error" in token_data:
            raise Exception(f"Token error: {token_data}")

        access_token = token_data["access_token"]

        user_info_response = req.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=30
        )
        user_info = user_info_response.json()
        print(f"User info: {user_info}")

        email = user_info.get("email")
        name = user_info.get("name", "")
        picture = user_info.get("picture", "")

        youtube_response = req.get(
            "https://www.googleapis.com/youtube/v3/channels",
            params={"part": "snippet,statistics", "mine": "true"},
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=30
        )
        youtube_data = youtube_response.json()
        print(f"YouTube data: {youtube_data}")

        channel_data = {}
        if youtube_data.get("items"):
            channel = youtube_data["items"][0]
            channel_data = {
                "channel_id": channel["id"],
                "channel_name": channel["snippet"]["title"],
                "channel_url": f"https://youtube.com/channel/{channel['id']}",
                "channel_thumbnail": channel["snippet"]["thumbnails"]["default"]["url"],
                "subscriber_count": int(channel["statistics"].get("subscriberCount", 0)),
                "video_count": int(channel["statistics"].get("videoCount", 0)),
                "total_views": int(channel["statistics"].get("viewCount", 0)),
                "verified": True,
            }

        users = db["users"]
        existing = users.find_one({"email": email})

        if existing:
            users.update_one(
                {"email": email},
                {"$set": {
                    **channel_data,
                    "profile_picture": picture,
                    "oauth_connected": True,
                    "access_token": access_token,
                }}
            )
            user_id = str(existing["_id"])
        else:
            user = create_user_model(
                name=name,
                email=email,
                password=os.urandom(32).hex(),
                channel_url=channel_data.get("channel_url", ""),
                channel_id=channel_data.get("channel_id", ""),
            )
            user.update({
                **channel_data,
                "profile_picture": picture,
                "oauth_connected": True,
                "access_token": access_token,
            })
            result = users.insert_one(user)
            user_id = str(result.inserted_id)

        token = jwt.encode(
            {"user_id": user_id, "email": email},
            SECRET_KEY,
            algorithm="HS256"
        )

        return RedirectResponse(
            f"http://localhost:5173/dashboard?token={token}&name={name}&oauth=success"
        )

    except Exception as e:
        print(f"OAuth error: {e}")
        return RedirectResponse(
            f"http://localhost:5173/dashboard?oauth_error=failed"
        )