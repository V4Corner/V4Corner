"""
修复重复索引问题

运行方式：
    cd backend
    python fix_duplicate_indexes.py
"""

from database import SessionLocal, engine
from sqlalchemy import text
import sys

def fix_indexes():
    """删除并重建索引"""
    db = SessionLocal()
    try:
        with db.begin():
            # 删除冲突的索引
            indexes_to_drop = [
                'idx_user_id',  # favorite_folders 表的索引（与 users 表冲突）
                'idx_folder_id',  # favorites 表的索引（可能与其他表冲突）
            ]

            for index_name in indexes_to_drop:
                try:
                    # 检查索引是否存在
                    result = db.execute(text(
                        "SELECT name FROM sqlite_master WHERE type='index' AND name=:name"
                    ), {"name": index_name})
                    exists = result.fetchone() is not None

                    if exists:
                        print(f"删除索引: {index_name}")
                        db.execute(text(f"DROP INDEX IF EXISTS {index_name}"))
                    else:
                        print(f"索引不存在: {index_name}")
                except Exception as e:
                    print(f"删除索引 {index_name} 时出错: {e}")

        print("✅ 索引修复成功！")
        print("\n请重启后端服务，将自动创建正确的新索引")
        return True

    except Exception as e:
        print(f"❌ 修复失败: {e}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 50)
    print("修复重复索引问题")
    print("=" * 50)

    success = fix_indexes()

    if not success:
        sys.exit(1)
