from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Watchlist
from app.dependencies import get_current_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Add movie (NOW USER-SPECIFIC)
@router.post("/watchlist/add")
def add_movie(
    movie_id: int,
    title: str,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    movie = Watchlist(
        user_id=user_id,
        movie_id=movie_id,
        movie_title=title,
        poster=""
    )

    db.add(movie)
    db.commit()

    return {"message": "Added to watchlist"}


# Get watchlist (USER-SPECIFIC)
@router.get("/watchlist")
def get_watchlist(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    movies = db.query(Watchlist).filter(Watchlist.user_id == user_id).all()

    return movies