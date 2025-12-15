const db = require('../db');

function createUserRepository({ dbClient = db } = {}) {
  return {
    async findByEmail(email) {
      const normalized = email.toLowerCase();
      const result = await dbClient.query(
        'SELECT id, email, password_hash, name, created_at FROM users WHERE email = $1',
        [normalized]
      );
      return result.rows[0] || null;
    },

    async createUser({ email, passwordHash, name }) {
      const normalized = email.toLowerCase();
      const result = await dbClient.query(
        'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
        [normalized, passwordHash, name || null]
      );
      return result.rows[0];
    },

    async findById(id) {
      const result = await dbClient.query(
        'SELECT id, email, name, created_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    },
  };
}

module.exports = { createUserRepository };

