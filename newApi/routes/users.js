const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.user; // 使用小写的 user，与模型列表匹配
const authMiddleware = require('../middlewares/auth');
// 用户注册 API
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, introduce } = req.body;
    
    // 检查用户名或邮箱是否已存在
    const existingUser = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { username: username },
          { email: email }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: '用户名或邮箱已被使用'
      });
    }
    
    // 创建新用户 - 不需要手动加密密码，模型会自动处理
    const newUser = await User.create({
      username,
      email,
      password, // 直接传入原始密码，模型的 setter 会处理加密
      introduce: introduce || '',
      role: 2 // 默认为普通用户
    });
    
    res.status(201).json({
      status: true,
      message: '注册成功',
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      status: false,
      message: '注册失败',
      error: error.message
    });
  }
});

// 用户登录 API
router.post('/login', async (req, res) => {
  try {
    // login 可以是用户名或邮箱，根据实际需求修改 ap
    const { login, password } = req.body;
    console.log("login-password",login,password);
    if(!login || !password) {
      return res.status(400).json({
        status: false,
        message: !login ? '邮箱/用户名必须填写':'密码必须填写'
      })
    }
    // 查找用户
    const user = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { username: login },
          { email: login  }
        ]
      }
    });
    console.log("user1",user);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: '用户不存在,无法登陆'
      });
    }
  
    // 验证密码
    const isMatch= bcrypt.compareSync(password,user.password);
    console.log("isMatch",isMatch);
     if(!isMatch){
      return res.status(401).json({
        status:false,
        message:'密码错误'
      })
     }
     if(user.role !== 2){
      return res.status(401).json({
        status:false,
        message:'用户权限不足'
      })
     };

      // 生成 JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.SECRET,
      { expiresIn: '30d' }
    );
    res.json({
        status: true,
        message: '登录成功',
        data: {
          token,
          expiresIn: 30 * 24 * 60 * 60 * 1000 // 30 天的毫秒数
        }
      });
   
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      status: false,
      message: '登录失败',
      error: error.message
    });
  }
});

// 修改密码 API
router.put('/change-password',authMiddleware, async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    
    // 查找用户
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: '用户不存在'
      });
    }
    
    // 验证当前密码
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: '当前密码错误'
      });
    }
    
    // 更新密码
    await user.update({ password: newPassword });
    
    res.json({
      status: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('密码修改失败:', error);
    res.status(500).json({
      status: false,
      message: '密码修改失败',
      error: error.message
    });
  }
});

// 删除账户 API
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查找用户
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: '用户不存在'
      });
    }
    
    // 删除用户
    await user.destroy();
    
    res.json({
      status: true,
      message: '账户删除成功'
    });
  } catch (error) {
    console.error('账户删除失败:', error);
    res.status(500).json({
      status: false,
      message: '账户删除失败',
      error: error.message
    });
  }
});



// Token 验证 API
router.get('/verify-token', async (req, res) => {
  try {
    // 从请求头获取 token
    const token = req.headers.token;
    
    if (!token) {
      return res.status(401).json({
        status: false,
        message: '未提供令牌'
      });
    }
    
    // 验证 token
    try {
      const decoded = jwt.verify(token, process.env.SECRET);
      
      // 查找用户
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({
          status: false,
          message: '用户不存在'
        });
      }
      
      // 返回用户信息
      res.json({
        status: true,
        message: 'Token 有效',
        data: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      // Token 无效或过期
      return res.status(401).json({
        status: false,
        message: 'Token 无效或已过期'
      });
    }
  } catch (error) {
    console.error('验证 token 失败:', error);
    res.status(500).json({
      status: false,
      message: '验证 token 失败',
      error: error.message
    });
  }
});

module.exports = router;
