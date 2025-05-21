'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Visitor extends Model {
    static associate(models) {
      Visitor.hasMany(models.Companion, { foreignKey: 'visitor_id' });
      Visitor.hasMany(models.VisitForm, { foreignKey: 'visitor_id' });
    }
  }
  Visitor.init({
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    id_card: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    company: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Visitor',
    underscored: true,
    timestamps: true
  });
  return Visitor;
};