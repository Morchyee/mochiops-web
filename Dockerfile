# 第一阶段：构建前端静态文件
FROM node:18-alpine AS builder
WORKDIR /app

# 1. 直接用 npm 全局安装指定版本的 pnpm（避免 corepack 联网失败）
RUN npm install -g pnpm@9.0.0

# 2. 复制依赖描述文件
COPY package.json pnpm-lock.yaml ./

# 3. 安装依赖（如果 lockfile 不匹配，换成普通的 pnpm install）
RUN pnpm install

# 4. 复制代码并构建
COPY . .
RUN pnpm build

# 第二阶段：使用 Nginx 托管静态资源
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]