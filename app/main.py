from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import text

from app.database import engine

from app.routers.auth import router as auth_router
from app.routers.category import router as category_router
from app.routers.product import router as product_router
from app.routers.cart import router as cart_router
from app.routers.order import router as order_router
from app.routers.user import router as user_router


app = FastAPI(
    title="KAPRA E-Commerce API",
    description="Backend API for KAPRA clothing e-commerce application",
    version="1.0.0"
)


# ============================================================
# API ROUTERS
# ============================================================

app.include_router(auth_router)
app.include_router(category_router)
app.include_router(product_router)
app.include_router(cart_router)
app.include_router(order_router)
app.include_router(user_router)


# ============================================================
# FRONTEND STATIC FILES
# ============================================================

app.mount(
    "/static",
    StaticFiles(directory="frontend"),
    name="static"
)


# ============================================================
# HOME PAGE
# ============================================================

@app.get("/", include_in_schema=False)
def home():
    return FileResponse(
        "frontend/index.html"
    )


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():

    try:

        with engine.connect() as connection:

            result = connection.execute(
                text("SELECT 1")
            )

            result.fetchone()


        return {
            "status": "healthy",
            "database": "connected"
        }


    except Exception as e:

        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }