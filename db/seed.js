// db/seed.js
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const csv = require('fast-csv');
const { faker } = require('@faker-js/faker');


// --- Database connection ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function loadMessageTemplates() {
  return new Promise((resolve, reject) => {
    const messages = [];
    fs.createReadStream('message_content.csv')
      // .pipe(csv.parse({ headers: true }))
      .pipe(csv.parse({ headers: true, ignoreEmpty: true, quote: '"', escape: '"' }))
      .on('data', row => {
        if (row.content) messages.push(row.content);
      })
      .on('end', () => resolve(messages))
      .on('error', reject);
  });
}

async function insertContacts(count = 100000) {
  const client = await pool.connect();
  try {
    console.log('Inserting contacts...');
    for (let i = 0; i < count; i += 1000) {
      const values = [];
      for (let j = 0; j < 1000; j++) {
        //const name = faker.person.fullName();
        //const phone = faker.phone.number('+91 ##########');
        const name = faker.person.fullName().replace(/'/g, "''"); // Escape apostrophes
        const phone = faker.phone.number('+91 ##########').replace(/'/g, "''").slice(0, 20);
        values.push(`('${name}', '${phone}')`);
      }
      const query = `
        INSERT INTO contacts (name, phone_number)
        VALUES ${values.join(',')};
      `;
      await client.query(query);
      console.log(`Inserted contacts: ${i + 1000}`);
    }
  } finally {
    client.release();
  }
}

async function insertMessages(messageTemplates, total = 5000000) {
  const client = await pool.connect();
  try {
    const { rows: contacts } = await client.query('SELECT id FROM contacts');
    const contactIds = contacts.map(row => row.id);

    console.log('Inserting messages...');
    for (let i = 0; i < total; i += 10000) {
      const values = [];
      for (let j = 0; j < 10000; j++) {
        const contactId = contactIds[Math.floor(Math.random() * contactIds.length)];
        const content = messageTemplates[Math.floor(Math.random() * messageTemplates.length)].replace(/'/g, "''");
        const timestamp = faker.date.past(2).toISOString();
        values.push(`(${contactId}, '${content}', '${timestamp}')`);
      }

      const query = `
        INSERT INTO messages (contact_id, content, timestamp)
        VALUES ${values.join(',')};
      `;
      await client.query(query);
      console.log(`Inserted messages: ${i + 10000}`);
    }
  } finally {
    client.release();
  }
}

async function main() {
  const templates = await loadMessageTemplates();
  await insertContacts(); // 100k
  await insertMessages(templates); // 5M
  console.log('✅ Done populating database.');
  process.exit();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
