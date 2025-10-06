FROM node:18-alpine

WORKDIR /app

ARG FIREBASE_SERVICE_ACCOUNT_BASE64
ENV FIREBASE_SERVICE_ACCOUNT_BASE64=$FIREBASE_SERVICE_ACCOUNT_BASE64

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .

RUN if [ -z "$FIREBASE_SERVICE_ACCOUNT_BASE64" ]; then \
    echo "🔥 FIREBASE_SERVICE_ACCOUNT_BASE64 is EMPTY during build"; \
    else \
    echo "✅ FIREBASE_SERVICE_ACCOUNT_BASE64 is SET during build"; \
    echo "Length: $(echo -n $FIREBASE_SERVICE_ACCOUNT_BASE64 | wc -c) characters"; \
    fi && \
    npm run build

EXPOSE 3000
CMD ["npm", "run", "dev"]
