const express = require('express');
const router = express.Router();
const { login, logout, getCurrentUser, verifyToken } = require('../middleware/auth');

// 用户登录
router.post('/login', login);

// 用户登出
router.post('/logout', logout);

// 获取当前用户信息 (需要认证)
router.get('/user', verifyToken, getCurrentUser);

// 检查认证状态
router.get('/status', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: '已认证',
    data: {
      authenticated: true,
      user: req.user
    }
  });
});

module.exports = router; 