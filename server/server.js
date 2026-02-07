/**
 * Servidor principal (PROD_MODE).
 * Serve auth em /auth, curso protegido em /curso, API em /api/auth.
 */
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { router: authRouter, requireAuthRedirect } = require('./auth');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

if (!process.env.JWT_SECRET) {
  console.error('Defina JWT_SECRET no arquivo .env');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = path.join(__dirname, '..');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);

if (process.env.ADMIN_PASSWORD) {
  const adminRoutes = require('./routes/admin');
  app.use('/api/admin', adminRoutes);
  app.get('/admin', (req, res) => {
    res.sendFile(path.join(rootDir, 'public', 'admin.html'));
  });
}

app.get('/', (req, res) => {
  res.redirect('/auth/login.html');
});

app.use('/auth', express.static(path.join(rootDir, 'auth')));

app.get('/curso', requireAuthRedirect, (req, res) => {
  res.sendFile(path.join(rootDir, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Servidor rodando em http://localhost:' + PORT);
  console.log('Login: /auth/login.html | Curso (protegido): /curso');
});
