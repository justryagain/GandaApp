FROM node:18-alpine

WORKDIR /app

# Pass only the required secret at build time
ARG FIREBASE_SERVICE_ACCOUNT_BASE64
ENV FIREBASE_SERVICE_ACCOUNT_BASE64=$FIREBASE_SERVICE_ACCOUNT_BASE64

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "dev"]