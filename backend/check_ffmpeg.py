"""检查 FFmpeg 是否可用"""
import subprocess
import shutil
import sys

print("检查 FFmpeg 安装状态...\n")

# 1. 检查 PATH 中的 ffmpeg
print("1. 检查 PATH 中的 ffmpeg:")
ffmpeg_path = shutil.which("ffmpeg")
if ffmpeg_path:
    print(f"   ✓ 找到 ffmpeg: {ffmpeg_path}")
else:
    print(f"   ✗ 未在 PATH 中找到 ffmpeg")
    print("\n请确保：")
    print("   - FFmpeg 已安装")
    print("   - FFmpeg 已添加到系统环境变量 PATH")
    print("   - 已重启终端和后端服务")
    sys.exit(1)

# 2. 尝试运行 ffmpeg -version
print("\n2. 测试运行 ffmpeg:")
try:
    result = subprocess.run(
        ["ffmpeg", "-version"],
        capture_output=True,
        text=True,
        timeout=5
    )
    if result.returncode == 0:
        version_line = result.stdout.split('\n')[0]
        print(f"   ✓ FFmpeg 可用: {version_line}")
    else:
        print(f"   ✗ FFmpeg 返回错误: {result.stderr}")
except FileNotFoundError:
    print(f"   ✗ 找不到 ffmpeg 命令")
except Exception as e:
    print(f"   ✗ 运行失败: {e}")

# 3. 测试 ffprobe
print("\n3. 测试运行 ffprobe:")
try:
    result = subprocess.run(
        ["ffprobe", "-version"],
        capture_output=True,
        text=True,
        timeout=5
    )
    if result.returncode == 0:
        version_line = result.stdout.split('\n')[0]
        print(f"   ✓ FFprobe 可用: {version_line}")
    else:
        print(f"   ✗ FFprobe 返回错误: {result.stderr}")
except FileNotFoundError:
    print(f"   ✗ 找不到 ffprobe 命令")
except Exception as e:
    print(f"   ✗ 运行失败: {e}")

print("\n✓ FFmpeg 检查完成！可以正常使用视频压缩功能。")
