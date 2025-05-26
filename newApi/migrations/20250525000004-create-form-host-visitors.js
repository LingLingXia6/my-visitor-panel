'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FormHostVisitors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      VisitorsFormId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'VisitorsForms',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      host_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Host',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      visitor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Visitors',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      isMinRole: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0
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
    
    // 添加复合唯一索引
    await queryInterface.addIndex('FormHostVisitors', ['VisitorsFormId', 'host_id', 'visitor_id'], {
      unique: true,
      name: 'unique_form_host_visitor'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('FormHostVisitors');
  }
};