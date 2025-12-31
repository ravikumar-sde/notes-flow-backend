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

(async function runMigrations() {
  try {
    console.log('Starting database migrations...');

    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    const pending = await umzug.pending();
    console.log(`Found ${pending.length} pending migrations.`);

    if (pending.length > 0) {
      console.log('Pending migrations:', pending.map(m => m.name).join(', '));
    }

    await umzug.up();
    console.log('All migrations executed successfully.');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
})();

