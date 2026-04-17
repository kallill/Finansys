FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

FROM node:22-alpine AS backend-build
WORKDIR /app/backend
# Adiciona ferramentas de build para pacotes nativos (ex: sqlite3, bcrypt)
RUN apk add --no-cache build-base python3
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist
COPY --from=backend-build /app/backend/dist /app/backend/dist
COPY --from=backend-build /app/backend/package*.json /app/backend/
WORKDIR /app/backend
# Garante ferramentas de build também na instalação de produção se houver binários
RUN apk add --no-cache build-base python3 && \
    npm install --production && \
    apk del build-base python3
EXPOSE 3000
CMD ["npm", "run", "start"]
