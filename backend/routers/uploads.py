# 媒体文件上传路由

import os
import uuid
import subprocess
import shutil
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Body
from sqlalchemy.orm import Session
import tempfile

import dependencies
import ffmpeg_config

router = APIRouter(prefix="/api/uploads", tags=["文件上传"])

# 允许的文件类型
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp"
}

ALLOWED_VIDEO_TYPES = {
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov"
}

# 文件大小限制（字节）
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024  # 2GB

# 视频压缩配置
VIDEO_COMPRESSION_SETTINGS = {
    "max_width": 1920,  # 最大宽度
    "max_height": 1080,  # 最大高度
    "video_bitrate": "2M",  # 视频码率
    "audio_bitrate": "128k",  # 音频码率
    "target_size_mb": 50,  # 目标大小 (MB)
}


@router.post("/image", response_model=dict)
async def upload_image(
    current_user: dependencies.CurrentUser,
    file: UploadFile = File(...)
):
    """上传博客图片"""
    # 验证文件类型
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"不支持的图片类型，请上传 {', '.join(ALLOWED_IMAGE_TYPES.keys())} 格式的图片"
        )

    try:
        # 创建上传目录
        upload_dir = Path("uploads/blog/images")
        upload_dir.mkdir(parents=True, exist_ok=True)

        # 生成唯一文件名
        file_extension = ALLOWED_IMAGE_TYPES[file.content_type]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = upload_dir / unique_filename

        # 流式写入文件
        with open(file_path, "wb") as f:
            while chunk := await file.read(1024 * 1024):  # 每次读取1MB
                f.write(chunk)

        file_size = file_path.stat().st_size
        file_url = f"/static/blog/images/{unique_filename}"

        print(f"图片上传成功: {file.filename}, 大小: {file_size / (1024 * 1024):.2f}MB")

        return {"url": file_url, "type": "image", "size": file_size}

    except Exception as e:
        print(f"图片上传错误: {str(e)}")
        import traceback
        traceback.print_exc()

        # 清理部分上传的文件
        if 'file_path' in locals() and file_path.exists():
            try:
                file_path.unlink()
            except:
                pass

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"图片上传失败: {str(e)}"
        )


def compress_video(input_path: Path, output_path: Path) -> tuple[bool, str, str]:
    """使用 FFmpeg 压缩视频"""
    try:
        # 获取 FFmpeg 和 FFprobe 路径
        ffmpeg_cmd = ffmpeg_config.get_ffmpeg_path()
        ffprobe_cmd = ffmpeg_config.get_ffprobe_path()

        # 验证 FFmpeg 是否可用
        if not Path(ffmpeg_cmd).exists() and ffmpeg_cmd == "ffmpeg":
            # 如果不是绝对路径且不存在，尝试 shutil.which
            ffmpeg_cmd = shutil.which("ffmpeg")
            if not ffmpeg_cmd:
                return False, "FFmpeg 未找到，请在 ffmpeg_config.py 中配置 FFMPEG_PATH", ""
            ffprobe_cmd = shutil.which("ffprobe", ffmpeg_cmd.replace("ffmpeg", "ffprobe"))

        print(f"使用 FFmpeg: {ffmpeg_cmd}")
        print(f"使用 FFprobe: {ffprobe_cmd}")

        # 检查 FFmpeg 是否可用
        subprocess.run([ffmpeg_cmd, "-version"], capture_output=True, check=True)

        # 获取原始文件大小
        original_size = input_path.stat().st_size / (1024 * 1024)

        # 计算视频时长以确定合适的码率
        probe_cmd = [
            ffprobe_cmd,
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            str(input_path)
        ]

        result = subprocess.run(probe_cmd, capture_output=True, text=True)
        duration = float(result.stdout.strip()) if result.stdout.strip() else 10

        # 根据时长计算目标码率（目标 50MB）
        target_bitrate = int((VIDEO_COMPRESSION_SETTINGS["target_size_mb"] * 8 * 1024) / duration)
        target_bitrate = min(target_bitrate, 2000)  # 最大 2Mbps
        video_bitrate = f"{target_bitrate}k"

        # FFmpeg 压缩命令
        cmd = [
            ffmpeg_cmd,
            "-i", str(input_path),
            "-vf", f"scale='min({VIDEO_COMPRESSION_SETTINGS['max_width']},iw):-2'",
            "-b:v", video_bitrate,
            "-b:a", VIDEO_COMPRESSION_SETTINGS["audio_bitrate"],
            "-movflags", "+faststart",  # 优化流媒体播放
            "-y",  # 覆盖输出文件
            str(output_path)
        ]

        # 执行压缩
        subprocess.run(cmd, capture_output=True, check=True)

        # 获取压缩后文件大小
        compressed_size = output_path.stat().st_size / (1024 * 1024)
        ratio = (1 - compressed_size / original_size) * 100

        return True, f"压缩成功: {original_size:.1f}MB → {compressed_size:.1f}MB (节省 {ratio:.1f}%)", str(output_path)

    except subprocess.CalledProcessError as e:
        return False, f"FFmpeg 执行失败: {str(e)}", ""
    except FileNotFoundError:
        return False, "FFmpeg 未安装，请联系管理员安装 FFmpeg", ""
    except Exception as e:
        return False, f"压缩失败: {str(e)}", ""


