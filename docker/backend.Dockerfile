FROM python:3.10-slim
WORKDIR /app

ARG INSTALL_FFMPEG=false
RUN if [ "$INSTALL_FFMPEG" = "true" ]; then \
      sed -i 's|http://deb.debian.org|https://mirrors.aliyun.com|g' /etc/apt/sources.list.d/debian.sources \
      && apt-get update \
      && apt-get install -y --no-install-recommends ffmpeg \
      && rm -rf /var/lib/apt/lists/*; \
    fi

COPY backend/requirements.txt ./
ARG PIP_INDEX_URL=https://mirrors.aliyun.com/pypi/simple/
ARG PIP_TRUSTED_HOST=mirrors.aliyun.com
RUN pip install --no-cache-dir \
    -i "$PIP_INDEX_URL" \
    --trusted-host "$PIP_TRUSTED_HOST" \
    -r requirements.txt
COPY backend .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
