'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('songs', [
      {
        title: '稻香',
        status: 1 // 上架
      },
      {
        title: '可惜没如果',
        status: 1 // 上架
      },
      {
        title: '吻别',
        status: 0 // 下架
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('songs', null, {});
  }
};