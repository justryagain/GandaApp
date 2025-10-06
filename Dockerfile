# syntax=docker/dockerfile:1.7
FROM node:18-alpine

WORKDIR /app

# Install deps first for caching
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy the rest of the app
COPY . .

# During build, mount your Firebase secret as a temporary file
# (no ARG/ENV used for it)
RUN --mount=type=secret,id=firebase_service_account \
    export FIREBASE_SERVICE_ACCOUNT="$(cat /run/secrets/firebase_service_account)" && \
    npm run build

EXPOSE 3000
CMD ["npm", "run", "dev"]