from fastapi import APIRouter

router = APIRouter()

watchlist = []

@router.post("/watchlist/add")
def add_movie(movie_id: int, title: str):
    watchlist.append({
        "movie_id": movie_id,
        "title": title
    })
    return {"message": "Added to watchlist"}

@router.get("/watchlist")
def get_watchlist():
    return watchlist