'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VisitorsForms extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
       VisitorsForms.belongsToMany(models.Host,{ through: "formhostvisitors", foreignKey: 'form_id' });
      VisitorsForms.belongsToMany(models.visitors,{ through: "formhostvisitors", foreignKey: 'form_id' });
    }
  }
  VisitorsForms.init({
  visit_reason:{
    type:DataTypes.TEXT,
    allowNull: false
  } ,
  visit_time:{
    type:DataTypes.DATE,
    allowNull: false
  },
  location:{
    type:DataTypes.STRING,
    allowNull: false
  } ,
  arrival_time:{
    type:DataTypes.DATE,
    allowNull:true,
  } 
  }, {
    sequelize,
    modelName: 'VisitorsForms',
  });
  return VisitorsForms;
};