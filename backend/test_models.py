"""
测试脚本：验证 Conversation 和 Message 模型定义
"""

# 测试导入
try:
    from models.conversation import Conversation
    from models.message import Message
    print("✓ Models imported successfully")
except Exception as e:
    print(f"✗ Import failed: {e}")
    exit(1)

# 测试schemas导入
try:
    from schemas.chat import (
        ConversationCreate,
        ConversationUpdate,
        ConversationRead,
        MessageCreate,
        MessageRead,
        StreamChunk
    )
    print("✓ Schemas imported successfully")
except Exception as e:
    print(f"✗ Schema import failed: {e}")
    exit(1)

# 测试路由导入
try:
    from routers import chat
    print("✓ Chat router imported successfully")
except Exception as e:
    print(f"✗ Router import failed (expected if dependencies not installed): {e}")

print("\n✅ All model and schema definitions are valid!")
print("\n📝 Next steps:")
print("1. Install dependencies: pip install -r requirements.txt")
print("2. Start backend: uvicorn main:app --reload")
print("3. Test API: http://localhost:8000/docs")
