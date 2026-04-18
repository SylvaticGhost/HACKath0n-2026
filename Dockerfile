FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY api/package*.json ./api/
COPY web/package*.json ./web/

RUN npm ci

COPY shared/ ./shared/
RUN npm run build --workspace=shared


COPY web/ ./web/
RUN npm run build --workspace=web

COPY api/ ./api/
RUN npm run build --workspace=api

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY api/package*.json ./api/
COPY web/package*.json ./web/

RUN npm pkg delete scripts.prepare && npm ci --omit=dev

# 3. Copy only the compiled code from the builder
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/api/dist ./api/dist
COPY --from=builder /app/web/dist ./api/client

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
USER nodejs

EXPOSE $PORT

# Start the NestJS api
# Running from the /app root ensures your process.cwd() expects the .env file at the root!
CMD ["node", "api/dist/main.js"]
