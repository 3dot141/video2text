const fs = require('fs-extra');
const config = require('../config/config');

/**
 * 文件验证中间件
 */
const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: '请选择要上传的文件'
    });
  }

  // 检查文件是否存在
  if (!fs.existsSync(req.file.path)) {
    return res.status(400).json({
      success: false,
      message: '文件上传失败'
    });
  }

  // 检查文件大小
  const maxSize = config.upload.maxFileSize;
  if (req.file.size > maxSize) {
    // 删除过大的文件
    fs.removeSync(req.file.path);
    return res.status(400).json({
      success: false,
      message: '文件大小不能超过 100MB'
    });
  }

  // 检查 OpenAI API Key
  if (!config.openai.apiKey) {
    fs.removeSync(req.file.path);
    return res.status(500).json({
      success: false,
      message: '服务配置错误：缺少 OpenAI API Key'
    });
  }

  next();
};

module.exports = {
  validateFile
}; 