from fastapi import FastAPI

from src.routers.user_auth_router import router as user_auth
from src.routers.mentor_auth_router import router as mentor_auth
from src.setup import setup

app = FastAPI(title="JWT Authentication API")

setup()

# Include routers
app.include_router(user_auth, prefix="/auth/users")
app.include_router(mentor_auth, prefix="/auth/mentors")


# Root endpoint
@app.get("/")
async def read_root():
    return {"message": "GOYDA API"}
