'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDb, closeDb } = require('../config/database');
const config = require('../config');

async function bootstrapAdmin() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const fullName = process.env.BOOTSTRAP_ADMIN_NAME?.trim();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Set BOOTSTRAP_ADMIN_EMAIL to a valid email address.');
  }
  if (!fullName || fullName.length < 2 || fullName.length > 100) {
    throw new Error('Set BOOTSTRAP_ADMIN_NAME to a name between 2 and 100 characters.');
  }
  if (
    !password ||
    password.length < 16 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    throw new Error('Set BOOTSTRAP_ADMIN_PASSWORD to a unique 16+ character password with upper/lowercase letters, a number, and a symbol.');
  }

  const db = getDb();
  const createAdmin = db.transaction(() => {
    const existingAdmin = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
    if (existingAdmin) {
      throw new Error('An admin account already exists; refusing to create another bootstrap admin.');
    }

    const passwordHash = bcrypt.hashSync(password, config.bcrypt.saltRounds);
    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?, 'admin')
    `).run(uuidv4(), email, passwordHash, fullName);
  });

  createAdmin();
  console.log(`Created initial FinanceOS admin account for ${email}.`);
}

bootstrapAdmin()
  .catch((error) => {
    console.error(`Admin bootstrap failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(closeDb);
