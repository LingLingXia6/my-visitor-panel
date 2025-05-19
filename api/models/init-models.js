var DataTypes = require("sequelize").DataTypes;
var _Articles = require("./Articles");
var _SequelizeMeta = require("./SequelizeMeta");
var _singers = require("./singers");
var _songs = require("./songs");
var _songAndSinger = require('./songandsinger');
var _User = require("./user"); // 添加 User 模型的导入

function initModels(sequelize) {
  var Articles = _Articles(sequelize, DataTypes);
  var SequelizeMeta = _SequelizeMeta(sequelize, DataTypes);
  var singers = _singers(sequelize, DataTypes);
  var songs = _songs(sequelize, DataTypes);
  var songAndSinger = _songAndSinger(sequelize, DataTypes);
  var user = _User(sequelize, DataTypes); // 初始化 User 模型

  return {
    Articles,
    SequelizeMeta,
    singers,
    songs,
    songAndSinger,
    user // 在返回对象中添加 User 模型
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
