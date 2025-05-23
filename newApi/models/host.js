'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Host extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Host.belongsTo(models.Visitors,{through:'formhostvisitors',foreignKey:'host_id'});
      Host.belongsTo(models.VisitorsForms,{through:'formhostvisitors',foreignKey:'host_id'});
    }
  }
  Host.init({
   
   name: {
       type: DataTypes.STRING(100),
      allowNull: false
    },
     phone: {
       type: DataTypes.STRING(100),
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Host',
    indexes: [
      {
        unique: true,
        fields: ['phone']
      }
    ]
  });
  return Host;
};