const fs = require('fs');
const path = require('path');
const db = require('../../config/database');

async function runViewMigration() {
  try {
    console.log('Creating materialized view...');
    const sql = fs.readFileSync(path.join(__dirname, 'add_materialized_view.sql'), 'utf8');
    
    await db.query(sql);
    console.log('Materialized view created successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runViewMigration();