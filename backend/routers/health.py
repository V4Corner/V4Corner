from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def healthcheck() -> dict[str, str]:
    """Quick health probe used by Docker and monitoring."""
    return {"status": "ok"}
