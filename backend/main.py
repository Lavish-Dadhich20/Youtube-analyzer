from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from routers import analyze, trending, predict, auth, dashboard, chat
from routers import analyze, trending, predict, auth, dashboard, chat, oauth

load_dotenv()
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

app = FastAPI(
    title="YouTube Analyzer",
    description="Analyze YouTube videos using AI and ML",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def root():
    return {"message": "YouTube Analyzer API is running!"}

@app.get("/health")
def health():
    return {"status": "healthy", "app": "YouTube Analyzer"}

app.include_router(analyze.router)
app.include_router(trending.router)
app.include_router(predict.router)
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(chat.router)
app.include_router(oauth.router)