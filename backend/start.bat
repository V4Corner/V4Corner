@echo off
REM V4Corner 后端快速启动脚本

echo ======================================
echo   V4Corner 后端服务启动
echo ======================================
echo.

REM 检查虚拟环境是否存在
if not exist "venv\" (
    echo [1/4] 创建虚拟环境...
    python -m venv venv
    echo.
) else (
    echo [1/4] 虚拟环境已存在
    echo.
)

REM 激活虚拟环境
echo [2/4] 激活虚拟环境...
call venv\Scripts\activate
echo.

REM 安装依赖
echo [3/4] 检查依赖...
pip install -r requirements.txt --quiet
echo.

REM 启动服务
echo [4/4] 启动后端服务...
echo.
echo ======================================
echo   后端服务启动成功！
echo   API 文档: http://localhost:8000/docs
echo   按 Ctrl+C 停止服务
echo ======================================
echo.

uvicorn main:app --reload --host 0.0.0.0 --port 8000
