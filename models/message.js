const db = require('../config/database');

class Message {
  static async findById(id) {
    const query = 'SELECT * FROM messages WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
  
  static async findByContactId(contactId, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM messages 
      WHERE contact_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const { rows } = await db.query(query, [contactId, limit, offset]);
    return rows;
  }
  
  
  
  static async getRecentConversations(limit = 50, offset = 0, searchValue = null) {
    let query = `SELECT * FROM latest_conversations`;
    
    const queryParams = [];
    let paramIndex = 1;
    
    if (searchValue) {
      query += `
        WHERE 
          name ILIKE $${paramIndex} OR
          phone_number ILIKE $${paramIndex} OR
          content ILIKE $${paramIndex}
      `;
      queryParams.push(`%${searchValue}%`);
      paramIndex++;
    }
    
    query += `
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    
    const { rows } = await db.query(query, queryParams);
    return rows;
  }
  
  static async countRecentConversations(searchValue = null) {
    let query = `SELECT COUNT(*) as total FROM latest_conversations`;
    
    const queryParams = [];
    
    if (searchValue) {
      query += `
        WHERE 
          name ILIKE $1 OR
          phone_number ILIKE $1 OR
          content ILIKE $1
      `;
      queryParams.push(`%${searchValue}%`);
    }
    
    const { rows } = await db.query(query, queryParams);
    return parseInt(rows[0].total, 10);
  }

}

module.exports = Message;