from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.routers.mentor_auth_router import router as mentor_auth
from src.routers.mentor_resume_router import router as mentor_resume
from src.routers.user_auth_router import router as user_auth
from src.routers.feed_router import router as feed
from src.routers.avatar_router import router as avatar
from src.setup import setup

app = FastAPI(title="JWT Authentication API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev server default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Монтируем папку для статических файлов (аватарок)
app.mount("/static", StaticFiles(directory="static"), name="static")

setup()

# Include routers
app.include_router(user_auth, prefix="/auth/users")
app.include_router(mentor_auth, prefix="/auth/mentors")
app.include_router(mentor_resume, prefix="/mentors/resumes")
app.include_router(feed, prefix="/feed")
app.include_router(avatar, prefix="")  # Префикс пустой, так как пути уже содержат /me и /img


# Root endpoint
@app.get("/")
async def read_root():
    return {"message": "GOYDA API"}
