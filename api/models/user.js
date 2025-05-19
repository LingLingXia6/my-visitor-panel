'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcryptjs');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        // 检查是否为空
        if (!value) {
          throw new Error('密码必须填写。');
        }
    console.log("value",value);
        // 检查长度
        if (value.length < 6 || value.length > 45) {
          throw new Error('密码长度必须是6 ~ 45之间。');
        }
    
        // 如果通过所有验证，进行hash处理并设置值
        this.setDataValue('password', bcrypt.hashSync(value, 10));
      }
    },
    introduce: DataTypes.TEXT,
    role: DataTypes.TINYINT
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};