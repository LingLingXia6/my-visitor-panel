'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 添加 approved 字段
    await queryInterface.addColumn('VisitorsForms', 'approved', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: null
    });
    
    // 不设置任何初始值，保持所有记录的 approved 字段为 null
  },

  async down(queryInterface, Sequelize) {
    // 回滚时删除 approved 字段
    await queryInterface.removeColumn('VisitorsForms', 'approved');
  }
};