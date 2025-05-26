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
      Host.belongsToMany(models.Visitors, { through: "FormHostVisitors", foreignKey: 'host_id' });
      Host.belongsToMany(models.VisitorsForms, { through: "FormHostVisitors", foreignKey: 'host_id' });
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
    tableName: 'Host', // 明确指定表名
    indexes: [
      {
        unique: true,
        fields: ['phone']
      }
    ]
  });
  return Host;
};