from pathlib import Path
import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from database import Base, engine
from routers import blogs, auth, users, members, chat, announcements, calendar, verification, notices, stats, checkins, activities, uploads, comments, notifications, likes, favorites

logger = logging.getLogger(__name__)

app = FastAPI(title="V4Corner API")

# Allow frontend dev server to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001", 
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
        "http://127.0.0.1:3004",
        "http://127.0.0.1:3005",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002", 
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:3005"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# 全局异常处理器，确保 CORS headers 被正确发送
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"}
    )


@app.on_event("startup")
async def startup_event() -> None:
    """Create database tables and uploads directory on startup.

    Add new models in backend/models and they will be included here automatically.
    """
    Base.metadata.create_all(bind=engine)

    # Create uploads directory if it doesn't exist
    upload_dirs = [
        Path("uploads/avatars"),
        Path("uploads/blog/images"),
        Path("uploads/blog/videos")
    ]
    for upload_dir in upload_dirs:
        upload_dir.mkdir(parents=True, exist_ok=True)


# Create uploads directory before mounting static files
Path("uploads").mkdir(exist_ok=True)

# Routers keep related endpoints grouped. Add new modules under routers/.
app.include_router(auth.router)
app.include_router(blogs.router)
app.include_router(favorites.router)
app.include_router(users.router)
app.include_router(members.router)
app.include_router(chat.router)
app.include_router(announcements.router)
app.include_router(calendar.router)
app.include_router(verification.router)
app.include_router(notices.router)
app.include_router(stats.router)
app.include_router(checkins.router)
app.include_router(activities.router)
app.include_router(uploads.router)
app.include_router(comments.router)
app.include_router(notifications.router)
app.include_router(likes.router)

# Static file serving for uploaded files (avatars)
app.mount("/static", StaticFiles(directory="uploads"), name="static")
