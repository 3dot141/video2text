# 使用官方 Node.js 运行时作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装项目依赖
RUN pnpm install --frozen-lockfile

# 复制项目文件
COPY . .

# 创建上传目录
RUN mkdir -p uploads

# 设置环境变量默认值 (可在运行时覆盖)
ENV NODE_ENV=production
ENV PORT=3000
ENV UPLOAD_DIR=/app/uploads
ENV MAX_FILE_SIZE=104857600
ENV OPENAI_BASE_URL=https://api.openai.com/v1
ENV ADMIN_USERNAME=
ENV ADMIN_PASSWORD=
ENV ADMIN_EMAIL=ninfovores356@gmail.com

# 注意：OPENAI_API_KEY 必须在运行时提供，这里不设置默认值

# 启动应用
CMD ["pnpm", "start"] 
