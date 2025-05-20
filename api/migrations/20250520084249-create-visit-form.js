'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('VisitForms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      visitor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Visitors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      visit_reason: {
        allowNull: false,
        type: Sequelize.TEXT,
        allowNull: true
      },
      visit_time: {
        allowNull: false,
        type: Sequelize.DATE,
        allowNull: true
      },
      location: {
        allowNull: false,
        type: Sequelize.STRING(100),
        allowNull: true
      },
      host_name: {
        allowNull: false,
        type: Sequelize.STRING(100),
        allowNull: true
      },
      host_phone: {
        allowNull: false,
        type: Sequelize.STRING(20),
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('VisitForms');
  }
};