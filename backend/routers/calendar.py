# 班级日历相关路由

from datetime import date, datetime

from fastapi import APIRouter, HTTPException, Query, status

import dependencies, models, schemas

router = APIRouter(prefix="/api/calendar", tags=["班级日历"])


def _parse_month(month: str | None) -> tuple[date, date, str]:
    if month:
        try:
            parsed = datetime.strptime(month, "%Y-%m")
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="月份格式应为 YYYY-MM") from exc
        start_date = date(parsed.year, parsed.month, 1)
    else:
        today = date.today()
        start_date = date(today.year, today.month, 1)

    if start_date.month == 12:
        end_date = date(start_date.year + 1, 1, 1)
    else:
        end_date = date(start_date.year, start_date.month + 1, 1)

    month_str = f"{start_date.year:04d}-{start_date.month:02d}"
    return start_date, end_date, month_str


@router.get("/events", response_model=schemas.CalendarEventListResponse)
async def list_calendar_events(
    db: dependencies.DbSession,
    month: str | None = Query(None, description="月份（YYYY-MM）"),
):
    """获取班级日历活动"""
    start_date, end_date, month_str = _parse_month(month)

    events = (
        db.query(models.CalendarEvent)
        .filter(models.CalendarEvent.date >= start_date, models.CalendarEvent.date < end_date)
        .order_by(models.CalendarEvent.date.asc(), models.CalendarEvent.start_time.asc())
        .all()
    )

    return schemas.CalendarEventListResponse(
        month=month_str,
        items=[schemas.CalendarEventRead.model_validate(event) for event in events],
    )


@router.post("/events", response_model=schemas.CalendarEventRead, status_code=status.HTTP_201_CREATED)
async def create_calendar_event(
    payload: schemas.CalendarEventCreate,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession,
):
    """创建班级日历活动"""
    event = models.CalendarEvent(
        title=payload.title,
        date=payload.date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        location=payload.location,
        description=payload.description,
        is_all_day=payload.is_all_day,
        importance=payload.importance,
        created_by=current_user.id,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    return schemas.CalendarEventRead.model_validate(event)


@router.put("/events/{event_id}", response_model=schemas.CalendarEventRead)
async def update_calendar_event(
    event_id: int,
    payload: schemas.CalendarEventUpdate,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession,
):
    """更新班级日历活动"""
    event = db.query(models.CalendarEvent).filter(models.CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="活动不存在")

    if payload.title is not None:
        event.title = payload.title
    if payload.date is not None:
        event.date = payload.date
    if payload.start_time is not None:
        event.start_time = payload.start_time
    if payload.end_time is not None:
        event.end_time = payload.end_time
    if payload.location is not None:
        event.location = payload.location
    if payload.description is not None:
        event.description = payload.description
    if payload.is_all_day is not None:
        event.is_all_day = payload.is_all_day
    if payload.importance is not None:
        event.importance = payload.importance

    db.commit()
    db.refresh(event)

    return schemas.CalendarEventRead.model_validate(event)


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_calendar_event(
    event_id: int,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession,
):
    """删除班级日历活动"""
    event = db.query(models.CalendarEvent).filter(models.CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="活动不存在")

    db.delete(event)
    db.commit()

    return None
