'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 添加 phone 字段
    await queryInterface.addColumn('Users', 'phone', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // 为现有用户设置不同的手机号
    await queryInterface.bulkUpdate('Users', 
      { phone: '13800138001' }, 
      { id: 1 }
    );
    
    await queryInterface.bulkUpdate('Users', 
      { phone: '13800138002' }, 
      { id: 2 }
    );
    
    await queryInterface.bulkUpdate('Users', 
      { phone: '13800138003' }, 
      { id: 3 }
    );
  },

  async down(queryInterface, Sequelize) {
    // 回滚时删除 phone 字段
    await queryInterface.removeColumn('Users', 'phone');
  }
};