/**
 * Inicializa o banco de dados: cria tabelas e índices.
 * Execute: npm run init-db
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/curso.db');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);

db.exec(`
-- Usuários (apenas compradores autorizados podem se registrar)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- E-mails autorizados a criar conta (pagamento confirmado ou whitelist)
CREATE TABLE IF NOT EXISTS authorized_emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  payment_confirmed INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Uma sessão ativa por usuário (session_id no JWT; outras sessões são removidas no login)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  fingerprint TEXT,
  ip TEXT,
  last_activity TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_authorized_email ON authorized_emails(email);
`);

db.close();
console.log('Banco de dados inicializado em:', dbPath);
