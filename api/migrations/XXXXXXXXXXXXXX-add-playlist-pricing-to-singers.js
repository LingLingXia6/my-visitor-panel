'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('singers', 'playlist_pricing', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: "歌单定价，默认0元"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('singers', 'playlist_pricing');
  }
};