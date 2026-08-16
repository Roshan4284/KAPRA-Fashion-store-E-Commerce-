from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.cart import Cart
from app.models.order import Order, OrderItem
from app.models.user import User
from app.schemas.order import OrderResponse
from app.utils.dependencies import get_current_user
from pydantic import BaseModel


router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)



# CHECKOUT


@router.post(
    "/checkout",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED
)
def checkout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find user's cart
    cart = (
        db.query(Cart)
        .filter(Cart.user_id == current_user.id)
        .first()
    )

    # Check cart is not empty
    if cart is None or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )

    total_amount = 0

    # Check stock and calculate total
    for cart_item in cart.items:

        product = cart_item.product

        if product is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        if product.stock < cart_item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for {product.name}"
            )

        total_amount += product.price * cart_item.quantity

    # Create order
    order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        status="placed"
    )

    db.add(order)

    # Get order ID before creating order items
    db.flush()

    # Create order items and reduce stock
    for cart_item in cart.items:

        product = cart_item.product

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=cart_item.quantity,
            price=product.price
        )

        db.add(order_item)

        # Reduce product stock
        product.stock -= cart_item.quantity

    # Clear cart
    for cart_item in cart.items:
        db.delete(cart_item)

    db.commit()
    db.refresh(order)

    return order



# GET ALL ORDERS FOR CURRENT USER


@router.get(
    "",
    response_model=list[OrderResponse]
)
def get_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )

    return orders



# GET SINGLE ORDER


@router.get(
    "/{order_id}",
    response_model=OrderResponse
)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.user_id == current_user.id
        )
        .first()
    )

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    return order

# ============================================================
# GET ALL ORDERS - ADMIN
# ============================================================

@router.get(
    "/admin/all",
    response_model=list[OrderResponse]
)
def get_all_orders_admin(
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
    # Get all orders
    # --------------------------------------------------------

    orders = (
        db.query(Order)
        .order_by(
            Order.created_at.desc()
        )
        .all()
    )


    return orders

# ============================================================
# UPDATE ORDER STATUS - ADMIN
# ============================================================




class OrderStatusUpdate(BaseModel):
    status: str


@router.put(
    "/admin/{order_id}/status",
    response_model=OrderResponse
)
def update_order_status_admin(
    order_id: int,
    status_data: OrderStatusUpdate,
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
    # Allowed statuses
    # --------------------------------------------------------

    allowed_statuses = {
        "placed",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
    }


    new_status = (
        status_data.status
        .strip()
        .lower()
    )


    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid status. Allowed statuses: "
                "placed, processing, shipped, "
                "delivered, cancelled"
            )
        )


    # --------------------------------------------------------
    # Find order
    # --------------------------------------------------------

    order = (
        db.query(Order)
        .filter(
            Order.id == order_id
        )
        .first()
    )


    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )


    # --------------------------------------------------------
    # Update status
    # --------------------------------------------------------

    order.status = new_status

    db.commit()

    db.refresh(order)


    return order