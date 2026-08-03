# 第一阶段：构建前端静态文件（升至 Node 20 以适配 Vite）
FROM node:20-alpine AS builder
WORKDIR /app

# 1. 安装指定版本的 pnpm
RUN npm install -g pnpm@9.0.0

# 2. 复制依赖描述文件
COPY package.json pnpm-lock.yaml ./

# 3. 安装依赖
RUN pnpm install

# 4. 复制代码并打包
COPY . .
RUN pnpm build

# 第二阶段：使用 Nginx 托管静态资源
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]