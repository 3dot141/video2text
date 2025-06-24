/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  console.error('错误详情:', err);

  // Multer 文件上传错误
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '文件大小超出限制'
      });
    }
    return res.status(400).json({
      success: false,
      message: '文件上传错误'
    });
  }

  // OpenAI API 错误
  if (err.message && err.message.includes('OpenAI')) {
    return res.status(500).json({
      success: false,
      message: 'AI 服务暂时不可用，请稍后重试'
    });
  }

  // FFmpeg 错误
  if (err.message && err.message.includes('ffmpeg')) {
    return res.status(500).json({
      success: false,
      message: '视频处理失败，请检查文件格式'
    });
  }

  // 默认错误响应
  res.status(500).json({
    success: false,
    message: err.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  errorHandler
}; 