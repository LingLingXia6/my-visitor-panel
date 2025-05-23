'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // 定义关联
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'viewer'),
      defaultValue: 'viewer',
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
    underscored: true,
    timestamps: true
  });
  return User;
};