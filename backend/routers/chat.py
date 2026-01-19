# AI对话相关路由

import asyncio
import json
import logging
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

import dependencies, models, schemas, auth
from services import ai_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["AI对话"])


# ============= Conversation 接口 =============

@router.get("/conversations", response_model=schemas.ConversationListResponse)
async def list_conversations(
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession,
    q: Optional[str] = Query(None, description="搜索关键词"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量")
):
    """获取用户的对话列表"""
    try:
        logger.info(f"User {current_user.id} requesting conversations list")

        # 查询当前用户的对话
        query = db.query(models.Conversation).filter(
            models.Conversation.user_id == current_user.id
        )

        # 搜索过滤
        if q:
            query = query.filter(models.Conversation.title.contains(q))

        # 统计总数
        total = query.count()

        # 按更新时间倒序，分页查询
        conversations = query.order_by(
            models.Conversation.updated_at.desc()
        ).offset((page - 1) * size).limit(size).all()

        # 构造响应
        items = []
        for conv in conversations:
            # 获取最后一条消息
            last_message = db.query(models.Message).filter(
                models.Message.conversation_id == conv.id
            ).order_by(models.Message.created_at.desc()).first()

            # 生成最后消息预览（最多50字）
            last_msg_preview = None
            if last_message:
                content = last_message.content
                last_msg_preview = content[:50] + "..." if len(content) > 50 else content

            # 统计消息数量
            message_count = db.query(func.count(models.Message.id)).filter(
                models.Message.conversation_id == conv.id
            ).scalar()

            items.append(schemas.ConversationListItem(
                id=conv.id,
                title=conv.title,
                last_message=last_msg_preview,
                message_count=message_count or 0,
                created_at=conv.created_at,
                updated_at=conv.updated_at
            ))

        return schemas.ConversationListResponse(
            total=total,
            page=page,
            size=size,
            items=items
        )
    except Exception as e:
        logger.error(f"Error in list_conversations: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取对话列表失败: {str(e)}"
        )


@router.post("/conversations", status_code=status.HTTP_201_CREATED, response_model=schemas.ConversationRead)
async def create_conversation(
    conversation_data: schemas.ConversationCreate,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """创建新对话"""
    # 如果没有提供标题，使用默认标题
    title = conversation_data.title if conversation_data.title else "新对话"

    conversation = models.Conversation(
        user_id=current_user.id,
        title=title
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return schemas.ConversationRead(
        id=conversation.id,
        title=conversation.title,
        message_count=0,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at
    )


@router.get("/conversations/{conversation_id}", response_model=schemas.ConversationRead)
async def get_conversation(
    conversation_id: int,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """获取对话详情"""
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="对话不存在"
        )

    # 权限检查
    if conversation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限访问此对话"
        )

    # 统计消息数量
    message_count = db.query(func.count(models.Message.id)).filter(
        models.Message.conversation_id == conversation_id
    ).scalar()

    return schemas.ConversationRead(
        id=conversation.id,
        title=conversation.title,
        message_count=message_count or 0,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at
    )


@router.put("/conversations/{conversation_id}", response_model=schemas.ConversationRead)
async def update_conversation(
    conversation_id: int,
    conversation_data: schemas.ConversationUpdate,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """重命名对话"""
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="对话不存在"
        )

    # 权限检查
    if conversation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限修改此对话"
        )

    # 更新标题
    conversation.title = conversation_data.title
    db.commit()
    db.refresh(conversation)

    # 统计消息数量
    message_count = db.query(func.count(models.Message.id)).filter(
        models.Message.conversation_id == conversation_id
    ).scalar()

    return schemas.ConversationRead(
        id=conversation.id,
        title=conversation.title,
        message_count=message_count or 0,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at
    )


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: int,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """删除对话"""
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="对话不存在"
        )

    # 权限检查
    if conversation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限删除此对话"
        )

    # 删除对话（级联删除消息）
    db.delete(conversation)
    db.commit()

    return None


# ============= Message 接口 =============

