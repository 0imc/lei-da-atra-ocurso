/**
 * Controle de sessões: uma sessão ativa por usuário.
 * Usado pelo auth.js para criar, validar e invalidar sessões.
 */
const db = require('./db');
const { v4: uuidv4 } = require('uuid');

function createSession(userId, fingerprint, ip) {
  const id = uuidv4();
  db.prepare('INSERT INTO sessions (id, user_id, fingerprint, ip) VALUES (?, ?, ?, ?)').run(
    id,
    userId,
    fingerprint || null,
    ip || null
  );
  return id;
}

function deleteSessionsByUserId(userId) {
  return db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

function getSession(sessionId, userId) {
  return db.prepare('SELECT id, user_id FROM sessions WHERE id = ? AND user_id = ?').get(sessionId, userId);
}

function touchSession(sessionId) {
  return db.prepare("UPDATE sessions SET last_activity = datetime('now') WHERE id = ?").run(sessionId);
}

module.exports = {
  createSession,
  deleteSessionsByUserId,
  getSession,
  touchSession
};
