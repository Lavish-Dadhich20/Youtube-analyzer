def analyze_thumbnail(thumbnail_url):
    try:
        response = requests.get(thumbnail_url, timeout=10)
        if response.status_code != 200:
            return default_thumbnail_score()

        content_length = len(response.content)
        score = 100
        issues = []
        suggestions = []

        if content_length < 50000:
            score -= 20
            issues.append("Thumbnail resolution too low")
            suggestions.append("Use high resolution image (1280x720)")

        return {
            "score": max(score, 0),
            "issues": issues,
            "suggestions": suggestions,
            "file_size_kb": round(content_length / 1024, 2),
            "source": "thumbnail_analyzer"
        }
    except:
        return default_thumbnail_score()

def default_thumbnail_score():
    return {
        "score": 50,
        "issues": ["Could not analyze thumbnail"],
        "suggestions": ["Ensure thumbnail is publicly accessible"],
        "file_size_kb": 0,
        "source": "default"
    }

def score_thumbnail(thumbnail_url):
    analysis = analyze_thumbnail(thumbnail_url)
    score = analysis["score"]

    if score >= 80:
        grade = "Excellent"
    elif score >= 60:
        grade = "Good"
    elif score >= 40:
        grade = "Average"
    else:
        grade = "Poor"

    return {
        **analysis,
        "grade": grade
    }