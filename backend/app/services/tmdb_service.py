import os
import requests
from fastapi import HTTPException

TMDB_BASE_URL = "https://api.themoviedb.org/3"


# TEMPORARY MOCK (only if TMDB is unreachable)
MOCK_RESULTS = [
    {
        "id": 27205,
        "title": "Inception",
        "release_date": "2010-07-15",
        "overview": "A thief who steals corporate secrets through dream-sharing technology.",
        "poster_path": "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"
    }
]

def search_movies(query: str):
    api_key = os.getenv("TMDB_API_KEY")

    if not api_key:
        raise HTTPException(status_code=500, detail="TMDB API key not configured")

    url = f"{TMDB_BASE_URL}/search/movie"
    params = {
        "api_key": api_key,
        "query": query,
        "language": "en-US",
        "include_adult": False
    }

    try:
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
    except requests.exceptions.ConnectTimeout:
        return MOCK_RESULTS  # fallback
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=502,
            detail=f"TMDB error: {str(e)}"
        )

    data = response.json()

    return [
        {
            "id": m["id"],
            "title": m["title"],
            "release_date": m.get("release_date"),
            "overview": m.get("overview"),
            "poster_path": m.get("poster_path"),
        }
        for m in data.get("results", [])
    ]