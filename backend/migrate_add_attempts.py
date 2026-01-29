"""
数据库迁移脚本：为 verification_codes 表添加 attempts 字段

运行方式：
    cd backend
    python migrate_add_attempts.py
"""

import sqlite3
import os
import sys
from pathlib import Path

def migrate():
    """执行数据库迁移"""
    db_path = Path(__file__).parent / "v4corner.db"

    if not db_path.exists():
        print(f"[ERROR] Database file not found: {db_path}")
        return False

    try:
        # 连接数据库
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # 检查 attempts 列是否已存在
        cursor.execute("PRAGMA table_info(verification_codes)")
        columns = [col[1] for col in cursor.fetchall()]

        if 'attempts' in columns:
            print("[OK] attempts column already exists, no migration needed")
            conn.close()
            return True

        # 添加 attempts 列
        print("[INFO] Adding attempts column...")
        cursor.execute(
            "ALTER TABLE verification_codes "
            "ADD COLUMN attempts INTEGER DEFAULT 0 NOT NULL"
        )

        # 更新现有记录
        print("[INFO] Updating existing records...")
        cursor.execute(
            "UPDATE verification_codes SET attempts = 0 WHERE attempts IS NULL"
        )

        # 提交更改
        conn.commit()

        # 验证迁移结果
        cursor.execute("PRAGMA table_info(verification_codes)")
        columns = [col[1] for col in cursor.fetchall()]
        if 'attempts' in columns:
            print("[OK] Migration successful! attempts column added to verification_codes table")
            print(f"   - Column type: INTEGER")
            print(f"   - Default value: 0")
            print(f"   - Constraint: NOT NULL")
        else:
            print("[ERROR] Migration failed: attempts column was not added")
            return False

        conn.close()
        return True

    except sqlite3.Error as e:
        print(f"[ERROR] Database error: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Database Migration: Add Verification Code Attempts Column")
    print("=" * 60)
    print()

    success = migrate()

    print()
    print("=" * 60)
    if success:
        print("[OK] Migration completed!")
        print()
        print("Notes:")
        print("   - Each verification code allows max 3 attempts")
        print("   - After 3 failed attempts, the code becomes invalid")
        print("   - User needs to request a new verification code")
        print()
        print("Please restart the backend service to apply changes")
    else:
        print("[ERROR] Migration failed! Please check error messages above")
    print("=" * 60)
