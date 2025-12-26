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

    const executed = await umzug.executed();
    console.log(`Total executed migrations: ${executed.length}`);
    console.log('Executed migrations:', executed.map(m => m.name).join(', '));

    await sequelize.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await sequelize.close();
    process.exit(1);
  }
})();

