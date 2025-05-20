'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VisitForm extends Model {
    static associate(models) {
      VisitForm.belongsTo(models.Visitor, { foreignKey: 'visitor_id' });
      VisitForm.hasMany(models.Attendee, { foreignKey: 'form_id' });
    }
  }
  VisitForm.init({
    visitor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    visit_reason: DataTypes.TEXT,
    visit_time: DataTypes.DATE,
    location: DataTypes.STRING(100),
    host_name: DataTypes.STRING(100),
    host_phone: DataTypes.STRING(20)
  }, {
    sequelize,
    modelName: 'VisitForm',
    tableName: 'VisitForms', // 修改为实际的表名 VisitForms
    underscored: true,
    timestamps: true
  });
  return VisitForm;
};