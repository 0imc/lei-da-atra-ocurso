const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function getAdminToken(req) {
  const cookie = req.cookies && req.cookies.admin_token;
  const header = req.headers.authorization;
  if (cookie) return cookie;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

function requireAdmin(req, res, next) {
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(503).json({ error: 'Admin não configurado. Defina ADMIN_PASSWORD no .env' });
  }
  const token = getAdminToken(req);
  if (!token) {
    return res.status(401).json({ error: 'unauthorized', message: 'Faça login como administrador.' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'forbidden' });
    }
    req.admin = true;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized', message: 'Sessão admin inválida ou expirada.' });
  }
}

function requireAdminRedirect(req, res, next) {
  if (!process.env.ADMIN_PASSWORD) return next();
  const token = getAdminToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role === 'admin') {
      req.admin = true;
    }
  } catch (e) {}
  next();
}

module.exports = { requireAdmin, requireAdminRedirect, getAdminToken };
