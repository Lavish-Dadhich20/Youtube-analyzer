import requests
from dotenv import load_dotenv
import os

load_dotenv()

OLLAMA_URL = "http://localhost:11434/api/generate"

def is_ollama_running():
    try:
        response = requests.get(
            "http://localhost:11434",
            timeout=2
        )
        return response.status_code == 200
    except:
        return False

def ask_ollama(prompt):
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )
        return response.json()["response"]
    except:
        return None

def ask_groq_api(prompt):
    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert YouTube growth strategist with 10 years of experience."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=2048
        )
        return response.choices[0].message.content
    except:
        return None

def ask_gemini_api(prompt):
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return response.text
    except:
        return None

def ask_public_ai(prompt):
    print("PUBLIC: Trying Ollama (local)...")
    if is_ollama_running():
        result = ask_ollama(prompt)
        if result:
            return {"response": result, "ai_used": "Ollama"}

    print("PUBLIC: Trying Gemini...")
    result = ask_gemini_api(prompt)
    if result:
        return {"response": result, "ai_used": "Gemini"}

    print("PUBLIC: Trying Groq fallback...")
    result = ask_groq_api(prompt)
    if result:
        return {"response": result, "ai_used": "Groq"}

    return {"response": "AI unavailable", "ai_used": "none"}

def ask_youtuber_ai(prompt):
    print("YOUTUBER: Trying Groq 70B (best quality)...")
    result = ask_groq_api(prompt)
    if result:
        return {"response": result, "ai_used": "Groq-70B"}

    print("YOUTUBER: Trying Ollama fallback...")
    if is_ollama_running():
        result = ask_ollama(prompt)
        if result:
            return {"response": result, "ai_used": "Ollama"}

    print("YOUTUBER: Trying Gemini...")
    result = ask_gemini_api(prompt)
    if result:
        return {"response": result, "ai_used": "Gemini"}

    return {"response": "AI unavailable", "ai_used": "none"}

def ask_ai(prompt):
    return ask_youtuber_ai(prompt)