@router.get("/conversations/{conversation_id}/messages", response_model=schemas.MessageListResponse)
async def list_messages(
    conversation_id: int,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession,
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(50, ge=1, le=100, description="每页数量")
):
    """获取对话的消息列表"""
    # 验证对话存在且属于当前用户
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="对话不存在"
        )

    if conversation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限访问此对话"
        )

    # 查询消息
    query = db.query(models.Message).filter(
        models.Message.conversation_id == conversation_id
    )

    # 统计总数
    total = query.count()

    # 按时间正序，分页查询
    messages = query.order_by(
        models.Message.created_at.asc()
    ).offset((page - 1) * size).limit(size).all()

    # 构造响应
    items = [
        schemas.MessageListItem(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            tokens_used=msg.tokens_used,
            created_at=msg.created_at
        )
        for msg in messages
    ]

    return schemas.MessageListResponse(
        total=total,
        page=page,
        size=size,
        items=items
    )


async def generate_ai_response_stream(
    conversation_id: int,
    message_id: int,
    messages: list[dict]
):
    """
    AI 流式响应生成
    使用真实 AI API 或模拟模式（取决于配置）

    Args:
        conversation_id: 对话 ID
        message_id: AI 消息 ID
        messages: 对话历史，格式：[{"role": "user", "content": "..."}]
    """
    accumulated_content = ""

    try:
        # 调用 AI 服务生成流式回复
        async for delta in ai_service.generate_response(messages, stream=True):
            accumulated_content += delta

            chunk = schemas.StreamChunk(
                id=message_id,
                role="assistant",
                content=accumulated_content,
                delta=delta
            )

            yield f"data: {chunk.model_dump_json()}\n\n"

        yield "data: [DONE]\n\n"

    except Exception as e:
        # 如果 AI 调用失败，返回错误信息
        error_message = f"抱歉，AI 服务调用失败：{str(e)}"

        chunk = schemas.StreamChunk(
            id=message_id,
            role="assistant",
            content=error_message,
            delta=error_message
        )

        yield f"data: {chunk.model_dump_json()}\n\n"
        yield "data: [DONE]\n\n"


@router.post("/conversations/{conversation_id}/messages", status_code=status.HTTP_201_CREATED, response_model=schemas.MessageRead)
async def send_message(
    conversation_id: int,
    message_data: schemas.MessageCreate,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession,
    stream: bool = Query(False, description="是否使用流式输出")
):
    """发送消息（支持流式输出）"""

    # 验证对话存在且属于当前用户
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="对话不存在"
        )

    if conversation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限访问此对话"
        )

    # 保存用户消息
    user_message = models.Message(
        conversation_id=conversation_id,
        role="user",
        content=message_data.content
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    # 获取对话历史（用于上下文）
    history_messages = db.query(models.Message).filter(
        models.Message.conversation_id == conversation_id
    ).order_by(models.Message.created_at.asc()).limit(20).all()  # 限制历史消息数量

    # 构造 AI 调用的消息列表
    ai_messages = [
        {"role": msg.role, "content": msg.content}
        for msg in history_messages
    ]

    # 生成 AI 回复
    if stream:
        # 流式输出
        async def generate():
            # 先生成一个 AI 消息记录
            ai_message = models.Message(
                conversation_id=conversation_id,
                role="assistant",
                content=""
            )
            db.add(ai_message)
            db.commit()
            db.refresh(ai_message)

            # 调用 AI 生成流式响应
            full_content = ""
            async for chunk in generate_ai_response_stream(conversation_id, ai_message.id, ai_messages):
                yield chunk
                # 提取完整内容（从 JSON 中解析）
                if chunk.startswith("data: ") and "[DONE]" not in chunk:
                    try:
                        chunk_data = json.loads(chunk[6:])
                        full_content = chunk_data.get("content", "")
                    except:
                        pass

            # 更新 AI 消息的完整内容
            ai_message.content = full_content
            ai_message.tokens_used = len(full_content)  # 简单估算
            db.commit()

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
    else:
        # 非流式输出
        ai_response_text = ""
        async for delta in ai_service.generate_response(ai_messages, stream=False):
            ai_response_text += delta

        ai_message = models.Message(
            conversation_id=conversation_id,
            role="assistant",
            content=ai_response_text,
            tokens_used=len(ai_response_text)  # 简单估算 Token 数
        )
        db.add(ai_message)

        # 更新对话的 updated_at
        conversation.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(ai_message)

        return schemas.MessageRead(
            id=ai_message.id,
            role=ai_message.role,
            content=ai_message.content,
            tokens_used=ai_message.tokens_used,
            created_at=ai_message.created_at
        )


@router.post("/conversations/{conversation_id}/messages/regenerate", response_model=schemas.MessageRead)
async def regenerate_message(
    conversation_id: int,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """重新生成最后一条 AI 消息"""

    # 验证对话存在且属于当前用户
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="对话不存在"
        )

    if conversation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限访问此对话"
        )

    # 获取最后一条 AI 消息
    last_ai_message = db.query(models.Message).filter(
        models.Message.conversation_id == conversation_id,
        models.Message.role == "assistant"
    ).order_by(models.Message.created_at.desc()).first()

    if not last_ai_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="没有可重新生成的 AI 消息"
        )

    # 获取该 AI 消息之前的所有消息（作为上下文）
    history_messages = db.query(models.Message).filter(
        models.Message.conversation_id == conversation_id,
        models.Message.created_at < last_ai_message.created_at
    ).order_by(models.Message.created_at.asc()).all()

    # 构造 AI 调用的消息列表
    ai_messages = [
        {"role": msg.role, "content": msg.content}
        for msg in history_messages
    ]

    # 重新生成内容（使用真实 AI API）
    new_response_text = ""
    async for delta in ai_service.generate_response(ai_messages, stream=False):
        new_response_text += delta

    # 更新消息
    last_ai_message.content = new_response_text
    last_ai_message.tokens_used = len(new_response_text)
    db.commit()
    db.refresh(last_ai_message)

    return schemas.MessageRead(
        id=last_ai_message.id,
        role=last_ai_message.role,
        content=last_ai_message.content,
        tokens_used=last_ai_message.tokens_used,
        created_at=last_ai_message.created_at
    )


