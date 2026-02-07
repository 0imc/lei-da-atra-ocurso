/**
 * Rotas de autenticação e middleware de proteção.
 * Login, registro (apenas e-mails autorizados), logout, validação de sessão única.
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const sessions = require('./sessions');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
};

const BLOCK_MESSAGE = '⚠️ Acesso bloqueado. Este curso é individual e exclusivo. Detectamos tentativa de acesso simultâneo ou compartilhamento de conta. Caso você tenha trocado de dispositivo, faça login novamente. Se o problema persistir, entre em contato com o suporte.';

function getToken(req) {
  const cookie = req.cookies && req.cookies.auth_token;
  const header = req.headers.authorization;
  if (cookie) return cookie;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

function requireAuth(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'unauthorized', message: 'Token ausente.' });
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized', message: 'Token inválido ou expirado.' });
  }
  const { userId, sessionId } = payload;
  if (!userId || !sessionId) return res.status(401).json({ error: 'unauthorized', message: 'Token inválido.' });
  const session = sessions.getSession(sessionId, userId);
  if (!session) {
    return res.status(403).json({ error: 'session_invalid', message: BLOCK_MESSAGE });
  }
  const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(401).json({ error: 'unauthorized', message: 'Usuário não encontrado.' });
  sessions.touchSession(sessionId);
  req.user = user;
  req.sessionId = sessionId;
  next();
}

function requireAuthRedirect(req, res, next) {
  const token = getToken(req);
  if (!token) return res.redirect('/auth/login.html?error=unauthorized');
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.redirect('/auth/login.html?error=unauthorized');
  }
  const { userId, sessionId } = payload;
  const session = sessions.getSession(sessionId, userId);
  if (!session) return res.redirect('/auth/login.html?error=blocked');
  const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(userId);
  if (!user) return res.redirect('/auth/login.html?error=unauthorized');
  sessions.touchSession(sessionId);
  req.user = user;
  req.sessionId = sessionId;
  next();
}

router.post('/register', (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres.' });
  }
  const authorized = db.prepare('SELECT id FROM authorized_emails WHERE email = ?').get(normalizedEmail);
  if (!authorized) {
    return res.status(403).json({ error: 'Este e-mail não está autorizado a criar conta. Entre em contato com o suporte.' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'Já existe uma conta com este e-mail. Faça login.' });
  }
  const password_hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(normalizedEmail, password_hash);
  const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(normalizedEmail);
  const sessionId = sessions.createSession(user.id, req.body.fingerprint, req.ip || req.connection?.remoteAddress);
  const token = jwt.sign({ userId: user.id, sessionId }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('auth_token', token, COOKIE_OPTIONS);
  res.status(201).json({ user: { id: user.id, email: user.email }, token });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }
  const user = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(normalizedEmail);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }
  sessions.deleteSessionsByUserId(user.id);
  const sessionId = sessions.createSession(user.id, req.body.fingerprint, req.ip || req.connection?.remoteAddress);
  const token = jwt.sign({ userId: user.id, sessionId }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('auth_token', token, COOKIE_OPTIONS);
  res.json({ user: { id: user.id, email: user.email }, token });
});

router.post('/logout', requireAuth, (req, res) => {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(req.sessionId);
  res.clearCookie('auth_token', { path: '/' });
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const { userId, sessionId } = payload;
  const session = sessions.getSession(sessionId, userId);
  if (!session) {
    return res.status(403).json({ error: 'session_invalid', message: BLOCK_MESSAGE });
  }
  const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  sessions.touchSession(sessionId);
  res.json({ user: { id: user.id, email: user.email } });
});

module.exports = {
  router,
  requireAuth,
  requireAuthRedirect,
  getToken
};
