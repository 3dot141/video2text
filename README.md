# 视频转文字服务

一个基于 Node.js 和 OpenAI Whisper API 的视频转文字服务，支持多种视频和音频格式的转录，并提供用户认证功能。

## 功能特点

- 🎥 支持多种视频格式：MP4、AVI、MOV、WMV、FLV
- 🎵 支持多种音频格式：MP3、WAV、M4A、FLAC  
- 🌍 支持多语言转录（默认中文）
- ⚡ 自动音频提取（视频文件）
- 🧹 智能文件清理
- 📝 详细的转录结果（包含时间戳）
- 🛡️ 完善的错误处理和文件验证
- 📦 内置 FFmpeg，无需额外安装
- 🔐 用户认证和授权
- 🐳 支持 Docker 部署

## 项目结构

```
视频转文字/
├── src/
│   ├── app.js                    # 主应用文件
│   ├── config/
│   │   └── config.js            # 配置管理
│   ├── routes/
│   │   ├── transcription.js     # 转录相关路由
│   │   └── auth.js              # 认证相关路由
│   ├── services/
│   │   └── whisperService.js    # Whisper API 服务
│   └── middleware/
│       ├── fileValidation.js    # 文件验证中间件
│       ├── errorHandler.js      # 错误处理中间件
│       └── auth.js              # 认证中间件
├── public/                      # 静态文件
│   ├── index.html              # 主页面
│   ├── login.html              # 登录页面
│   └── app.html                # 应用页面
├── uploads/                     # 文件上传目录（自动创建）
├── docker-compose.yml           # Docker Compose 配置
├── Dockerfile                   # Docker 镜像配置
├── package.json
├── .env                        # 环境变量配置
├── CONFIG.md                   # 配置说明文档
└── README.md
```

## 快速开始

### 使用 Docker 部署（推荐）

#### 1. 克隆项目
```bash
git clone <repository-url>
cd video2text
```

#### 2. 配置环境变量
创建 `.env` 文件：
```env
# OpenAI 配置（必需）
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1

# 服务器配置
PORT=3000
NODE_ENV=production

# 用户认证配置
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
ADMIN_EMAIL=your_email@example.com
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# 文件上传配置
MAX_FILE_SIZE=104857600
UPLOAD_DIR=./uploads
```

#### 3. 启动服务
```bash
# 使用 Docker Compose 启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 4. 访问服务
- 应用地址：http://localhost:3000
- 登录页面：http://localhost:3000/login.html

### 本地开发部署

#### 1. 安装依赖

```bash
npm install
# 或者使用 pnpm
pnpm install
```

#### 2. 配置环境变量

在 `.env` 文件中配置所需的环境变量（参考上面的 Docker 配置）。

**注意**: FFmpeg 已通过 `@ffmpeg-installer/ffmpeg` 包自动包含，无需手动安装！

#### 3. 启动服务

```bash
# 生产环境
npm start

# 开发环境（自动重启）
npm run dev
```

服务启动后访问：http://localhost:3000

## 用户认证

### 登录功能
- 支持基于 JWT 的用户认证
- Session 会话管理
- 安全的密码验证

### 认证 API

#### 1. 用户登录
**POST** `/api/auth/login`

**请求参数：**
```json
{
  "username": "admin",
  "password": "your_password"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com"
    }
  }
}
```

#### 2. 用户登出
**POST** `/api/auth/logout`

#### 3. 获取当前用户信息
**GET** `/api/auth/user`

需要在请求头中包含认证 Token：
```
Authorization: Bearer your_jwt_token
```

#### 4. 检查认证状态
**GET** `/api/auth/status`

### 使用认证
所有转录 API 都需要先登录获取 Token，然后在请求头中包含：
```
Authorization: Bearer your_jwt_token
```

## API 接口

### 转录 API（需要认证）

#### 1. 转录视频/音频

**POST** `/api/transcription/transcribe`

**请求头：**
```
Authorization: Bearer your_jwt_token
Content-Type: multipart/form-data
```

**请求参数：**
- `file` (必需): 视频或音频文件
- `language` (可选): 语言代码, 默认 'zh' (中文)
- `prompt` (可选): 提示词，用于改善转录质量
- `temperature` (可选): 0-1 之间的数值，控制随机性
- `response_format` (可选): 响应格式，默认 'json'

**示例请求：**
```bash
curl -X POST http://localhost:3000/api/transcription/transcribe \
  -H "Authorization: Bearer your_jwt_token" \
  -F "file=@video.mp4" \
  -F "language=zh" \
  -F "prompt=这是一个关于技术的视频"
```

**响应示例：**
```json
{
  "success": true,
  "message": "转录完成",
  "data": {
    "filename": "video.mp4",
    "transcription": "这里是转录的文字内容...",
    "language": "chinese",
    "duration": 120.5,
    "segments": [
      {
        "start": 0.0,
        "end": 5.2,
        "text": "第一段文字..."
      }
    ]
  }
}
```

#### 2. 获取支持的文件格式

**GET** `/api/transcription/formats`

**响应示例：**
```json
{
  "success": true,
  "data": {
    "video": ["mp4", "avi", "mov", "wmv", "flv"],
    "audio": ["mp3", "wav", "m4a", "flac"],
    "maxSize": "100MB"
  }
}
```

### 其他 API

#### 健康检查
**GET** `/health`

## Docker 部署

### 使用 Dockerfile 启动

#### 1. 构建镜像
```bash
docker build -t video2text .
```

#### 2. 启动容器并配置环境变量
```bash
docker run -d \
  --name video2text \
  -p 3000:3000 \
  -e OPENAI_API_KEY=your_openai_api_key_here \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your_secure_password \
  -e ADMIN_EMAIL=your_email@example.com \
  -e JWT_SECRET=your_jwt_secret_key \
  -v $(pwd)/uploads:/app/uploads \
  video2text
```

#### 3. 使用环境变量文件启动
创建 `.env` 文件：
```env
# OpenAI 配置（必需）
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1

# 用户认证配置
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
ADMIN_EMAIL=your_email@example.com
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# 其他配置
PORT=3000
NODE_ENV=production
MAX_FILE_SIZE=104857600
```

然后使用环境变量文件启动：
```bash
docker run -d \
  --name video2text \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/uploads:/app/uploads \
  video2text
```

## 支持的语言

- `zh` - 中文
- `en` - 英语
- `ja` - 日语
- `ko` - 韩语
- `es` - 西班牙语
- `fr` - 法语
- `de` - 德语
- 更多语言请参考 [OpenAI Whisper 文档](https://platform.openai.com/docs/guides/speech-to-text)

## 注意事项

1. **文件大小限制**: 最大支持 100MB 的文件
2. **API Key**: 需要有效的 OpenAI API Key
3. **FFmpeg**: FFmpeg 已自动包含，无需额外安装
4. **文件清理**: 上传的文件处理完成后会自动删除
5. **网络**: 转录过程需要网络连接到 OpenAI API
6. **认证**: 所有 API 操作都需要先登录获取 Token
7. **安全**: 请使用强密码和安全的 JWT 密钥

## 错误处理

服务包含完善的错误处理机制：

- 认证失败（401 未授权）
- 文件格式不支持
- 文件大小超限
- OpenAI API 错误
- FFmpeg 处理错误
- 网络连接错误

所有错误都会返回友好的中文错误信息。

## 开发

### 启动开发模式

```bash
npm run dev
```

### 运行测试

```bash
npm test
```

### 配置说明

详细的配置说明请参考 [CONFIG.md](CONFIG.md) 文件。

## 许可证

MIT License