const generateContacts = require('./generateContacts');
const generateMessages = require('./generateMessages');

async function runSeeders() {
  try {
    await generateContacts(100000);
    await generateMessages(5000000);
    
    console.log('Data generation completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Data generation error:', error);
    process.exit(1);
  }
}

runSeeders();