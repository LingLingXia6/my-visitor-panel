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
      FormHostVisitors.belongsTo(models.Visitors, { foreignKey: 'visitor_id', onDelete: 'CASCADE' });
      FormHostVisitors.belongsTo(models.Host, { foreignKey: 'host_id', onDelete: 'CASCADE' });
      FormHostVisitors.belongsTo(models.VisitorsForms, { foreignKey: 'VisitorsFormId', onDelete: 'CASCADE' });
    }
  }
  FormHostVisitors.init({
    VisitorsFormId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'VisitorsForms',
        key: 'id'
      }
    },
    host_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Host',
        key: 'id'
      }
    },
    visitor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Visitors',
        key: 'id'
      }
    },
    isMinRole: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
  }, {
    sequelize,
    modelName: 'FormHostVisitors',
    indexes: [
      {
        unique: true,
        name: 'unique_form_host_visitor',
        fields: ['VisitorsFormId', 'host_id', 'visitor_id']
      }
    ]
  });
  return FormHostVisitors;
};