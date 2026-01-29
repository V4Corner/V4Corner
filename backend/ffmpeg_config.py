"""配置 FFmpeg 路径"""
import os
from pathlib import Path

# 方法 1：直接配置 FFmpeg 路径
FFMPEG_PATH = r"C:\ffmpeg\bin\ffmpeg.exe"  # ← 已配置

# 方法 2：从环境变量读取
# FFMPEG_PATH = os.environ.get("FFMPEG_PATH", "ffmpeg")

def get_ffmpeg_path():
    """获取 FFmpeg 路径"""
    if Path(FFMPEG_PATH).exists():
        return FFMPEG_PATH
    return "ffmpeg"  # 默认使用系统 PATH

def get_ffprobe_path():
    """获取 FFprobe 路径"""
    ffprobe_path = FFMPEG_PATH.replace("ffmpeg.exe", "ffprobe.exe").replace("ffmpeg", "ffprobe")
    if Path(ffprobe_path).exists():
        return ffprobe_path
    return "ffprobe"  # 默认使用系统 PATH

if __name__ == "__main__":
    print(f"FFmpeg 路径: {get_ffmpeg_path()}")
    print(f"FFprobe 路径: {get_ffprobe_path()}")

    # 验证文件存在
    if Path(get_ffmpeg_path()).exists():
        print("✓ FFmpeg 文件存在")
    else:
        print("✗ FFmpeg 文件不存在")

    if Path(get_ffprobe_path()).exists():
        print("✓ FFprobe 文件存在")
    else:
        print("✗ FFprobe 文件不存在")
