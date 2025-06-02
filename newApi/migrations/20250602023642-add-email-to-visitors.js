'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Visitors', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '' // 临时默认值，避免非空约束报错
    });
    // 删除批量赋值 email 的 SQL
    await queryInterface.changeColumn('Visitors', 'email', {
      type: Sequelize.STRING,
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Visitors', 'email');
  }
};
