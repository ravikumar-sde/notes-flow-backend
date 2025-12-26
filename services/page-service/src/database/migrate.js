const sequelize = require('./sequelize');
const umzug = require('./umzug');

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

