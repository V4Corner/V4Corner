"""
数据库迁移脚本：为 blogs 表添加点赞和收藏字段

运行方式：
    cd backend
    python migrate_add_likes_favorites.py
"""

from database import SessionLocal, engine
from sqlalchemy import text
import sys

def migrate():
    """执行迁移"""
    db = SessionLocal()
    try:
        # 开始事务
        with db.begin():
            # 检查字段是否已存在
            result = db.execute(text("PRAGMA table_info(blogs)"))
            columns = [row[1] for row in result.fetchall()]

            # 添加 likes_count 字段
            if 'likes_count' not in columns:
                print("添加 likes_count 字段...")
                db.execute(text(
                    "ALTER TABLE blogs ADD COLUMN likes_count INTEGER DEFAULT 0"
                ))
            else:
                print("likes_count 字段已存在，跳过")

            # 添加 favorites_count 字段
            if 'favorites_count' not in columns:
                print("添加 favorites_count 字段...")
                db.execute(text(
                    "ALTER TABLE blogs ADD COLUMN favorites_count INTEGER DEFAULT 0"
                ))
            else:
                print("favorites_count 字段已存在，跳过")

        print("✅ 迁移成功！")
        return True

    except Exception as e:
        print(f"❌ 迁移失败: {e}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 50)
    print("开始迁移：添加点赞和收藏字段")
    print("=" * 50)

    success = migrate()

    if success:
        print("\n提示：重启后端服务后，新表将自动创建")
        print("新表：likes, favorite_folders, favorites")
    else:
        print("\n请检查错误信息并修复后重试")
        sys.exit(1)
