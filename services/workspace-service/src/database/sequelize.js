const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV !== 'production' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;

