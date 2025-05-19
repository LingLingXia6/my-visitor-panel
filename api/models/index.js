const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Import all models
const initModels = require('./init-models');
const models = initModels(sequelize);

// Add models to db object
Object.keys(models).forEach(modelName => {
  db[modelName] = models[modelName];
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db; 