'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('SongAndSingers', [
      {
        songId: 1, // 稻香
        singerId: 1, // 周杰伦
        price: 15.00
      },
      {
        songId: 2, // 可惜没如果
        singerId: 2, // 林俊杰
        price: 12.50
      },
      {
        songId: 3, // 吻别
        singerId: 3, // 张学友
        price: 20.00
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('SongAndSingers', null, {});
  }
};