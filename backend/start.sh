#!/bin/bash

echo "======================================"
echo "  V4Corner 后端服务启动"
echo "======================================"
echo ""

# 检查虚拟环境是否存在
if [ ! -d "venv" ]; then
    echo "[1/4] 创建虚拟环境..."
    python3 -m venv venv
    echo ""
else
    echo "[1/4] 虚拟环境已存在"
    echo ""
fi

# 激活虚拟环境
echo "[2/4] 激活虚拟环境..."
source venv/bin/activate
echo ""

# 安装依赖
echo "[3/4] 检查依赖..."
pip install -r requirements.txt --quiet
echo ""

# 启动服务
echo "[4/4] 启动后端服务..."
echo ""
echo "======================================"
echo "  后端服务启动成功！"
echo "  API 文档: http://localhost:8000/docs"
echo "  按 Ctrl+C 停止服务"
echo "======================================"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
