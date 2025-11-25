from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import blogs, health

app = FastAPI(title="V4Corner API")

# Allow frontend dev server to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event() -> None:
    """Create database tables on startup.

    Add new models in backend/models and they will be included here automatically.
    """
    Base.metadata.create_all(bind=engine)


# Routers keep related endpoints grouped. Add new modules under routers/.
app.include_router(health.router)
app.include_router(blogs.router)
