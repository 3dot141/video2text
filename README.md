# 视频转文字服务

一个基于 Node.js 和 OpenAI Whisper API 的视频转文字服务，支持多种视频和音频格式的转录。

## 功能特点

- 🎥 支持多种视频格式：MP4、AVI、MOV、WMV、FLV
- 🎵 支持多种音频格式：MP3、WAV、M4A、FLAC  
- 🌍 支持多语言转录（默认中文）
- ⚡ 自动音频提取（视频文件）
- 🧹 智能文件清理
- 📝 详细的转录结果（包含时间戳）
- 🛡️ 完善的错误处理和文件验证
- 📦 内置 FFmpeg，无需额外安装

## 项目结构

```
视频转文字/
├── src/
│   ├── app.js                    # 主应用文件
│   ├── routes/
│   │   └── transcription.js      # 转录相关路由
│   ├── services/
│   │   └── whisperService.js     # Whisper API 服务
│   └── middleware/
│       ├── fileValidation.js     # 文件验证中间件
│       └── errorHandler.js       # 错误处理中间件
├── uploads/                      # 文件上传目录（自动创建）
├── package.json
├── .env                         # 环境变量配置
└── README.md
```

## 安装配置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在 `.env` 文件中配置你的 OpenAI API Key：

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=100MB
```

**注意**: FFmpeg 已通过 `@ffmpeg-installer/ffmpeg` 包自动包含，无需手动安装！

## 使用方法

### 启动服务

```bash
# 生产环境
npm start

# 开发环境（自动重启）
npm run dev
```

服务启动后访问：http://localhost:3000

### API 接口

#### 1. 转录视频/音频

**POST** `/api/transcription/transcribe`

**请求参数：**
- `file` (必需): 视频或音频文件
- `language` (可选): 语言代码, 默认 'zh' (中文)
- `prompt` (可选): 提示词，用于改善转录质量
- `temperature` (可选): 0-1 之间的数值，控制随机性
- `response_format` (可选): 响应格式，默认 'json'

**示例请求：**
```bash
curl -X POST http://localhost:3000/api/transcription/transcribe \
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

#### 3. 健康检查

**GET** `/health`

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

## 错误处理

服务包含完善的错误处理机制：

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

## 许可证

MIT License