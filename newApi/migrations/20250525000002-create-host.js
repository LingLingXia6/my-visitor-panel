'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Host', { // 修改表名为复数形式
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
        type: Sequelize.STRING(100),
        allowNull: false
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
    
    // 修改索引对应的表名
    await queryInterface.addIndex('Host', ['phone'], {
      unique: true,
      name: 'host_phone_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Host'); // 同步修改删除表名
  }
};