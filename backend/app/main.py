from dotenv import load_dotenv
import os
from app.database import engine
from app.models import Base
from app.routes import watchlist

Base.metadata.create_all(bind=engine)

# Load environment variables first
load_dotenv()

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from app.services.tmdb_service import search_movies, get_movie_details, get_streaming_providers, get_popular_movies


app = FastAPI(title="What2Watch API")

app.include_router(watchlist.router)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
def movie_details(movie_id: int):
    return get_movie_details(movie_id)

@app.get("/movie/{movie_id}/providers")
def movie_providers(movie_id: int):
    return {
        "providers": get_streaming_providers(movie_id)
    }

@app.get("/movies/popular")
def popular_movies(page: int = 1):
    return {
        "results": get_popular_movies(page)
    }