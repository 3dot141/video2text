# 配置说明

## 环境变量配置

本项目使用环境变量来管理配置，请按照以下步骤进行配置：

### 1. 复制配置文件

```bash
cp .env.example .env
```

### 2. 配置环境变量

编辑 `.env` 文件，设置以下配置项：

#### OpenAI 配置
- `OPENAI_API_KEY`: OpenAI API 密钥（必需）
- `OPENAI_BASE_URL`: OpenAI API 基础 URL（可选，默认为官方 API）

#### 服务器配置
- `PORT`: 服务器端口（可选，默认 3000）

#### 文件上传配置
- `MAX_FILE_SIZE`: 最大文件大小，单位字节（可选，默认 100MB）
- `UPLOAD_DIR`: 文件上传目录（可选，默认 uploads）

### 3. 示例配置

```env
# OpenAI 配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1

# 服务器配置
PORT=3000

# 文件上传配置
MAX_FILE_SIZE=104857600
UPLOAD_DIR=uploads
```

## 配置验证

应用启动时会自动验证必需的配置项：

- ✅ 如果所有必需配置都存在，应用将正常启动
- ❌ 如果缺少必需配置，应用将报错并退出

## 配置模块使用

在代码中使用配置：

```javascript
const config = require('./config/config');

// 获取 OpenAI API Key
const apiKey = config.openai.apiKey;

// 获取服务器端口
const port = config.server.port;

// 获取文件上传配置
const maxSize = config.upload.maxFileSize;
```

## 安全提示

- 🔒 **不要将 `.env` 文件提交到版本控制系统**
- 🔒 **定期更换 API 密钥**
- 🔒 **在生产环境中使用安全的密钥管理方案** 