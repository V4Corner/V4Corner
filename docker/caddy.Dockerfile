FROM node:18-alpine AS frontend-build
WORKDIR /app

ARG VITE_BACKEND_URL=
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

COPY frontend .
RUN npm run build

FROM caddy:2-alpine
COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY --from=frontend-build /app/dist /srv
