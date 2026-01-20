from pathlib import Path
import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from database import Base, engine
from routers import blogs, auth, users, members, chat, announcements, calendar

logger = logging.getLogger(__name__)

app = FastAPI(title="V4Corner API")

# Allow frontend dev server to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 全局异常处理器，确保 CORS headers 被正确发送
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"内部服务器错误: {str(exc)}"}
    )


@app.on_event("startup")
async def startup_event() -> None:
    """Create database tables and uploads directory on startup.

    Add new models in backend/models and they will be included here automatically.
    """
    Base.metadata.create_all(bind=engine)

    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads/avatars")
    upload_dir.mkdir(parents=True, exist_ok=True)


# Routers keep related endpoints grouped. Add new modules under routers/.
app.include_router(auth.router)
app.include_router(blogs.router)
app.include_router(users.router)
app.include_router(members.router)
app.include_router(chat.router)
app.include_router(announcements.router)
app.include_router(calendar.router)

# Static file serving for uploaded files (avatars)
app.mount("/static", StaticFiles(directory="uploads"), name="static")
