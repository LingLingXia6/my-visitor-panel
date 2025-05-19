'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SongAndSinger extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // 修改关联，确保关联到 singers 和 songs 的 id 字段
      SongAndSinger.belongsTo(models.singers, { 
        foreignKey: 'singerId',
        targetKey: 'id'  // 明确指定目标键为 id
      });
      SongAndSinger.belongsTo(models.songs, { 
        foreignKey: 'songId',
        targetKey: 'id'  // 明确指定目标键为 id
      });
    }
  }
  SongAndSinger.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    singerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'singer_id',
      references: {
        model: 'singers',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    songId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'song_id',
      references: {
        model: 'songs',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
    // 这里可以添加其他字段，如：
    // performanceDate: {
    //   type: DataTypes.DATE,
    //   field: 'performance_date'
    // },
    // role: {
    //   type: DataTypes.STRING(50)
    // }
  }, {
    sequelize,
    modelName: 'SongAndSinger',
    tableName: 'singer_song', // 设置表名为singer_song
    timestamps: false,
  });
  return SongAndSinger;
};