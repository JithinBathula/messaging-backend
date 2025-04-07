const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../../config/database');

async function generateMessages(totalCount = 5000000) {
  console.log(`Generating ${totalCount} messages...`);
  
  try {
    // Get all contact IDs
    const { rows: contactRows } = await db.query('SELECT id FROM contacts');
    const contactIds = contactRows.map(row => row.id);
    
    if (contactIds.length === 0) {
      throw new Error('No contacts found in the database');
    }
    
    // Load message content from CSV
    const messageSamples = [];
    const csvPath = path.resolve(__dirname, 'message_content.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at ${csvPath}`);
    }
    
    // Fallback: Read the file line by line if the CSV parsing fails
    console.log(`Reading messages from ${csvPath}`);
    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const lines = fileContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && trimmedLine.length > 0) {
        messageSamples.push(trimmedLine);
      }
    }
    
    console.log(`Loaded ${messageSamples.length} message samples`);
    
    if (messageSamples.length === 0) {
      throw new Error('No message content found in CSV');
    }
    
    // Create temporary table for bulk insert
    await db.query(`
      CREATE TEMP TABLE temp_messages (
        contact_id INTEGER,
        content TEXT,
        created_at TIMESTAMP WITH TIME ZONE
      )
    `);
    
    const batchSize = 10000;
    const batches = Math.ceil(totalCount / batchSize);
    
    // Generate message distribution based on Pareto principle (80/20 rule)
    // 20% of contacts will have 80% of messages
    const highVolumeContactCount = Math.floor(contactIds.length * 0.2);
    const highVolumeContactIds = contactIds.slice(0, highVolumeContactCount);
    const lowVolumeContactIds = contactIds.slice(highVolumeContactCount);
    
    const highVolumeMessageCount = Math.floor(totalCount * 0.8);
    const lowVolumeMessageCount = totalCount - highVolumeMessageCount;
    
    // Function to get a random item from an array
    const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
    
    // Function to get a random timestamp within the last year
    const getRandomTimestamp = () => {
      const now = new Date();
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      
      return new Date(
        oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime())
      ).toISOString();
    };
    
    // Insert high volume contact messages
    let messagesInserted = 0;
    
    for (let i = 0; i < batches && messagesInserted < totalCount; i++) {
      const values = [];
      const params = [];
      let paramIndex = 1;
      
      const currentBatchSize = Math.min(batchSize, totalCount - messagesInserted);
      
      for (let j = 0; j < currentBatchSize; j++) {
        // Decide if this message goes to a high or low volume contact
        const contactId = messagesInserted < highVolumeMessageCount
          ? getRandomItem(highVolumeContactIds)
          : getRandomItem(lowVolumeContactIds);
        
        values.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2})`);
        params.push(
          contactId,
          getRandomItem(messageSamples),
          getRandomTimestamp()
        );
        paramIndex += 3;
        messagesInserted++;
      }
      
      await db.query(`
        INSERT INTO temp_messages (contact_id, content, created_at)
        VALUES ${values.join(', ')}
      `, params);
      
      console.log(`Inserted batch ${i + 1}/${batches} (${messagesInserted}/${totalCount} messages)`);
    }
    
    // Insert from temp table to actual table
    await db.query(`
      INSERT INTO messages (contact_id, content, created_at)
      SELECT contact_id, content, created_at FROM temp_messages
    `);
    
    console.log(`Successfully generated ${totalCount} messages`);
  } catch (error) {
    console.error('Error generating messages:', error);
    throw error;
  }
}

module.exports = generateMessages;