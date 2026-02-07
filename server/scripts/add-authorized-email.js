/**
 * Adiciona um e-mail à lista de autorizados (podem criar conta).
 * Uso: node server/scripts/add-authorized-email.js email@exemplo.com
 *
 * Integração com pagamento: após confirmar pagamento na Hotmart/Eduzz/etc,
 * chame este script (ou uma API interna) para inserir o e-mail em authorized_emails.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const db = require('../db');

const email = process.argv[2];
if (!email || !email.includes('@')) {
  console.error('Uso: node server/scripts/add-authorized-email.js email@exemplo.com');
  process.exit(1);
}

const normalized = email.trim().toLowerCase();
try {
  db.prepare('INSERT INTO authorized_emails (email, payment_confirmed) VALUES (?, 1)').run(normalized);
  console.log('E-mail autorizado:', normalized);
} catch (e) {
  if (e.message.includes('UNIQUE')) {
    console.log('E-mail já estava autorizado:', normalized);
  } else {
    throw e;
  }
}
