from dotenv import load_dotenv
import os
from app.database import engine
from app.models import Base
from app.routes import watchlist
from app.routes import auth

Base.metadata.create_all(bind=engine)

# Load environment variables first
load_dotenv()

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from app.services.tmdb_service import search_movies, get_movie_details, get_streaming_providers, get_popular_movies
from fastapi.security import HTTPBearer
from fastapi.openapi.utils import get_openapi

security = HTTPBearer()


app = FastAPI(title="What2Watch API",
              swagger_ui_parameters={"persistAuthorization": True}
)

app.include_router(watchlist.router)
app.include_router(auth.router)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="What2Watch API",
        version="1.0.0",
        description="API with JWT Auth",
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    openapi_schema["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

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