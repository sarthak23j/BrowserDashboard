const Database = require('better-sqlite3');
const path = require('path');

// Database in the root of server folder
const dbPath = path.join(__dirname, 'creds.db');
const db = new Database(dbPath);

// Create table if not exists
const createTable = `
  CREATE TABLE IF NOT EXISTS credentials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service TEXT NOT NULL,
    tags TEXT, -- JSON array
    data TEXT NOT NULL, -- Encrypted content
    iv TEXT NOT NULL, -- Initialization vector for encryption
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.exec(createTable);

module.exports = db;
