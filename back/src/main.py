from fastapi import FastAPI

from src.routers.auth_router import router as auth_router
from src.setup import setup

# Create FastAPI application
app = FastAPI(title="JWT Authentication API")

# Initialize application
setup()

# Include routers
app.include_router(auth_router, prefix="/api/auth")

# Root endpoint
@app.get("/")
async def read_root():
    return {
        "message": "Welcome to JWT Authentication API",
        "endpoints": {
            "Authentication": {
                "signup": "/api/auth/signup",
                "signin": "/api/auth/signin",
                "me": "/api/auth/me"
            }
        }
    }
