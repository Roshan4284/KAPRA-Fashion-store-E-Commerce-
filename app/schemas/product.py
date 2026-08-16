from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: str | None = None
    price: float = Field(..., gt=0)
    stock: int = Field(..., ge=0)
    size: str = Field(..., min_length=1, max_length=20)
    color: str = Field(..., min_length=1, max_length=50)
    image_url: str | None = None
    category_id: int = Field(..., gt=0)


class ProductResponse(BaseModel):
    id: int
    name: str
    description: str | None
    price: float
    stock: int
    size: str
    color: str
    image_url: str | None
    category_id: int

    model_config = {
        "from_attributes": True
    }