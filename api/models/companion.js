'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Companion extends Model {
    static associate(models) {
      Companion.belongsTo(models.Visitor, { foreignKey: 'visitor_id' });
    }
  }
  Companion.init({
    visitor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: DataTypes.STRING(20),
    id_card: DataTypes.STRING(20)
  }, {
    sequelize,
    modelName: 'Companion',
    underscored: true,
    timestamps: true
  });
  return Companion;
};