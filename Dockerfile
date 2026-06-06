FROM node:22-slim

WORKDIR /app

# 复制项目文件
COPY . .

# 安装服务端依赖（包含 tsx）
RUN cd server && npm ci

# 安装前端依赖并构建
RUN cd client && npm ci && npm run build

# 环境变量（部署时覆盖）
ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

WORKDIR /app/server
CMD ["npx", "tsx", "src/index.ts"]
