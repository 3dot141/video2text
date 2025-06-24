require('dotenv').config();

/**
 * 应用配置管理
 */
const config = {
  // OpenAI 配置
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  },
  
  // 服务器配置
  server: {
    port: process.env.PORT || 3000
  },
  
  // 文件上传配置
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'), // 10GB
    uploadDir: process.env.UPLOAD_DIR || 'uploads'
  },
  
  // 验证配置是否完整
  validate() {
    const required = [
      { key: 'OPENAI_API_KEY', value: this.openai.apiKey, name: 'OpenAI API Key' }
    ];
    
    const missing = required.filter(item => !item.value);
    
    if (missing.length > 0) {
      const missingNames = missing.map(item => item.name).join(', ');
      throw new Error(`缺少必需的配置项: ${missingNames}`);
    }
    
    return true;
  }
};

module.exports = config; 