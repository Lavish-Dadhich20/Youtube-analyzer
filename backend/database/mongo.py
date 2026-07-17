from pymongo import MongoClient
from dotenv import load_dotenv
import os
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGODB_URI)
db = client["youtube_analyzer"]

videos_collection = db["videos"]
searches_collection = db["searches"]
trends_collection = db["trends"]

def get_database():
    return db

