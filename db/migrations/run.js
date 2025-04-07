const fs = require('fs');
const path = require('path');
const db = require('../../config/database');

async function runMigrations() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    
    console.log('Running migrations...');
    await db.query(sql);
    console.log('Migrations completed successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigrations();