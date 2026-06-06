FROM node:22-slim

WORKDIR /app

# 先安装服务端依赖
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

# 复制服务端源码
COPY server/src ./src
COPY server/tsconfig.json ./

# 复制前端构建产物
COPY client/dist ../client/dist

# 环境变量（部署时覆盖）
ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

CMD ["npx", "tsx", "src/index.ts"]
