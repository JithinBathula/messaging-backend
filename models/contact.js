const db = require('../config/database');

class Contact {
  static async findById(id) {
    const query = 'SELECT * FROM contacts WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
  
  static async findAll(limit = 50, offset = 0) {
    const query = 'SELECT * FROM contacts ORDER BY id LIMIT $1 OFFSET $2';
    const { rows } = await db.query(query, [limit, offset]);
    return rows;
  }
}

module.exports = Contact;