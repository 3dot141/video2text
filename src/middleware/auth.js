const jwt = require('jsonwebtoken');

const adminUser = {
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD,
  email: process.env.ADMIN_EMAIL
}

// 临时用户存储 (实际项目中应该使用数据库)
const users = [
  {
    id: 1,
    username: adminUser.username,
    password: adminUser.password,
    email: adminUser.email
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// 验证JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || 
                req.session?.token ||
                req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '访问被拒绝，请先登录'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token无效，请重新登录'
    });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    // 查找用户
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    // 直接相等
    const isValidPassword = password === user.password;
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 存储到session
    req.session.token = token;
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 用户登出
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '登出失败'
      });
    }
    
    res.clearCookie('connect.sid'); // 清除session cookie
    res.json({
      success: true,
      message: '登出成功'
    });
  });
};

// 获取当前用户信息
const getCurrentUser = (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
};

module.exports = {
  verifyToken,
  login,
  logout,
  getCurrentUser,
};