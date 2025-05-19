'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    console.log('开始插入用户数据...');
    // 添加10条用户数据，字段与模型匹配
    const now = new Date();
    await queryInterface.bulkInsert('Users', [
      { username: 'alice', email: 'alice@example.com', password: '123456', introduce: '我是Alice，一名音乐爱好者', role: 1, createdAt: now, updatedAt: now },
      { username: 'bob', email: 'bob@example.com', password: '123456', introduce: '我是Bob，喜欢流行音乐', role: 2, createdAt: now, updatedAt: now },
      { username: 'charlie', email: 'charlie@example.com', password: '123456', introduce: '我是Charlie，古典音乐爱好者', role: 2, createdAt: now, updatedAt: now },
      { username: 'david', email: 'david@example.com', password: '123456', introduce: '我是David，摇滚乐迷', role: 2, createdAt: now, updatedAt: now },
      { username: 'eve', email: 'eve@example.com', password: '123456', introduce: '我是Eve，爵士乐爱好者', role: 2, createdAt: now, updatedAt: now },
      { username: 'frank', email: 'frank@example.com', password: '123456', introduce: '我是Frank，电子音乐制作人', role: 2, createdAt: now, updatedAt: now },
      { username: 'grace', email: 'grace@example.com', password: '123456', introduce: '我是Grace，民谣歌手', role: 2, createdAt: now, updatedAt: now },
      { username: 'hank', email: 'hank@example.com', password: '123456', introduce: '我是Hank，嘻哈音乐爱好者', role: 2, createdAt: now, updatedAt: now },
      { username: 'ivy', email: 'ivy@example.com', password: '123456', introduce: '我是Ivy，音乐教师', role: 2, createdAt: now, updatedAt: now },
      { username: 'jack', email: 'jack@example.com', password: '123456', introduce: '我是Jack，音乐制作人', role: 1, createdAt: now, updatedAt: now },
    ], {});
    console.log('用户数据插入完成！');
  },

  async down (queryInterface, Sequelize) {
    // 删除所有用户数据
    await queryInterface.bulkDelete('Users', null, {});
  }
};
