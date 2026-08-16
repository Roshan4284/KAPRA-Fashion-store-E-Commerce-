from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartResponse
from app.utils.dependencies import get_current_user


router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)


# ============================================================
# HELPER FUNCTION
# ============================================================

def build_cart_response(cart: Cart):
    items = []
    total = 0

    for cart_item in cart.items:

        product = cart_item.product

        if product is None:
            continue

        subtotal = product.price * cart_item.quantity

        items.append({
            "id": cart_item.id,
            "product_id": product.id,
            "product_name": product.name,
            "price": product.price,
            "quantity": cart_item.quantity,
            "subtotal": subtotal
        })

        total += subtotal

    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "items": items,
        "total": total
    }


# ============================================================
# ADD PRODUCT TO CART
# ============================================================

@router.post(
    "/items",
    response_model=CartResponse,
    status_code=status.HTTP_201_CREATED
)
def add_to_cart(
    item_data: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Check product exists
    product = (
        db.query(Product)
        .filter(Product.id == item_data.product_id)
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Check stock
    if product.stock < item_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough stock available"
        )

    # Find user's cart
    cart = (
        db.query(Cart)
        .filter(Cart.user_id == current_user.id)
        .first()
    )

    # Create cart if it doesn't exist
    if cart is None:

        cart = Cart(
            user_id=current_user.id
        )

        db.add(cart)
        db.commit()
        db.refresh(cart)

    # Check if product is already in cart
    cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == item_data.product_id
        )
        .first()
    )

    if cart_item:

        new_quantity = (
            cart_item.quantity +
            item_data.quantity
        )

        if new_quantity > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Requested quantity exceeds available stock"
            )

        cart_item.quantity = new_quantity

    else:

        cart_item = CartItem(
            cart_id=cart.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity
        )

        db.add(cart_item)

    db.commit()
    db.refresh(cart)

    # Return calculated cart response
    return build_cart_response(cart)


# ============================================================
# GET CART
# ============================================================

@router.get(
    "",
    response_model=CartResponse
)
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    cart = (
        db.query(Cart)
        .filter(Cart.user_id == current_user.id)
        .first()
    )

    if cart is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart is empty"
        )

    return build_cart_response(cart)


# ============================================================
# UPDATE CART ITEM
# ============================================================

@router.put(
    "/items/{item_id}",
    response_model=CartResponse
)
def update_cart_item(
    item_id: int,
    quantity: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    cart = (
        db.query(Cart)
        .filter(Cart.user_id == current_user.id)
        .first()
    )

    if cart is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )

    cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.id == item_id,
            CartItem.cart_id == cart.id
        )
        .first()
    )

    if cart_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )

    product = (
        db.query(Product)
        .filter(Product.id == cart_item.product_id)
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than 0"
        )

    if quantity > product.stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough stock available"
        )

    cart_item.quantity = quantity

    db.commit()
    db.refresh(cart)

    return build_cart_response(cart)


# ============================================================
# REMOVE CART ITEM
# ============================================================

@router.delete(
    "/items/{item_id}"
)
def remove_cart_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    cart = (
        db.query(Cart)
        .filter(Cart.user_id == current_user.id)
        .first()
    )

    if cart is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )

    cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.id == item_id,
            CartItem.cart_id == cart.id
        )
        .first()
    )

    if cart_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )

    db.delete(cart_item)
    db.commit()

    return {
        "message": "Cart item removed successfully"
    }