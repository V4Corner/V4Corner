from pathlib import Path
import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy import or_
from sqlalchemy.exc import OperationalError

from auth import get_password_hash, validate_password_strength
from config import settings
from database import Base, engine, SessionLocal
import models
from routers import blogs, auth, users, members, chat, announcements, calendar, verification, notices, stats, checkins, activities, uploads, comments, notifications, likes, favorites

logger = logging.getLogger(__name__)

app = FastAPI(title="V4Corner API")


def get_allowed_origins() -> list[str]:
    return [
        origin.strip()
        for origin in settings.ALLOWED_ORIGINS.split(",")
        if origin.strip()
    ]


def bootstrap_admin_user() -> None:
    """Create or promote the first admin when production env vars are provided."""
    required_values = {
        "ADMIN_USERNAME": settings.ADMIN_USERNAME,
        "ADMIN_EMAIL": settings.ADMIN_EMAIL,
        "ADMIN_PASSWORD": settings.ADMIN_PASSWORD,
    }
    configured_values = [value for value in required_values.values() if value]

    if not configured_values:
        return

    missing = [key for key, value in required_values.items() if not value]
    if missing:
        logger.warning("Admin bootstrap skipped; missing env vars: %s", ", ".join(missing))
        return

    assert settings.ADMIN_USERNAME is not None
    assert settings.ADMIN_EMAIL is not None
    assert settings.ADMIN_PASSWORD is not None

    db = SessionLocal()
    try:
        users = (
            db.query(models.User)
            .filter(
                or_(
                    models.User.username == settings.ADMIN_USERNAME,
                    models.User.email == settings.ADMIN_EMAIL,
                )
            )
            .all()
        )

        if len(users) > 1:
            logger.error(
                "Admin bootstrap skipped; username and email belong to different users"
            )
            return

        if users:
            user = users[0]
            changed = False
            if user.role != "admin":
                user.role = "admin"
                changed = True
            if settings.ADMIN_NICKNAME and user.nickname != settings.ADMIN_NICKNAME:
                user.nickname = settings.ADMIN_NICKNAME
                changed = True
            if changed:
                db.commit()
                logger.info("Promoted configured admin user: %s", user.username)
            return

        is_valid, error_msg = validate_password_strength(settings.ADMIN_PASSWORD)
        if not is_valid:
            logger.error("Admin bootstrap skipped; ADMIN_PASSWORD invalid: %s", error_msg)
            return

        user = models.User(
            username=settings.ADMIN_USERNAME,
            email=settings.ADMIN_EMAIL,
            password_hash=get_password_hash(settings.ADMIN_PASSWORD),
            nickname=settings.ADMIN_NICKNAME,
            role="admin",
        )
        db.add(user)
        db.commit()
        logger.info("Created configured admin user: %s", settings.ADMIN_USERNAME)
    finally:
        db.close()


# Allow configured frontend origins to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# 全局异常处理器，确保 CORS headers 被正确发送
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )


@app.on_event("startup")
async def startup_event() -> None:
    """Create database tables and uploads directory on startup.

    Add new models in backend/models and they will be included here automatically.
    """
    try:
        Base.metadata.create_all(bind=engine)
    except OperationalError as e:
        # Ignore errors about existing indexes (happens after branch merges)
        if "already exists" not in str(e):
            raise e
        logger.warning(f"Database initialization warning: {e}")

    bootstrap_admin_user()

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
