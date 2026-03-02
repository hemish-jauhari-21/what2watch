from dotenv import load_dotenv
import os
from app.services.tmdb_service import search_movies, get_movie_details

# ✅ LOAD ENV FIRST (CRITICAL)
load_dotenv()

from fastapi import FastAPI, Query
from app.services.tmdb_service import search_movies

app = FastAPI(title="What2Watch API")

@app.get("/")
def root():
    return {
        "message": "What2Watch backend running",
        "env_loaded": os.getenv("TMDB_API_KEY") is not None
    }

@app.get("/search")
def search(query: str = Query(..., min_length=1)):
    return {
        "results": search_movies(query)
    }

@app.get("/movie/{movie_id}")
def movie_details (movie_id: int):
    return get_movie_details(movie_id)