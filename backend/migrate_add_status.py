"""
数据库迁移脚本：添加 blogs.status 字段

运行方式：
cd backend
python migrate_add_status.py
"""

import sqlite3
import os

def migrate():
    # 数据库文件路径
    db_path = os.path.join(os.path.dirname(__file__), 'v4corner.db')

    if not os.path.exists(db_path):
        print(f"Database file not found: {db_path}")
        return

    # 连接数据库
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # 检查 status 列是否已存在
        cursor.execute("PRAGMA table_info(blogs)")
        columns = [col[1] for col in cursor.fetchall()]

        if 'status' in columns:
            print("status column already exists, no migration needed")
            return

        # 添加 status 列
        print("Adding status column...")
        cursor.execute("""
            ALTER TABLE blogs
            ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'published'
        """)
        conn.commit()
        print("[OK] Successfully added status column")

        # 验证
        cursor.execute("PRAGMA table_info(blogs)")
        columns = [col[1] for col in cursor.fetchall()]
        if 'status' in columns:
            print("[OK] Verified: status column exists")
        else:
            print("[ERROR] Verification failed: status column not found")

        # 创建索引
        print("\nCreating index...")
        try:
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_author_status ON blogs(author_id, status)")
            conn.commit()
            print("[OK] Successfully created idx_author_status index")
        except Exception as e:
            print(f"Index creation warning: {e}")

        # 查看当前数据
        cursor.execute("SELECT COUNT(*) FROM blogs")
        total = cursor.fetchone()[0]
        print(f"\nTotal blogs in database: {total}")

        cursor.execute("SELECT status, COUNT(*) FROM blogs GROUP BY status")
        status_count = cursor.fetchall()
        print("Status distribution:")
        for status, count in status_count:
            print(f"  {status}: {count}")

        print("\nMigration completed successfully!")

    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
