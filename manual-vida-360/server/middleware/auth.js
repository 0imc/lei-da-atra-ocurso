const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET must be set in .env');

/**
 * Lê o token do cookie (auth_token) ou do header Authorization.
 */
function getToken(req) {
  const cookie = req.cookies && req.cookies.auth_token;
  const header = req.headers.authorization;
  if (cookie) return cookie;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

/**
 * Middleware: exige autenticação válida e sessão única ativa.
 * Define req.user = { id, email } e req.sessionId.
 * Em caso de token inválido ou sessão encerrada (outro dispositivo), retorna 401/403.
 */
function requireAuth(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ error: 'unauthorized', message: 'Token ausente.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized', message: 'Token inválido ou expirado.' });
  }

  const { userId, sessionId } = payload;
  if (!userId || !sessionId) {
    return res.status(401).json({ error: 'unauthorized', message: 'Token inválido.' });
  }

  const session = db.prepare('SELECT id, user_id FROM sessions WHERE id = ? AND user_id = ?').get(sessionId, userId);
  if (!session) {
    return res.status(403).json({
      error: 'session_invalid',
      message: '⚠️ Acesso bloqueado. Este curso é individual e exclusivo. Detectamos tentativa de acesso simultâneo ou compartilhamento de conta. Caso você tenha trocado de dispositivo, faça login novamente. Se o problema persistir, entre em contato com o suporte.'
    });
  }

  const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', message: 'Usuário não encontrado.' });
  }

  db.prepare("UPDATE sessions SET last_activity = datetime('now') WHERE id = ?").run(sessionId);
  req.user = user;
  req.sessionId = sessionId;
  next();
}

/**
 * Para rotas HTML (ex.: /curso): em 401/403 redireciona para /login com query.
 */
function requireAuthRedirect(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return res.redirect('/login?error=unauthorized');
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.redirect('/login?error=unauthorized');
  }

  const { userId, sessionId } = payload;
  const session = db.prepare('SELECT id FROM sessions WHERE id = ? AND user_id = ?').get(sessionId, userId);
  if (!session) {
    return res.redirect('/login?error=blocked');
  }

  const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.redirect('/login?error=unauthorized');
  }

  db.prepare("UPDATE sessions SET last_activity = datetime('now') WHERE id = ?").run(sessionId);
  req.user = user;
  req.sessionId = sessionId;
  next();
}

module.exports = { requireAuth, requireAuthRedirect, getToken };
