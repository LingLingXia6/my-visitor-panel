'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Visitors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      id_card: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      company: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: ''
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    
    // 添加唯一索引
    await queryInterface.addIndex('Visitors', ['id_card'], {
      unique: true,
      name: 'visitors_id_card_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Visitors');
  }
};