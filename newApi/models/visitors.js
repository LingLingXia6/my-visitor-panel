'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Visitors extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Visitors.belongsToMany(models.Host, { through: "FormHostVisitors", foreignKey: 'visitor_id' });
      Visitors.belongsToMany(models.VisitorsForms, { through: "FormHostVisitors", foreignKey: 'visitor_id' });
    }
  }
  Visitors.init({
    name:{
    type:DataTypes.STRING,
     allowNull: false
    },
    phone:{
      type:DataTypes.STRING,
     allowNull: false
    }, 
    id_card: {
      type:DataTypes.STRING,
     allowNull: false
    },
    company: {
      type:DataTypes.STRING,
     allowNull: false
    },
    email: {
      type:DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Visitors',
    indexes: [
      {
        unique: true,
        fields: ['id_card']
      }
    ]
  });
  return Visitors;
};