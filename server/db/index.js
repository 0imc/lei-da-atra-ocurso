const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/curso.db');

const db = new Database(dbPath);

module.exports = db;
