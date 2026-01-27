"""
数据库迁移脚本：添加 users.role 字段

运行方式：
cd backend
python migrate_add_user_role.py
"""

import os
import sqlite3


def migrate():
    db_path = os.path.join(os.path.dirname(__file__), "v4corner.db")

    if not os.path.exists(db_path):
        print(f"Database file not found: {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        cursor.execute("PRAGMA table_info(users)")
        columns = [col[1] for col in cursor.fetchall()]

        if "role" in columns:
            print("role column already exists, no migration needed")
            return

        print("Adding role column...")
        cursor.execute("""
            ALTER TABLE users
            ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'student'
        """)
        conn.commit()

        cursor.execute("""
            UPDATE users
            SET role = 'student'
            WHERE role IS NULL OR role = ''
        """)
        conn.commit()

        cursor.execute("PRAGMA table_info(users)")
        columns = [col[1] for col in cursor.fetchall()]
        if "role" in columns:
            print("[OK] Verified: role column exists")
        else:
            print("[ERROR] Verification failed: role column not found")

        cursor.execute("SELECT role, COUNT(*) FROM users GROUP BY role")
        role_count = cursor.fetchall()
        print("Role distribution:")
        for role, count in role_count:
            print(f"  {role}: {count}")

        print("\nMigration completed successfully!")

    except Exception as exc:
        print(f"Migration failed: {exc}")
        conn.rollback()
    finally:
        conn.close()


if __name__ == "__main__":
    migrate()
