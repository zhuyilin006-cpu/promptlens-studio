# 多阶段构建：构建 Next 产物后，仅带生产依赖运行自定义 Node 服务(含 WS 代理)
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY server.mjs next.config.js ./
EXPOSE 3000
CMD ["node", "server.mjs", "--prod"]
