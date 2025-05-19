'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 添加列
    await queryInterface.addColumn('songs', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: "优美旋律",
      comment: "歌曲背景描述"
    });
    
    // 更新所有现有记录的description字段为"优美旋律"
    await queryInterface.sequelize.query(
      `UPDATE songs SET description = '优美旋律' WHERE description IS NULL`
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('songs', 'description');
  }
};