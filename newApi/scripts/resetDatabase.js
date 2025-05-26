'use strict';

const db = require('../models');
const fs = require('fs');
const path = require('path');

async function resetDatabase() {
  try {
    console.log('开始修复模型文件...');
    
    // 直接修改 visitorsforms.js 文件
    const visitorsFormsPath = path.join(__dirname, '../models/visitorsforms.js');
    let content = fs.readFileSync(visitorsFormsPath, 'utf8');
    
    // 检查并修复 models.visitors 的引用问题
    if (content.includes('models.visitors')) {
      content = content.replace(/models\.visitors/g, 'models.Visitors');
      fs.writeFileSync(visitorsFormsPath, content, 'utf8');
      console.log('已修复 visitorsforms.js 中的模型引用');
    }
    
    // 清除 require 缓存
    console.log('清除模块缓存...');
    Object.keys(require.cache).forEach(key => {
      delete require.cache[key];
    });
    
    // 重新加载模型
    console.log('重新加载模型...');
    const freshDb = require('../models');
    
    console.log('开始重置数据库...');
    // 使用新加载的模型同步数据库
    await freshDb.sequelize.sync({ force: true });
    
    console.log('数据库重置成功！所有表已被删除并重新创建。');
    process.exit(0);
  } catch (error) {
    console.error('重置数据库时出错:', error);
    console.error('错误详情:', error.stack);
    process.exit(1);
  }
}

resetDatabase();