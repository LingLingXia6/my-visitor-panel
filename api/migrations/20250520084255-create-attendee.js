'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Attendees', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      form_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'VisitForms',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('visitor', 'companion'),
        allowNull: false
      },
      original_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      id_card: {
        type: Sequelize.STRING(20),
        allowNull: false,
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
    
    // 添加唯一约束
    await queryInterface.addConstraint('Attendees', {
      fields: ['form_id', 'role', 'original_id'],
      type: 'unique',
      name: 'unique_attendee'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Attendees');
  }
};