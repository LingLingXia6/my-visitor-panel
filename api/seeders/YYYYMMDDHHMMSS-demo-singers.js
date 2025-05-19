'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('singers', [
      {
        name: '周杰伦',
        avatar: 'https://example.com/jay.jpg',
        description: '华语流行乐男歌手',
        worktime: '09:00-18:00',
        status: 0 // 上班
      },
      {
        name: '林俊杰',
        avatar: 'https://example.com/jj.jpg',
        description: '新加坡华语流行乐男歌手',
        worktime: '10:00-19:00',
        status: 0 // 上班
      },
      {
        name: '张学友',
        avatar: 'https://example.com/jacky.jpg',
        description: '香港著名歌手、演员',
        worktime: '08:00-16:00',
        status: 1 // 离职
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('singers', null, {});
  }
};