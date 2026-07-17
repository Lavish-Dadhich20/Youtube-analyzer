from googleapiclient.discovery import build
from dotenv import load_dotenv
import os
load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

def get_youtube_client():
    youtube = build(
        "youtube",
        "v3",
        developerKey=YOUTUBE_API_KEY
    )
    return youtube

def get_video_details(video_id):
    youtube = get_youtube_client()
    request = youtube.videos().list(
        part="snippet,statistics,contentDetails",
        id=video_id
    )
    response = request.execute()
    if response["items"]:
        return response["items"][0]
    return None

def get_trending_videos(region_code="IN", max_results=20):
    youtube = get_youtube_client()
    request = youtube.videos().list(
        part="snippet,statistics,contentDetails",
        chart="mostPopular",
        regionCode=region_code,
        maxResults=max_results
    )
    response = request.execute()
    return response["items"]


def search_videos(query, max_results=10):
    youtube = get_youtube_client()
    request = youtube.search().list(
        part="snippet",
        q=query,
        type="video",
        maxResults=max_results
    )
    response = request.execute()
    return response["items"]

def get_channel_details(channel_id):
    youtube = get_youtube_client()
    request = youtube.channels().list(
        part="snippet,statistics,contentDetails",
        id=channel_id
    )
    response = request.execute()
    if response["items"]:
        return response["items"][0]
    return None

def get_channel_videos(channel_id, max_results=50):
    youtube = get_youtube_client()
    request = youtube.search().list(
        part="snippet",
        channelId=channel_id,
        type="video",
        order="date",
        maxResults=max_results
    )
    response = request.execute()
    return response["items"]