@router.post("/conversations/{conversation_id}/messages/{message_id}/feedback", response_model=schemas.MessageFeedbackResponse)
async def submit_feedback(
    conversation_id: int,
    message_id: int,
    feedback_data: schemas.MessageFeedbackCreate,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """对 AI 消息进行反馈"""

    # 验证对话存在且属于当前用户
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="对话不存在"
        )

    if conversation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限访问此对话"
        )

    # 获取消息
    message = db.query(models.Message).filter(
        models.Message.id == message_id,
        models.Message.conversation_id == conversation_id
    ).first()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="消息不存在"
        )

    # 只能对 AI 消息进行反馈
    if message.role != "assistant":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只能对 AI 消息进行反馈"
        )

    # 保存反馈
    message.feedback = feedback_data.feedback
    db.commit()

    return schemas.MessageFeedbackResponse(message="反馈已记录")


@router.post("/conversations/{conversation_id}/export", response_model=schemas.ConversationExportResponse)
async def export_conversation(
    conversation_id: int,
    export_data: schemas.ConversationExportRequest,
    current_user: dependencies.CurrentUser,
    db: dependencies.DbSession
):
    """导出对话"""

    # 验证对话存在且属于当前用户
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="对话不存在"
        )

    if conversation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限访问此对话"
        )

    # 获取所有消息
    messages = db.query(models.Message).filter(
        models.Message.conversation_id == conversation_id
    ).order_by(models.Message.created_at.asc()).all()

    # 根据格式生成内容
    if export_data.format == "markdown":
        content = f"# {conversation.title}\n\n"
        content += f"**对话时间**：{conversation.created_at.strftime('%Y-%m-%d %H:%M')}\n\n"
        content += "---\n\n"

        for msg in messages:
            role_name = "用户" if msg.role == "user" else "AI"
            content += f"## {role_name}\n\n{msg.content}\n\n---\n\n"

        filename = f"{conversation.title}.md"

    elif export_data.format == "json":
        messages_data = [
            {
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat()
            }
            for msg in messages
        ]

        content = json.dumps({
            "title": conversation.title,
            "created_at": conversation.created_at.isoformat(),
            "messages": messages_data
        }, ensure_ascii=False, indent=2)

        filename = f"{conversation.title}.json"

    else:  # txt
        content = f"{conversation.title}\n"
        content += f"对话时间：{conversation.created_at.strftime('%Y-%m-%d %H:%M')}\n"
        content += "=" * 50 + "\n\n"

        for msg in messages:
            role_name = "用户" if msg.role == "user" else "AI"
            content += f"[{role_name}] {msg.created_at.strftime('%H:%M:%S')}\n"
            content += f"{msg.content}\n\n"

        filename = f"{conversation.title}.txt"

    return schemas.ConversationExportResponse(
        content=content,
        filename=filename
    )
