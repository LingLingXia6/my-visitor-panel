'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendee extends Model {
    static associate(models) {
      Attendee.belongsTo(models.VisitForm, { foreignKey: 'form_id' });
    }
  }
  Attendee.init({
    form_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('visitor', 'companion'),
      allowNull: false
    },
    original_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    phone: DataTypes.STRING(20),
    id_card: DataTypes.STRING(20)
  }, {
    sequelize,
    modelName: 'Attendee',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['form_id', 'role', 'original_id']
      }
    ]
  });
  return Attendee;
};