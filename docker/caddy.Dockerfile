FROM node:18-alpine AS frontend-build
WORKDIR /app

ARG VITE_BACKEND_URL=
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

COPY frontend/package.json frontend/package-lock.json* ./
ARG NPM_REGISTRY=https://registry.npmmirror.com
RUN npm ci --registry="$NPM_REGISTRY"

COPY frontend .
RUN npm run build

FROM caddy:2-alpine
COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY --from=frontend-build /app/dist /srv
