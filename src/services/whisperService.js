const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const config = require('../config/config');

// 设置 FFmpeg 路径
ffmpeg.setFfmpegPath(ffmpegPath);

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  baseURL: config.openai.baseURL
});

/**
 * 提取视频中的音频
 * @param {string} videoPath - 视频文件路径
 * @param {string} outputPath - 输出音频文件路径
 * @returns {Promise<string>} 音频文件路径
 */
async function extractAudio(videoPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(outputPath)
      .audioCodec('libmp3lame')
      .audioFrequency(16000)
      .audioChannels(1)
      .on('end', () => {
        console.log('音频提取完成');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('音频提取失败:', err);
        reject(err);
      })
      .run();
  });
}

/**
 * 使用 Whisper API 转录音频
 * @param {string} audioPath - 音频文件路径
 * @param {Object} options - 转录选项
 * @returns {Promise<Object>} 转录结果
 */
async function transcribeAudio(audioPath, options = {}) {
  try {
    const audioFile = fs.createReadStream(audioPath);
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: options.language || 'zh',
      // 这个提示词，可以帮助中文生成标点符号。
      prompt: options.prompt || '生于忧患，死于欢乐。不亦快哉！',
      temperature: options.temperature || 0,
      response_format: options.response_format || 'verbose_json'
    });

    return transcription;
  } catch (error) {
    console.error('Whisper API 调用失败:', error);
    throw new Error(`转录失败: ${error.message}`);
  }
}

/**
 * 转录视频文件
 * @param {string} filePath - 文件路径
 * @param {Object} options - 转录选项
 * @returns {Promise<Object>} 转录结果
 */
async function transcribeVideo(filePath, options = {}) {
  const fileExt = path.extname(filePath).toLowerCase();
  const isVideoFile = ['.mp4', '.avi', '.mov', '.wmv', '.flv'].includes(fileExt);
  
  let audioPath = filePath;
  let shouldCleanupAudio = false;

  try {
    // 如果是视频文件，先提取音频
    if (isVideoFile) {
      audioPath = filePath.replace(path.extname(filePath), '.mp3');
      await extractAudio(filePath, audioPath);
      shouldCleanupAudio = true;
    }

    // 转录音频
    const result = await transcribeAudio(audioPath, options);
    
    // 清理临时文件
    await cleanup(filePath, shouldCleanupAudio ? audioPath : null);
    
    return result;

  } catch (error) {
    // 发生错误时也要清理文件
    await cleanup(filePath, shouldCleanupAudio ? audioPath : null);
    throw error;
  }
}

/**
 * 清理临时文件
 * @param {string} originalFile - 原始文件路径
 * @param {string} audioFile - 音频文件路径（可选）
 */
async function cleanup(originalFile, audioFile = null) {
  try {
    // 删除原始上传文件
    if (await fs.pathExists(originalFile)) {
      await fs.remove(originalFile);
      console.log(`已删除原始文件: ${originalFile}`);
    }
    
    // 删除临时音频文件
    if (audioFile && await fs.pathExists(audioFile)) {
      await fs.remove(audioFile);
      console.log(`已删除临时音频文件: ${audioFile}`);
    }
  } catch (error) {
    console.error('文件清理失败:', error);
  }
}

module.exports = {
  transcribeVideo,
  extractAudio,
  transcribeAudio
}; 