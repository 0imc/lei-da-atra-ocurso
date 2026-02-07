const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAdmin, getAdminToken } = require('../middleware/adminAuth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/'
};

router.post('/login', (req, res) => {
  if (!ADMIN_PASSWORD) {
    return res.status(503).json({ error: 'Admin não configurado.' });
  }
  const { password } = req.body || {};
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Senha incorreta.' });
  }
  const token = jwt.sign(
    { role: 'admin' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  res.cookie('admin_token', token, ADMIN_COOKIE_OPTIONS);
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  res.clearCookie('admin_token', { path: '/' });
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const token = getAdminToken(req);
  if (!token || !ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') return res.status(401).json({ error: 'unauthorized' });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized' });
  }
});

router.get('/authorized-emails', requireAdmin, (req, res) => {
  const list = db.prepare('SELECT id, email, created_at FROM authorized_emails ORDER BY created_at DESC').all();
  res.json({ list });
});

router.post('/authorized-emails', requireAdmin, (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const initialPassword = typeof req.body?.initialPassword === 'string' ? req.body.initialPassword.trim() : '';
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'E-mail inválido.' });
  }
  try {
    db.prepare('INSERT INTO authorized_emails (email, payment_confirmed) VALUES (?, 1)').run(email).catch(() => {});
    const authRow = db.prepare('SELECT id, email, created_at FROM authorized_emails WHERE email = ?').get(email);
    if (!authRow) {
      const existing = db.prepare('SELECT id FROM authorized_emails WHERE email = ?').get(email);
      if (existing) authRow = db.prepare('SELECT id, email, created_at FROM authorized_emails WHERE email = ?').get(email);
    }
    let userCreated = false;
    if (initialPassword.length >= 6) {
      const hash = bcrypt.hashSync(initialPassword, 10);
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existingUser) {
        db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hash, email);
      } else {
        db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, hash);
        userCreated = true;
      }
    }
    return res.status(201).json({ added: authRow, userCanLogin: userCreated || !!db.prepare('SELECT id FROM users WHERE email = ?').get(email) });
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      const authRow = db.prepare('SELECT id, email, created_at FROM authorized_emails WHERE email = ?').get(email);
      if (initialPassword.length >= 6) {
        const hash = bcrypt.hashSync(initialPassword, 10);
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) {
          db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hash, email);
        } else {
          db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, hash);
        }
      }
      return res.status(201).json({ added: authRow, userCanLogin: !!db.prepare('SELECT id FROM users WHERE email = ?').get(email) });
    }
    throw e;
  }
});

router.delete('/authorized-emails/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'ID inválido.' });
  const result = db.prepare('DELETE FROM authorized_emails WHERE id = ?').run(id);
  if (result.changes === 0) return res.status(404).json({ error: 'Não encontrado.' });
  res.json({ ok: true });
});

module.exports = router;
