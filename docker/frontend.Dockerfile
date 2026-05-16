FROM node:18
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
ARG NPM_REGISTRY=https://registry.npmmirror.com
RUN npm install --registry="$NPM_REGISTRY" --no-audit --no-fund --package-lock=false
COPY frontend .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
