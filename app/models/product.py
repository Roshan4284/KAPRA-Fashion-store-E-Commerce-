from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship
)

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    # ========================================================
    # ID
    # ========================================================

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    # ========================================================
    # PRODUCT NAME
    # ========================================================

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    # ========================================================
    # DESCRIPTION
    # ========================================================

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # ========================================================
    # PRICE
    # ========================================================

    price: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    # ========================================================
    # STOCK
    # ========================================================

    stock: Mapped[int] = mapped_column(
        default=0,
        nullable=False
    )

    # ========================================================
    # SIZE
    # ========================================================

    size: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    # ========================================================
    # COLOR
    # ========================================================

    color: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    # ========================================================
    # IMAGE
    # ========================================================

    image_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    # ========================================================
    # ACTIVE STATUS
    # ========================================================
    # True  = product is visible to customers
    # False = product is hidden/deactivated
    # ========================================================

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    # ========================================================
    # CATEGORY
    # ========================================================

    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id"),
        nullable=False
    )

    # ========================================================
    # CREATED AT
    # ========================================================

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # ========================================================
    # CATEGORY RELATIONSHIP
    # ========================================================

    category = relationship(
        "Category",
        back_populates="products"
    )