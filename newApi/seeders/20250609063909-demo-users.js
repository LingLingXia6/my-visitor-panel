'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [];
    
    // 生成20个用户数据
    for (let i = 1; i <= 20; i++) {
      users.push({
        email: `user${i}@example.com`,
        username: `user${i}`,
        password: bcrypt.hashSync('123456', 10), // 符合6-45位长度要求
        introduce: `这是用户${i}的个人介绍，用于测试数据。`,
        role: Math.floor(Math.random() * 3), // 随机角色 0, 1, 2
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('Users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
