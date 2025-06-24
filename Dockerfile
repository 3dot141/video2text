# 使用官方 Node.js 运行时作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装 FFmpeg (用于视频处理)
RUN apk add --no-cache ffmpeg

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

# 注意：OPENAI_API_KEY 必须在运行时提供，这里不设置默认值

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动应用
CMD ["pnpm", "start"] 