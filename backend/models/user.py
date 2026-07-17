from datetime import datetime
import hashlib
import os

def hash_password(password):
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        100000
    )
    return salt.hex() + key.hex()

def verify_password(password, hashed):
    try:
        salt = bytes.fromhex(hashed[:64])
        stored_key = hashed[64:]
        key = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            100000
        )
        return key.hex() == stored_key
    except:
        return False

def create_user_model(
    name,
    email,
    password,
    channel_url="",
    channel_id=""
):
    return {
        "name": name,
        "email": email,
        "password": hash_password(password),
        "channel_url": channel_url,
        "channel_id": channel_id,
        "plan": "free",
        "analyses_count": 0,
        "created_at": datetime.now().isoformat(),
        "last_login": datetime.now().isoformat()
    }

def create_session_model(user_id, email):
    return {
        "user_id": str(user_id),
        "email": email,
        "created_at": datetime.now().isoformat()
    }