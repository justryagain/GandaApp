# syntax=docker/dockerfile:1.7
FROM node:18-alpine

WORKDIR /app

# Pass only the required secret at build time
ARG FIREBASE_SERVICE_ACCOUNT_BASE64
ENV FIREBASE_SERVICE_ACCOUNT_BASE64=$FIREBASE_SERVICE_ACCOUNT_BASE64

# Install deps with a persistent npm cache
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .

# Cache Next.js/Turbopack build artifacts between builds
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

EXPOSE 3000
CMD ["npm","run","dev"]
