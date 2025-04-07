const db = require('../../config/database');
const { faker } = require('@faker-js/faker');

async function generateContacts(count = 100000) {
  console.log(`Generating ${count} contacts...`);
  
  try {
    // Create a temporary table for bulk insert
    await db.query(`
      CREATE TEMP TABLE temp_contacts (
        name VARCHAR(100),
        phone_number VARCHAR(20)
      )
    `);
    
    const batchSize = 1000;
    const batches = Math.ceil(count / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const values = [];
      const params = [];
      let paramIndex = 1;
      
      const currentBatchSize = Math.min(batchSize, count - i * batchSize);
      
      for (let j = 0; j < currentBatchSize; j++) {
        values.push(`($${paramIndex}, $${paramIndex + 1})`);
        
        // Generate a consistently formatted phone number that fits in VARCHAR(20)
        const areaCode = Math.floor(Math.random() * 900) + 100;
        const prefix = Math.floor(Math.random() * 900) + 100;
        const lineNum = Math.floor(Math.random() * 9000) + 1000;
        const phoneNumber = `(${areaCode}) ${prefix}-${lineNum}`;
        
        params.push(
          faker.person.fullName(),
          phoneNumber
        );
        paramIndex += 2;
      }
      
      await db.query(`
        INSERT INTO temp_contacts (name, phone_number)
        VALUES ${values.join(', ')}
      `, params);
      
      console.log(`Inserted batch ${i + 1}/${batches}`);
    }
    
    // Insert from temp table to actual table
    await db.query(`
      INSERT INTO contacts (name, phone_number)
      SELECT name, phone_number FROM temp_contacts
    `);
    
    console.log(`Successfully generated ${count} contacts`);
  } catch (error) {
    console.error('Error generating contacts:', error);
    throw error;
  }
}

module.exports = generateContacts;