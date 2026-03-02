from dotenv import load_dotenv
import os

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