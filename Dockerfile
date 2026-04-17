# Build Frontend
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm cache clean --force && npm install
COPY frontend/ ./
# Desativa sourcemaps para economizar memória e CPU no build
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build -- --sourcemap false

# Build Backend
FROM node:20-slim AS backend-build
WORKDIR /app/backend
RUN apt-get update && apt-get install -y build-essential python3 && rm -rf /var/lib/apt/lists/*
COPY backend/package*.json ./
RUN npm cache clean --force && npm install
COPY backend/ ./
RUN npm run build

# Stage Final
FROM node:20-slim
WORKDIR /app
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist
COPY --from=backend-build /app/backend/dist /app/backend/dist
COPY --from=backend-build /app/backend/package*.json /app/backend/
WORKDIR /app/backend

RUN apt-get update && apt-get install -y build-essential python3 && \
    npm install --production && \
    apt-get purge -y build-essential python3 && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 3000
CMD ["npm", "run", "start"]
