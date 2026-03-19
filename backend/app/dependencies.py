from fastapi import Header, HTTPException
from app.auth import decode_token

def get_current_user(authorization: str = Header(None)):

    if not authorization:
        raise HTTPException(status_code=401, detail="No token provided")

    token = authorization.split(" ")[1]  # Bearer <token>

    user_id = decode_token(token)

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    return user_id