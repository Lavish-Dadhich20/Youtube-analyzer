import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")

def ask_gemini(prompt):
    response = model.generate_content(prompt)
    return response.text

def analyze_seo(title, description, tags):
    prompt = f"""
    Analyze the YouTube SEO for this video:
    
    Title: {title}
    Description: {description[:500]}
    Tags: {tags}
    
    Provide:
    1. SEO Score out of 100
    2. Keyword analysis
    3. Title SEO strength
    4. Description optimization tips
    5. Missing important keywords
    6. Tag suggestions to add
    7. How to rank higher on YouTube search
    """
    return ask_gemini(prompt)

def predict_trend_score(title, description, category):
    prompt = f"""
    Analyze if this YouTube video topic is currently trending:
    
    Title: {title}
    Description: {description[:300]}
    Category: {category}
    
    Provide:
    1. Trend Score out of 100
    2. Is this topic trending right now? Yes/No
    3. Peak trend time prediction
    4. Competition level: Low/Medium/High
    5. Best time to publish this video
    6. Related trending topics to include
    """
    return ask_gemini(prompt)