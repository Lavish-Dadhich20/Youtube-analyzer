from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = "llama-3.3-70b-versatile"

def ask_groq(prompt, temperature=0.7):
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are an expert YouTube growth strategist with 10 years of experience. You analyze YouTube videos and channels and provide actionable recommendations to help creators grow."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=temperature,
        max_tokens=2048
    )
    return response.choices[0].message.content

def optimize_title(title, description, tags):
    prompt = f"""
    Analyze this YouTube video and suggest 5 better titles:

    Current Title: {title}
    Description: {description[:300]}
    Tags: {tags}

    Give 5 optimized titles that:
    - Are under 60 characters
    - Include power words
    - Create curiosity
    - Include the main keyword
    - Will get more clicks
    """
    return ask_groq(prompt, temperature=0.8)

def generate_video_ideas(channel_niche, top_videos, subscriber_count):
    prompt = f"""
    You are analyzing a YouTube channel.

    Channel Niche: {channel_niche}
    Subscriber Count: {subscriber_count}
    Top Performing Videos: {top_videos}

    Generate 5 specific video ideas for this channel that:
    - Match their audience interests
    - Have high viral potential
    - Are realistic to produce
    - Fill content gaps in their niche

    For each idea provide:
    1. Video title
    2. Why it will perform well
    3. Estimated views potential
    4. Best thumbnail concept
    """
    return ask_groq(prompt, temperature=0.9)

def analyze_channel_strategy(channel_data):
    prompt = f"""
    Analyze this YouTube channel and provide a complete growth strategy:

    Channel Name: {channel_data['name']}
    Subscribers: {channel_data['subscribers']}
    Total Views: {channel_data['total_views']}
    Video Count: {channel_data['video_count']}
    Top Videos: {channel_data['top_videos']}
    Average Views: {channel_data['avg_views']}
    Upload Frequency: {channel_data['upload_frequency']}

    Provide:
    1. Channel health score out of 100
    2. Top 3 strengths
    3. Top 3 weaknesses
    4. 5 recommended next video ideas
    5. Best upload schedule
    6. Content strategy for next 30 days
    """
    return ask_groq(prompt, temperature=0.7)