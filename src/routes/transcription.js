const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { transcribeVideo } = require('../services/whisperService');
const { validateFile } = require('../middleware/fileValidation');
const { verifyToken } = require('../middleware/auth');

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024, // 10GB
  },
  fileFilter: (req, file, cb) => {
    // 支持的文件格式
    const allowedMimes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'audio/mp3',
      'audio/wav',
      'audio/m4a',
      'audio/flac'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件格式'), false);
    }
  }
});

// 转录视频/音频文件 (需要认证)
router.post('/transcribe', verifyToken, upload.single('file'), validateFile, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传文件'
      });
    }

    console.log(`开始处理文件: ${req.file.originalname}`);
    
    const options = {
      language: req.body.language || 'zh', // 默认中文
      prompt: req.body.prompt || '',
      temperature: parseFloat(req.body.temperature) || 0,
      response_format: req.body.response_format || 'json'
    };

    const result = await transcribeVideo(req.file.path, options);
    
    res.json({
      success: true,
      message: '转录完成',
      data: {
        filename: req.file.originalname,
        transcription: result.text,
        language: result.language,
        duration: result.duration,
        segments: result.segments || []
      }
    });

  } catch (error) {
    console.error('转录失败:', error);
    next(error);
  }
});

// 获取支持的文件格式
router.get('/formats', (req, res) => {
  res.json({
    success: true,
    data: {
      video: ['mp4', 'avi', 'mov', 'wmv', 'flv'],
      audio: ['mp3', 'wav', 'm4a', 'flac'],
      maxSize: '2GB'
    }
  });
});

module.exports = router; 