import re
import isodate
from textblob import TextBlob

def extract_video_id(url):
    patterns = [
        r"v=([a-zA-Z0-9_-]{11})",
        r"youtu\.be/([a-zA-Z0-9_-]{11})",
        r"shorts/([a-zA-Z0-9_-]{11})"
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def format_duration(duration_str):
    try:
        duration = isodate.parse_duration(duration_str)
        total_seconds = int(duration.total_seconds())
        minutes = total_seconds // 60
        seconds = total_seconds % 60
        return f"{minutes}:{seconds:02d}"
    except:
        return "0:00"

def analyze_title(title):
    score = 100
    issues = []
    suggestions = []

    if len(title) > 60:
        score -= 15
        issues.append("Title too long (over 60 characters)")
        suggestions.append("Shorten title to under 60 characters")

    if len(title) < 30:
        score -= 10
        issues.append("Title too short (under 30 characters)")
        suggestions.append("Make title more descriptive")

    power_words = ["best", "top", "how", "why", "secret",
                   "ultimate", "complete", "guide", "tips",
                   "tricks", "free", "easy", "fast", "new"]

    title_lower = title.lower()
    has_power_word = any(word in title_lower for word in power_words)

    if not has_power_word:
        score -= 10
        suggestions.append("Add a power word like: Best, Top, How, Why, Ultimate")

    numbers = re.findall(r'\d+', title)

    if not numbers:
        score -= 5
        suggestions.append("Consider adding a number (e.g. '5 Tips', '2026')")

    return {
        "score": max(score, 0),
        "issues": issues,
        "suggestions": suggestions,
        "length": len(title),
        "has_power_word": has_power_word,
        "has_number": bool(numbers)
    }