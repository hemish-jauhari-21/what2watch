from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import SessionLocal
from app.models import User
from app.auth import hash_password, verify_password, create_token

router = APIRouter()

# ---------------------------
# DB Dependency
# ---------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------
# Request Models
# ---------------------------

# ✅ Signup model (includes name)
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


# ✅ Login model (NO name)
class LoginRequest(BaseModel):
    email: str
    password: str


# ---------------------------
# SIGNUP API
# ---------------------------
@router.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):

    # 🔍 Check if user already exists
    existing = db.query(User).filter(User.email == data.email).first()

    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    # 🔐 Create new user
    user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User created successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }


# ---------------------------
# LOGIN API
# ---------------------------
@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    # 🔍 Find user
    user = db.query(User).filter(User.email == data.email).first()

    # ❌ Invalid credentials
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 🔐 Create JWT token
    token = create_token({"user_id": user.id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }