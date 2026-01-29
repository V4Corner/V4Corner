#!/usr/bin/env python3
"""
V4Corner 环境测试脚本
验证所有依赖是否正确安装和配置
"""

import sys
import os
import importlib
from pathlib import Path

def test_python_version():
    """测试 Python 版本"""
    version = sys.version_info
    print(f"[OK] Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 10):
        print("[FAIL] Python version too low, need 3.10+")
        return False
    return True

def test_dependencies():
    """测试 Python 依赖"""
    required_packages = [
        'fastapi',
        'uvicorn', 
        'sqlalchemy',
        'pydantic',
        'pydantic_settings',
        'python_jose',
        'passlib',
        'bcrypt',
        'python_multipart',
        'email_validator',
        'openai'
    ]
    
    failed = []
    for package in required_packages:
        try:
            # 处理包名中的下划线
            module_name = package.replace('_', '')
            if package == 'pydantic_settings':
                module_name = 'pydantic_settings'
            elif package == 'python_jose':
                module_name = 'jose'
            elif package == 'python_multipart':
                module_name = 'multipart'
            elif package == 'email_validator':
                module_name = 'email_validator'
                
            importlib.import_module(module_name)
            print(f"[OK] {package}")
        except ImportError:
            print(f"[FAIL] {package} - not installed")
            failed.append(package)
    
    return len(failed) == 0

def test_config_files():
    """测试配置文件"""
    backend_dir = Path(__file__).parent
    
    # 检查 .env 文件
    env_file = backend_dir / '.env'
    if env_file.exists():
        print("[OK] .env file exists")
    else:
        print("[WARN] .env file not found (will use default config)")
        print("       Tip: Copy .env.example to .env and configure AI API Key")
    
    # 检查数据库文件
    db_file = backend_dir / 'v4corner.db'
    if db_file.exists():
        print("[OK] Database file exists")
    else:
        print("[WARN] Database file not found (will be created on first run)")
    
    return True

def test_ai_service():
    """测试 AI 服务"""
    try:
        from services.ai_service import AIService
        ai_service = AIService()
        print(f"[OK] AI service initialized successfully, using: {ai_service.provider}")
        
        if ai_service.provider == "mock":
            print("       Note: Currently in mock mode, configure API Key for real AI")
        
        return True
    except Exception as e:
        print(f"[FAIL] AI service initialization failed: {e}")
        return False

def test_database():
    """测试数据库连接"""
    try:
        from database import engine, Base
        from models import user, blog, conversation, message
        
        # 尝试连接数据库
        with engine.connect() as conn:
            print("[OK] Database connection successful")
        
        # 检查表是否可以创建
        Base.metadata.create_all(bind=engine)
        print("[OK] Database table structure normal")
        
        return True
    except Exception as e:
        print(f"[FAIL] Database test failed: {e}")
        return False

def main():
    """主测试函数"""
    print("=" * 50)
    print("  V4Corner Environment Test")
    print("=" * 50)
    print()
    
    tests = [
        ("Python Version", test_python_version),
        ("Python Dependencies", test_dependencies),
        ("Configuration Files", test_config_files),
        ("AI Service", test_ai_service),
        ("Database", test_database),
    ]
    
    results = []
    for name, test_func in tests:
        print(f"\n[TEST] {name}:")
        try:
            result = test_func()
            results.append(result)
        except Exception as e:
            print(f"[FAIL] Test failed: {e}")
            results.append(False)
    
    print("\n" + "=" * 50)
    print("  Test Results")
    print("=" * 50)
    
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print(f"[SUCCESS] All tests passed ({passed}/{total})")
        print("\n[READY] Environment is correctly configured!")
        print("\nStartup commands:")
        print("  uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        return 0
    else:
        print(f"[WARNING] {total - passed} tests failed ({passed}/{total})")
        print("\n[ERROR] Please fix the above issues and retest")
        return 1

if __name__ == "__main__":
    sys.exit(main())