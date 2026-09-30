'use strict';

const { isIP } = require('net');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/database');
const config = require('../config');
const { audit } = require('../utils/audit');
const { recordSecurityEvent } = require('../utils/securityEvents');
const { addBlockedIp, removeBlockedIp, normalizeIp, isLoopback } = require('../middleware/blockChecker');

function serviceError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.isOperational = true;
  return err;
}

const SecurityService = {
  listBlockedIps() {
    return getDb().prepare(`
      SELECT b.id, b.ip_address, b.reason, b.status, b.blocked_at, b.unblocked_at,
        u.full_name AS blocked_by_name
      FROM blocked_ips b
      LEFT JOIN users u ON u.id = b.blocked_by
      WHERE b.status = 'blocked'
      ORDER BY b.blocked_at DESC
    `).all();
  },

  getOverview() {
    const db = getDb();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const metrics = {
      blocked_ip_count: db.prepare("SELECT COUNT(*) AS count FROM blocked_ips WHERE status = 'blocked'").get().count,
      events_24h: db.prepare('SELECT COUNT(*) AS count FROM security_events WHERE created_at >= ?').get(since).count,
      failed_signins_24h: db.prepare("SELECT COUNT(*) AS count FROM security_events WHERE event_type = 'auth.login_failed' AND created_at >= ?").get(since).count,
      rate_limits_24h: db.prepare("SELECT COUNT(*) AS count FROM security_events WHERE event_type = 'request.rate_limited' AND created_at >= ?").get(since).count,
      blocked_requests_24h: db.prepare("SELECT COUNT(*) AS count FROM security_events WHERE event_type = 'ip.blocked_request' AND created_at >= ?").get(since).count,
    };
    const events = db.prepare(`
      SELECT e.id, e.event_type, e.severity, e.message, e.ip_address, e.path, e.created_at,
        u.full_name AS user_name
      FROM security_events e
      LEFT JOIN users u ON u.id = e.user_id
      ORDER BY e.created_at DESC
      LIMIT 100
    `).all();
    const controls = [
      { name: 'HTTP security headers', status: 'active', detail: 'Helmet applies CSP, HSTS, frame and content-type protections' },
      { name: 'API request throttling', status: 'active', detail: `${config.rateLimit.max} requests per ${Math.round(config.rateLimit.windowMs / 60000)} minutes per client IP` },
      { name: 'Authentication throttling', status: 'active', detail: '20 sign-in, registration, or refresh requests per 15 minutes per client IP' },
      { name: 'JWT authentication and RBAC', status: 'active', detail: 'Access tokens are verified and permissions are checked per route' },
      { name: 'Input validation', status: 'active', detail: 'Request parameters and write payloads are validated before services run' },
      { name: 'Persistent IP blocklist', status: 'active', detail: 'Blocked IPs are stored in SQLite and checked before request handling' },
      { name: 'Audit and security events', status: 'active', detail: 'Sensitive actions and selected security events are persisted' },
      { name: 'Trusted proxy resolution', status: config.trustProxy ? 'configured' : 'disabled', detail: config.trustProxy ? `Trusting ${config.trustProxy} proxy hop(s)` : 'Proxy headers are not trusted; configure TRUST_PROXY behind a known proxy' },
    ];
    return { controls, metrics, blocked_ips: this.listBlockedIps(), events };
  },

  blockIp({ ip_address, reason }, userId, req) {
    const ipAddress = normalizeIp(ip_address);
    if (!isIP(ipAddress)) throw serviceError('Enter a valid IPv4 or IPv6 address', 422);
    if (isLoopback(ipAddress) || ipAddress === normalizeIp(req?.ip)) {
      throw serviceError('The current or loopback IP cannot be blocked from this session', 409);
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM blocked_ips WHERE ip_address = ?').get(ipAddress);
    if (existing?.status === 'blocked') throw serviceError('This IP address is already blocked', 409);

    const id = existing?.id || uuidv4();
    if (existing) {
      db.prepare(`
        UPDATE blocked_ips SET reason = ?, status = 'blocked', blocked_by = ?,
          blocked_at = strftime('%Y-%m-%dT%H:%M:%fZ','now'), unblocked_at = NULL
        WHERE id = ?
      `).run(reason || null, userId, id);
    } else {
      db.prepare('INSERT INTO blocked_ips (id, ip_address, reason, blocked_by) VALUES (?, ?, ?, ?)')
        .run(id, ipAddress, reason || null, userId);
    }

    addBlockedIp(ipAddress);
    const item = db.prepare('SELECT * FROM blocked_ips WHERE id = ?').get(id);
    audit({ userId, action: 'security.ip_blocked', resource: 'blocked_ips', resourceId: id, newData: item, req });
    recordSecurityEvent({ eventType: 'ip.blocked', severity: 'high', message: `IP ${ipAddress} added to blocklist`, req, userId });
    return item;
  },

  unblockIp(id, userId, req) {
    const db = getDb();
    const item = db.prepare("SELECT * FROM blocked_ips WHERE id = ? AND status = 'blocked'").get(id);
    if (!item) throw serviceError('Blocked IP not found', 404);
    db.prepare("UPDATE blocked_ips SET status = 'unblocked', unblocked_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?").run(id);
    removeBlockedIp(item.ip_address);
    audit({ userId, action: 'security.ip_unblocked', resource: 'blocked_ips', resourceId: id, oldData: item, req });
    recordSecurityEvent({ eventType: 'ip.unblocked', severity: 'low', message: `IP ${item.ip_address} removed from blocklist`, req, userId });
  },
};

module.exports = SecurityService;