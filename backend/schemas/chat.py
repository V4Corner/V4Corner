from datetime import datetime
from pydantic import BaseModel, Field


# ============= Conversation Schemas =============

class ConversationBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)


class ConversationCreate(ConversationBase):
    """创建对话时的输入"""
    pass


class ConversationUpdate(BaseModel):
    """更新对话标题"""
    title: str = Field(..., min_length=1, max_length=100)


class ConversationListItem(BaseModel):
    """对话列表项"""
    id: int
    title: str
    last_message: str | None = None
    message_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationRead(BaseModel):
    """对话详情"""
    id: int
    title: str
    message_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationListResponse(BaseModel):
    """对话列表响应（分页）"""
    total: int
    page: int
    size: int
    items: list[ConversationListItem]


# ============= Message Schemas =============

class MessageBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)


class MessageCreate(MessageBase):
    """发送消息时的输入"""
    pass


class MessageListItem(BaseModel):
    """消息列表项"""
    id: int
    role: str  # 'user' or 'assistant'
    content: str
    tokens_used: int | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class MessageRead(BaseModel):
    """消息详情"""
    id: int
    role: str
    content: str
    tokens_used: int | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    """消息列表响应（分页）"""
    total: int
    page: int
    size: int
    items: list[MessageListItem]


# ============= Feedback Schemas =============

class MessageFeedbackCreate(BaseModel):
    """消息反馈"""
    feedback: str = Field(..., pattern="^(helpful|not_helpful)$")


class MessageFeedbackResponse(BaseModel):
    """反馈响应"""
    message: str


# ============= Export Schemas =============

class ConversationExportRequest(BaseModel):
    """导出对话请求"""
    format: str = Field(..., pattern="^(markdown|json|txt)$")


class ConversationExportResponse(BaseModel):
    """导出对话响应"""
    content: str
    filename: str


# ============= Stream Schemas =============

class StreamChunk(BaseModel):
    """SSE 流式数据块"""
    id: int
    role: str
    content: str
    delta: str  # 新增的内容片段