@router.delete("/media", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(
    urls: List[str] = Body(..., embed=True),
    current_user: dependencies.CurrentUser = None
):
    """删除未使用的媒体文件"""
    deleted_count = 0
    for url in urls:
        # 从 URL 中提取文件路径
        # URL 格式: /static/blog/images/xxx.jpg 或 /static/blog/videos/xxx.mp4
        if url.startswith("/static/"):
            file_path = Path("uploads") / url.replace("/static/", "")
            if file_path.exists():
                try:
                    file_path.unlink()
                    deleted_count += 1
                    print(f"已删除文件: {file_path}")
                except Exception as e:
                    # 记录错误但继续删除其他文件
                    print(f"删除文件失败 {file_path}: {e}")
        else:
            print(f"跳过非博客媒体文件: {url}")
    print(f"共删除 {deleted_count} 个媒体文件")
    return None


@router.post("/media/sizes", response_model=dict)
async def get_media_sizes(
    urls: List[str] = Body(..., embed=True),
    current_user: dependencies.CurrentUser = None
):
    """获取媒体文件大小信息"""
    sizes = {}
    for url in urls:
        # 从 URL 中提取文件路径
        if url.startswith("/static/"):
            file_path = Path("uploads") / url.replace("/static/", "")
            if file_path.exists():
                try:
                    size_bytes = file_path.stat().st_size
                    sizes[url] = size_bytes
                except Exception as e:
                    print(f"获取文件大小失败 {file_path}: {e}")
                    sizes[url] = 0
            else:
                sizes[url] = 0
        else:
            sizes[url] = 0
    return {"sizes": sizes}


@router.post("/video", response_model=dict)
async def upload_video(
    current_user: dependencies.CurrentUser,
    file: UploadFile = File(...)
):
    """上传博客视频"""
    # 验证文件类型
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"不支持的视频类型，请上传 {', '.join(ALLOWED_VIDEO_TYPES.keys())} 格式的视频"
        )

    temp_path = None
    try:
        # 创建上传目录
        upload_dir = Path("uploads/blog/videos")
        upload_dir.mkdir(parents=True, exist_ok=True)

        # 生成唯一文件名
        file_extension = ALLOWED_VIDEO_TYPES[file.content_type]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        final_path = upload_dir / unique_filename

        # 直接流式写入到最终位置（避免临时文件）
        with open(final_path, "wb") as f:
            while chunk := await file.read(1024 * 1024):  # 每次读取1MB
                f.write(chunk)

        # 获取文件大小
        file_size = final_path.stat().st_size
        file_url = f"/static/blog/videos/{unique_filename}"

        print(f"视频上传成功: {file.filename}, 大小: {file_size / (1024 * 1024):.1f}MB")

        return {
            "url": file_url,
            "type": "video",
            "compressed": False,
            "message": f"视频上传成功 ({file_size / (1024 * 1024):.1f}MB)",
            "size": file_size
        }

    except HTTPException:
        # 清理临时文件
        if temp_path and temp_path.exists():
            temp_path.unlink()
        raise
    except Exception as e:
        print(f"视频上传错误: {str(e)}")
        import traceback
        traceback.print_exc()

        # 清理部分上传的文件
        if 'final_path' in locals() and final_path.exists():
            try:
                final_path.unlink()
            except:
                pass

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"视频处理失败: {str(e)}"
        )
