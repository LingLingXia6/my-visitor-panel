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
      VisitorsForms.belongsToMany(models.Host, { through: "FormHostVisitors", foreignKey: 'VisitorsFormId' });
      VisitorsForms.belongsToMany(models.Visitors, { through: "FormHostVisitors", foreignKey: 'VisitorsFormId' });
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
  },
  approved:{
    type:DataTypes.BOOLEAN,
    allowNull:true,
    defaultValue:false
  }
  }, {
    sequelize,
    modelName: 'VisitorsForms',
    indexes: [
      {
        name: 'idx_visit_time',
        fields: ['visit_time']
      },
      {
        name: 'idx_visit_time_approved',
        fields: ['visit_time', 'approved']
      }
    ]
  });
  return VisitorsForms;
};