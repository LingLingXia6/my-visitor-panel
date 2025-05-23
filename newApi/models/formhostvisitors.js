'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FormHostVisitors extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  FormHostVisitors.init({
    form_id:{
      type:DataTypes.INTEGER,
      allowNull: false
    } ,
    host_id: {
      type:DataTypes.INTEGER,
      allowNull: false
    } ,
    visitor_id:{
      type:DataTypes.INTEGER,
      allowNull: false
    },
    isMinRole:{
      type:DataTypes.TINYINT,
      allowNull: false
    } ,
  }, {
    sequelize,
    modelName: 'FormHostVisitors',
  });
  return FormHostVisitors;
};