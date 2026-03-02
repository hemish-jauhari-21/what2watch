import os
import requests
from fastapi import HTTPException

# Base URL for TMDB
TMDB_BASE_URL = "https://api.themoviedb.org/3"

# ---------------------------------------------------
# MOCK DATA (used when TMDB is unreachable)
# ---------------------------------------------------

MOCK_SEARCH_RESULTS = [
    {
        "id": 27205,
        "title": "Inception",
        "release_date": "2010-07-15",
        "overview": "A thief who steals corporate secrets through dream-sharing technology.",
        "poster_path": "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"
    },
    {
        "id": 157336,
        "title": "Interstellar",
        "release_date": "2014-11-05",
        "overview": "A team of explorers travel through a wormhole in space.",
        "poster_path": "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
    }
]

MOCK_MOVIE_DETAILS = {
    "id": 27205,
    "title": "Inception",
    "overview": "A thief who steals corporate secrets through dream-sharing technology.",
    "genres": ["Action", "Science Fiction", "Thriller"],
    "runtime": 148,
    "rating": 8.3,
    "poster_path": "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    "release_date": "2010-07-15"
}

# ---------------------------------------------------
# SEARCH MOVIES
# ---------------------------------------------------

def search_movies(query: str):
    api_key = os.getenv("TMDB_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="TMDB API key not configured"
        )

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
        data = response.json()

        return [
            {
                "id": movie["id"],
                "title": movie["title"],
                "release_date": movie.get("release_date"),
                "overview": movie.get("overview"),
                "poster_path": movie.get("poster_path"),
            }
            for movie in data.get("results", [])
        ]

    except requests.exceptions.RequestException:
        # Fallback to mock data if TMDB fails
        return MOCK_SEARCH_RESULTS

# ---------------------------------------------------
# MOVIE DETAILS
# ---------------------------------------------------

def get_movie_details(movie_id: int):
    api_key = os.getenv("TMDB_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="TMDB API key not configured"
        )

    url = f"{TMDB_BASE_URL}/movie/{movie_id}"
    params = {
        "api_key": api_key,
        "language": "en-US"
    }

    try:
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        movie = response.json()

        return {
            "id": movie["id"],
            "title": movie["title"],
            "overview": movie.get("overview"),
            "genres": [g["name"] for g in movie.get("genres", [])],
            "runtime": movie.get("runtime"),
            "rating": movie.get("vote_average"),
            "poster_path": movie.get("poster_path"),
            "release_date": movie.get("release_date")
        }

    except requests.exceptions.RequestException:
        # Fallback to mock movie details
        return MOCK_MOVIE_DETAILS