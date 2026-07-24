import requests as req
import os
from datetime import datetime, timedelta
from database.mongo import db

CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")


def get_valid_access_token(user: dict):
    """Returns a valid Google access token for this user.

    If the stored token is still valid, returns it as-is. If it's expired
    (or close to it), uses the stored refresh_token to get a new one from
    Google, saves it back to the DB, and returns the new token.

    Returns None if there's no refresh_token on file — meaning the user
    needs to reconnect their YouTube account from Settings.
    """
    access_token = user.get("access_token")
    refresh_token = user.get("refresh_token")
    expiry_str = user.get("token_expiry")

    if expiry_str and access_token:
        expiry = datetime.fromisoformat(expiry_str)
        if datetime.now() < expiry - timedelta(minutes=2):
            return access_token  # still valid, no need to refresh

    if not refresh_token:
        return None

    response = req.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        },
        timeout=15
    )
    data = response.json()

    if "access_token" not in data:
        print(f"Token refresh failed for {user.get('email')}: {data}")
        return None

    new_access_token = data["access_token"]
    new_expiry = (datetime.now() + timedelta(seconds=data.get("expires_in", 3600))).isoformat()

    db["users"].update_one(
        {"email": user["email"]},
        {"$set": {"access_token": new_access_token, "token_expiry": new_expiry}}
    )

    return new_access_token