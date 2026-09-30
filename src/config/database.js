'use strict';

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config');

let _db = null;

function getDb() {
  if (_db) return _db;

  // Ensure data directory exists for file-based DB
  if (config.db.path !== ':memory:') {
    const dir = path.dirname(config.db.path);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  _db = new Database(config.db.path);

  // Performance & integrity pragmas
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  _db.pragma('synchronous = NORMAL');
  _db.pragma('cache_size = -64000'); // 64MB cache
  _db.pragma('temp_store = MEMORY');

  initSchema(_db);
  return _db;
}

function initSchema(db) {
  db.exec(`
    -- ─────────────────────────────────────────
    -- USERS & AUTH
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      full_name     TEXT NOT NULL,
      role          TEXT NOT NULL CHECK(role IN ('viewer','analyst','admin')),
      status        TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive','suspended')),
      created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      last_login_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

    -- ─────────────────────────────────────────
    -- REFRESH TOKENS (token rotation)
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      revoked    INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      user_agent TEXT,
      ip_address TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_rt_user_id    ON refresh_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_rt_token_hash ON refresh_tokens(token_hash);

    -- ─────────────────────────────────────────
    -- CATEGORIES
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS categories (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL UNIQUE COLLATE NOCASE,
      type        TEXT NOT NULL CHECK(type IN ('income','expense','both')),
      color       TEXT,
      icon        TEXT,
      description TEXT,
      created_by  TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    -- ─────────────────────────────────────────
    -- FINANCIAL RECORDS
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS financial_records (
      id            TEXT PRIMARY KEY,
      amount        REAL NOT NULL CHECK(amount > 0),
      type          TEXT NOT NULL CHECK(type IN ('income','expense')),
      category_id   TEXT REFERENCES categories(id) ON DELETE SET NULL,
      date          TEXT NOT NULL,         -- ISO 8601 date YYYY-MM-DD
      description   TEXT,
      notes         TEXT,
      tags          TEXT,                  -- JSON array stored as text
      reference_no  TEXT,
      status        TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','deleted')),
      created_by    TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      updated_by    TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      deleted_at    TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_fr_type       ON financial_records(type);
    CREATE INDEX IF NOT EXISTS idx_fr_category   ON financial_records(category_id);
    CREATE INDEX IF NOT EXISTS idx_fr_date       ON financial_records(date);
    CREATE INDEX IF NOT EXISTS idx_fr_status     ON financial_records(status);
    CREATE INDEX IF NOT EXISTS idx_fr_created_by ON financial_records(created_by);
    CREATE INDEX IF NOT EXISTS idx_fr_date_type  ON financial_records(date, type);

    -- ─────────────────────────────────────────
    -- RECURRING FINANCIAL ITEMS
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS recurring_transactions (
      id                TEXT PRIMARY KEY,
      name              TEXT NOT NULL,
      amount            REAL NOT NULL CHECK(amount > 0),
      type              TEXT NOT NULL CHECK(type IN ('income','expense')),
      frequency         TEXT NOT NULL CHECK(frequency IN ('monthly','yearly')),
      category_id       TEXT REFERENCES categories(id) ON DELETE SET NULL,
      next_due_date     TEXT NOT NULL,
      status            TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','cancelled')),
      notes             TEXT,
      last_recorded_date TEXT,
      last_record_id    TEXT REFERENCES financial_records(id) ON DELETE SET NULL,
      created_by        TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    CREATE INDEX IF NOT EXISTS idx_recurring_status_due ON recurring_transactions(status, next_due_date);
    CREATE INDEX IF NOT EXISTS idx_recurring_category ON recurring_transactions(category_id);

    -- ─────────────────────────────────────────
    -- SECURITY EVENTS & BLOCKED IPs
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS blocked_ips (
      id           TEXT PRIMARY KEY,
      ip_address   TEXT NOT NULL UNIQUE,
      reason       TEXT,
      status       TEXT NOT NULL DEFAULT 'blocked' CHECK(status IN ('blocked','unblocked')),
      blocked_by   TEXT REFERENCES users(id) ON DELETE SET NULL,
      blocked_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      unblocked_at TEXT,
      created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    CREATE INDEX IF NOT EXISTS idx_blocked_ips_status ON blocked_ips(status, blocked_at);

    CREATE TABLE IF NOT EXISTS security_events (
      id          TEXT PRIMARY KEY,
      event_type  TEXT NOT NULL,
      severity    TEXT NOT NULL CHECK(severity IN ('low','medium','high')),
      message     TEXT NOT NULL,
      ip_address  TEXT,
      path        TEXT,
      user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_security_events_type_created ON security_events(event_type, created_at);

    -- ─────────────────────────────────────────
    -- AUDIT LOG
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS audit_logs (
      id          TEXT PRIMARY KEY,
      user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
      action      TEXT NOT NULL,
      resource    TEXT NOT NULL,
      resource_id TEXT,
      old_data    TEXT,                    -- JSON snapshot before change
      new_data    TEXT,                    -- JSON snapshot after change
      ip_address  TEXT,
      user_agent  TEXT,
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    CREATE INDEX IF NOT EXISTS idx_audit_user_id    ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_resource   ON audit_logs(resource, resource_id);
    CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
  `);
}

function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}

// Reset for testing
function resetDb() {
  closeDb();
}

module.exports = { getDb, closeDb, resetDb };
