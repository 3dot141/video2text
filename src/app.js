const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const session = require('express-session');

// 导入配置和路由
const config = require('./config/config');
const transcriptionRoutes = require('./routes/transcription');
const authRoutes = require('./routes/auth');
const { errorHandler } = require('./middleware/errorHandler');

// 验证配置
try {
  config.validate();
  console.log('✅ 配置验证通过');
} catch (error) {
  console.error('❌ 配置验证失败:', error.message);
  process.exit(1);
}

const app = express();
const PORT = config.server.port;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session 配置
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // 在生产环境中设置为 true（需要 HTTPS）
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

// 静态文件服务
app.use(express.static('public'));

// 确保上传目录存在
const uploadDir = config.upload.uploadDir;
fs.ensureDirSync(uploadDir);

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/transcription', transcriptionRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '视频转文字服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '欢迎使用视频转文字服务',
    endpoints: {
      health: '/health',
      transcribe: '/api/transcription/transcribe'
    }
  });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 视频转文字服务已启动`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`📁 上传目录: ${path.resolve(uploadDir)}`);
}); 