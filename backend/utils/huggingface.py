from textblob import TextBlob

def analyze_sentiment(text):
    try:
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity

        if polarity > 0.1:
            sentiment = "POSITIVE"
        elif polarity < -0.1:
            sentiment = "NEGATIVE"
        else:
            sentiment = "NEUTRAL"

        confidence = round(abs(polarity) * 100, 2)

        return {
            "sentiment": sentiment,
            "confidence": confidence,
            "source": "TextBlob"
        }
    except:
        return {"sentiment": "unknown", "confidence": 0}

def classify_content(text):
    text_lower = text.lower()

    categories = {
        "education": ["learn", "tutorial", "course", "how to", "guide", "explain"],
        "entertainment": ["funny", "comedy", "prank", "reaction", "vlog"],
        "gaming": ["game", "gaming", "gameplay", "minecraft", "fortnite"],
        "technology": ["tech", "python", "coding", "programming", "software", "ai", "computer"],
        "music": ["music", "song", "remix", "cover", "beat"],
        "sports": ["sports", "football", "cricket", "match", "game highlights"],
        "news": ["news", "breaking", "update", "report"],
        "lifestyle": ["lifestyle", "vlog", "daily", "routine"],
        "finance": ["money", "finance", "stock", "invest", "crypto"]
    }

    scores = {}
    for category, keywords in categories.items():
        score = sum(1 for keyword in keywords if keyword in text_lower)
        scores[category] = score

    best_category = max(scores, key=scores.get)
    max_score = scores[best_category]

    if max_score == 0:
        return {"category": "general", "score": 50.0, "source": "keyword_matching"}

    confidence = min(round(max_score * 25, 2), 95.0)

    return {
        "category": best_category,
        "score": confidence,
        "source": "keyword_matching"
    }

def extract_keywords(text):
    try:
        blob = TextBlob(text)
        noun_phrases = list(blob.noun_phrases)
        words = [word for word in blob.words if len(word) > 3]

        keywords = list(set(noun_phrases + words))[:10]
        return keywords
    except:
        return []

def analyze_comments_batch(comments):
    if not comments:
        return {"positive": 0, "negative": 0, "neutral": 0, "total_analyzed": 0}

    results = {"positive": 0, "negative": 0, "neutral": 0}

    for comment in comments[:50]:
        sentiment = analyze_sentiment(comment)
        label = sentiment["sentiment"].lower()
        if "pos" in label:
            results["positive"] += 1
        elif "neg" in label:
            results["negative"] += 1
        else:
            results["neutral"] += 1

    total = len(comments[:50])
    return {
        "positive": round(results["positive"] / total * 100, 1),
        "negative": round(results["negative"] / total * 100, 1),
        "neutral": round(results["neutral"] / total * 100, 1),
        "total_analyzed": total
    }