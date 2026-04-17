# Build Frontend
FROM node:22-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
# Instala somente as dependências necessárias de forma conservadora
RUN npm install --no-audit --no-fund
COPY frontend/ ./
# NODE_OPTIONS configurado para 1.5GB para sobrar RAM para o sistema da VPS rodar o build
RUN NODE_OPTIONS="--max-old-space-size=1536" npm run build

# Build Backend
FROM node:22-slim AS backend-build
WORKDIR /app/backend
RUN apt-get update && apt-get install -y build-essential python3 && rm -rf /var/lib/apt/lists/*
COPY backend/package*.json ./
RUN npm install --no-audit --no-fund
COPY backend/ ./
RUN npm run build

# Stage Final
FROM node:22-slim
WORKDIR /app
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist
COPY --from=backend-build /app/backend/dist /app/backend/dist
COPY --from=backend-build /app/backend/package*.json /app/backend/
WORKDIR /app/backend

RUN apt-get update && apt-get install -y build-essential python3 && \
    npm install --production --no-audit --no-fund && \
    apt-get purge -y build-essential python3 && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 3000
CMD ["npm", "run", "start"]
