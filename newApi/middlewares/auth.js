const jwt = require('jsonwebtoken');
const db = require('../models');



module.exports = async (req, res, next) => {
  try {
    // 从请求头中获取token
    const {token} = req.headers;
    // 如果token不存在，返回错误
    if (!token) {
      return res.status(401).json({
        status: false,
        message: '未登录',
      });
    }
    console.log("token",token)
     console.log("process.env.SECRET",process.env.SECRET);
    // 验证token
    const decoded = jwt.verify(token, process.env.SECRET);
    console.log("decoded",decoded,decoded.username,)
    // 从数据库中查找用户
    const user = await db.user.findOne({
      where: {
        username: decoded.username,
      },
    });
    console.log("user",user);
    // 如果用户不存在，返回错误
    if (!user) {
      return res.status(401).json({
        status: false,
        message: '用户不存在',
      });
    }
    
    // 将用户信息添加到请求对象中
    req.user = user;
    // 继续处理请求
    next();
  } catch (error) {
    // 如果验证失败，返回错误
    return res.status(401).json({
      status: false,
      message: error.message,
    });
  }
};
