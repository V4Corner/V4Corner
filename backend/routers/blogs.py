from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import database
from ..models.blog import Blog
from ..schemas.blog import BlogCreate, BlogRead

router = APIRouter(prefix="/api/blogs", tags=["blogs"])


@router.get("", response_model=List[BlogRead])
async def list_blogs(db: Session = Depends(database.get_db)) -> List[BlogRead]:
    """Return all blogs sorted by newest first."""
    blogs = db.query(Blog).order_by(Blog.created_at.desc()).all()
    return blogs


@router.get("/{blog_id}", response_model=BlogRead)
async def get_blog(blog_id: int, db: Session = Depends(database.get_db)) -> BlogRead:
    """Return one blog by id."""
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog not found")
    return blog


@router.post("", response_model=BlogRead, status_code=status.HTTP_201_CREATED)
async def create_blog(payload: BlogCreate, db: Session = Depends(database.get_db)) -> BlogRead:
    """Create a new blog entry.

    Add validation in schemas/blog.py and extend fields as the project grows.
    """
    blog = Blog(**payload.model_dump())
    db.add(blog)
    db.commit()
    db.refresh(blog)
    return blog
