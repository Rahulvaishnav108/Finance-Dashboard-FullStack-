'use strict';

const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/database');
const logger = require('./logger');

const recentEvents = new Map();
const DEDUPE_WINDOW_MS = 60_000;
const RETENTION_DAYS = 90;
let lastPrunedAt = 0;

const cleanup = setInterval(() => {
  const cutoff = Date.now() - DEDUPE_WINDOW_MS;
  for (const [key, timestamp] of recentEvents) {
    if (timestamp < cutoff) recentEvents.delete(key);
  }
}, DEDUPE_WINDOW_MS);
cleanup.unref();

function recordSecurityEvent({ eventType, severity = 'low', message, req, userId = null }) {
  const ipAddress = req?.ip || null;
  const routePath = req?.path || null;
  const key = `${eventType}:${ipAddress || 'unknown'}:${routePath || ''}`;
  const now = Date.now();
  const lastSeen = recentEvents.get(key);
  if (lastSeen && now - lastSeen < DEDUPE_WINDOW_MS) return;
  recentEvents.set(key, now);

  if (recentEvents.size > 5000) {
    const cutoff = now - DEDUPE_WINDOW_MS;
    for (const [eventKey, timestamp] of recentEvents) {
      if (timestamp < cutoff || recentEvents.size > 4000) recentEvents.delete(eventKey);
    }
  }

  try {
    getDb().prepare(`
      INSERT INTO security_events (id, event_type, severity, message, ip_address, path, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), eventType, severity, message, ipAddress, routePath, userId);
    if (now - lastPrunedAt > 24 * 60 * 60 * 1000) {
      const retentionCutoff = new Date(now - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
      getDb().prepare('DELETE FROM security_events WHERE created_at < ?').run(retentionCutoff);
      lastPrunedAt = now;
    }
  } catch (err) {
    logger.error('Security event write failed', { error: err.message });
  }
}

module.exports = { recordSecurityEvent };