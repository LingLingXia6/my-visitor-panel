'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 先删除旧表（如果存在）
    await queryInterface.dropTable('SongAndSingers');
    
    // 创建新表
    await queryInterface.createTable('singer_song', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      singer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'singers',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      song_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'songs',
          key: 'id'
        },
        onDelete: 'CASCADE'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // 回滚操作
    await queryInterface.dropTable('singer_song');
    
    // 如果需要恢复旧表，可以在这里添加创建旧表的代码
  }
};