from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.utils.dependencies import get_current_user


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# ============================================================
# USER RESPONSE
# ============================================================

class AdminUserResponse(BaseModel):

    id: int
    name: str
    email: str
    role: str
    created_at: str


# ============================================================
# GET ALL USERS - ADMIN
# ============================================================

@router.get(
    "/",
    response_model=list[AdminUserResponse]
)
def get_all_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Check admin role
    # --------------------------------------------------------

    if current_user.role != "admin":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )


    # --------------------------------------------------------
    # Get all users
    # --------------------------------------------------------

    users = (
        db.query(User)
        .order_by(
            User.created_at.desc()
        )
        .all()
    )


    # --------------------------------------------------------
    # Return safe user data
    # --------------------------------------------------------

    return [
        AdminUserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            created_at=user.created_at.isoformat()
        )
        for user in users
    ]