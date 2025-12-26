const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');
const sequelize = require('./sequelize');

const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, '../migrations/*.js'),
    resolve: ({ name, path: filepath }) => {
      const migration = require(filepath);
      return {
        name,
        up: async () => migration.up(sequelize.getQueryInterface(), sequelize.constructor),
        down: async () => migration.down(sequelize.getQueryInterface(), sequelize.constructor),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

module.exports = umzug;

