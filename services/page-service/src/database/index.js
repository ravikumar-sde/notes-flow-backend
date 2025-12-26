const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  connectionString: config.databaseUrl,
});

pool.on('error', (err) => {
  console.error('Unexpected PG client error (page-service)', err);
});

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== 'test') {
    console.log('page query', { text, duration, rows: res.rowCount });
  }
  return res;
}

module.exports = {
  pool,
  query,
};

