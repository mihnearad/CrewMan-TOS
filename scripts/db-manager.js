const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const { Client } = require('pg');

async function run() {
  let sql = process.argv[2];
  if (!sql) {
    console.error('Please provide a SQL query or a .sql file path as the first argument.');
    process.exit(1);
  }

  if (sql.endsWith('.sql') && fs.existsSync(sql)) {
      console.log(`Reading SQL from file: ${sql}`);
      sql = fs.readFileSync(sql, 'utf8');
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined in .env.local');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database.');
    
    const res = await client.query(sql);
    
    // For multiple statements (typical in schema files), pg returns an array of results or just the last one depending on configuration, 
    // but typically client.query handles it. However, showing 'rows' might be noisy for a schema dump.
    if (Array.isArray(res)) {
         res.forEach((r, i) => {
             console.log(`Query ${i+1}: ${r.command} ${r.rowCount !== null ? `(Rows: ${r.rowCount})` : ''}`);
         });
    } else {
        console.log('Result:', JSON.stringify(res.rows, null, 2));
        if (res.command) console.log('Command:', res.command);
        if (res.rowCount !== null) console.log('Rows affected:', res.rowCount);
    }
    
  } catch (err) {
    console.error('Error executing query:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
