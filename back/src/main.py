from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routers.mentor_auth_router import router as mentor_auth
from src.routers.mentor_resume_router import router as mentor_resume
from src.routers.user_auth_router import router as user_auth
from src.setup import setup

app = FastAPI(title="JWT Authentication API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev server default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup()

# Include routers
app.include_router(user_auth, prefix="/auth/users")
app.include_router(mentor_auth, prefix="/auth/mentors")
app.include_router(mentor_resume, prefix="/mentors/resumes")


# Root endpoint
@app.get("/")
async def read_root():
    return {"message": "GOYDA API"}
