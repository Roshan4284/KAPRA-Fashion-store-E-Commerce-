from pydantic import BaseModel


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float


class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    items: list[OrderItemResponse]