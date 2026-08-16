from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.category import Category
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductResponse


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# ============================================================
# CREATE PRODUCT
# ============================================================

@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Check category exists
    # --------------------------------------------------------

    category = (
        db.query(Category)
        .filter(
            Category.id == product_data.category_id
        )
        .first()
    )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )


    # --------------------------------------------------------
    # Create product
    # --------------------------------------------------------

    new_product = Product(
        name=product_data.name,
        description=product_data.description,
        price=product_data.price,
        stock=product_data.stock,
        size=product_data.size,
        color=product_data.color,
        image_url=product_data.image_url,
        category_id=product_data.category_id,

        # New products are active by default
        is_active=True
    )


    db.add(new_product)

    db.commit()

    db.refresh(new_product)


    return new_product


# ============================================================
# GET ALL ACTIVE PRODUCTS
# ============================================================

@router.get(
    "/",
    response_model=list[ProductResponse]
)
def get_products(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):

    products = (
        db.query(Product)
        .filter(
            Product.is_active == True
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

    return products


# ============================================================
# SEARCH ACTIVE PRODUCTS
# ============================================================

@router.get(
    "/search",
    response_model=list[ProductResponse]
)
def search_products(
    name: str,
    db: Session = Depends(get_db)
):

    products = (
        db.query(Product)
        .filter(
            Product.is_active == True
        )
        .filter(
            Product.name.ilike(
                f"%{name}%"
            )
        )
        .all()
    )

    return products


# ============================================================
# GET ACTIVE PRODUCTS BY CATEGORY
# ============================================================

@router.get(
    "/category/{category_id}",
    response_model=list[ProductResponse]
)
def get_products_by_category(
    category_id: int,
    db: Session = Depends(get_db)
):

    products = (
        db.query(Product)
        .filter(
            Product.category_id == category_id
        )
        .filter(
            Product.is_active == True
        )
        .all()
    )

    return products


# ============================================================
# GET SINGLE ACTIVE PRODUCT
# ============================================================

@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = (
        db.query(Product)
        .filter(
            Product.id == product_id
        )
        .first()
    )


    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )


    # --------------------------------------------------------
    # Don't show inactive products to customers
    # --------------------------------------------------------

    if not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )


    return product


# ============================================================
# UPDATE PRODUCT
# ============================================================

@router.put(
    "/{product_id}",
    response_model=ProductResponse
)
def update_product(
    product_id: int,
    product_data: ProductCreate,
    db: Session = Depends(get_db)
):

    product = (
        db.query(Product)
        .filter(
            Product.id == product_id
        )
        .first()
    )


    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )


    # --------------------------------------------------------
    # Check category exists
    # --------------------------------------------------------

    category = (
        db.query(Category)
        .filter(
            Category.id == product_data.category_id
        )
        .first()
    )


    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )


    # --------------------------------------------------------
    # Update product information
    # --------------------------------------------------------

    product.name = product_data.name

    product.description = product_data.description

    product.price = product_data.price

    product.stock = product_data.stock

    product.size = product_data.size

    product.color = product_data.color

    product.image_url = product_data.image_url

    product.category_id = product_data.category_id


    db.commit()

    db.refresh(product)


    return product


# ============================================================
# DEACTIVATE PRODUCT
# ============================================================

@router.delete(
    "/{product_id}"
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = (
        db.query(Product)
        .filter(
            Product.id == product_id
        )
        .first()
    )


    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )


    # --------------------------------------------------------
    # SOFT DELETE
    #
    # We don't physically delete the product because
    # cart_items and order_items may reference it.
    # --------------------------------------------------------

    product.is_active = False


    db.commit()

    db.refresh(product)


    return {
        "message": "Product deactivated successfully",
        "product_id": product.id
    }