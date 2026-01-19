"""
测试 AI 模式切换
验证：无 API Key 时使用模拟模式，有 API Key 时使用真实 AI
"""

import os
import sys

# 测试不同配置下的行为
test_cases = [
    {
        "name": "测试1：无任何配置（模拟模式）",
        "env": {},
        "expected": "mock"
    },
    {
        "name": "测试2：配置 OpenAI（真实 AI）",
        "env": {"OPENAI_API_KEY": "sk-test-key"},
        "expected": "openai"
    },
    {
        "name": "测试3：配置 DeepSeek（真实 AI）",
        "env": {"DEEPSEEK_API_KEY": "sk-test-key"},
        "expected": "deepseek"
    },
    {
        "name": "测试4：启用 Ollama（本地 AI）",
        "env": {"ENABLE_OLLAMA": "True"},
        "expected": "ollama"
    },
    {
        "name": "测试5：配置多个（优先级选择）",
        "env": {
            "OPENAI_API_KEY": "sk-test-key",
            "DEEPSEEK_API_KEY": "sk-test-key"
        },
        "expected": "openai"  # OpenAI 优先级更高
    }
]

def run_test(test_case):
    """Run single test"""
    print(f"\n{'='*60}")
    print(f"{test_case['name']}")
    print(f"{'='*60}")

    # Clear existing env vars
    for key in list(os.environ.keys()):
        if key.startswith(('OPENAI_', 'ANTHROPIC_', 'GEMINI_', 'DEEPSEEK_',
                           'ZHIPUAI_', 'QIANFAN_', 'DASHSCOPE_', 'OLLAMA_',
                           'ENABLE_', 'AI_')):
            del os.environ[key]

    # Set test env vars
    for key, value in test_case['env'].items():
        os.environ[key] = value
        print(f"  {key}={value}")

    # Import config (need to reload modules)
    try:
        # Delete loaded modules
        if 'config' in sys.modules:
            del sys.modules['config']
        if 'services.ai_service' in sys.modules:
            del sys.modules['services.ai_service']
        if 'services' in sys.modules:
            del sys.modules['services']

        from config import get_primary_ai_provider, get_ai_providers

        providers = get_ai_providers()
        primary = get_primary_ai_provider()

        print(f"\n  Available providers: {providers if providers else ['None']}")
        print(f"  Selected provider: {primary if primary else 'None (will use mock mode)'}")

        # 判断实际使用的模式
        actual_mode = primary if primary else "mock"

        if actual_mode == test_case['expected']:
            print(f"  [PASS] Expected: {test_case['expected']}, Actual: {actual_mode}")
            return True
        else:
            print(f"  [FAIL] Expected: {test_case['expected']}, Actual: {actual_mode}")
            return False

    except Exception as e:
        print(f"  [ERROR] Test error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("\n" + "="*60)
    print("  AI Mode Switching Test")
    print("="*60)

    results = []
    for test_case in test_cases:
        result = run_test(test_case)
        results.append((test_case['name'], result))

    # Summary
    print("\n" + "="*60)
    print("  Test Summary")
    print("="*60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"  {status}: {name}")

    print(f"\n  Total: {passed}/{total} passed")

    if passed == total:
        print("\n[SUCCESS] All tests passed! AI mode switching logic is correct.")
        return 0
    else:
        print("\n[WARNING] Some tests failed. Please check configuration logic.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
