'use strict';

const { getDb } = require('../config/database');
const { recordSecurityEvent } = require('../utils/securityEvents');
const logger = require('../utils/logger');

const blockedAddresses = new Set();
let cacheReady = false;

function normalizeIp(address) {
  const value = String(address || '').trim().toLowerCase();
  return value.startsWith('::ffff:') ? value.slice(7) : value;
}

function isLoopback(address) {
  const ip = normalizeIp(address);
  return ip === '127.0.0.1' || ip === '::1';
}

function refreshBlockedIpCache() {
  const rows = getDb().prepare("SELECT ip_address FROM blocked_ips WHERE status = 'blocked'").all();
  blockedAddresses.clear();
  rows.forEach(row => blockedAddresses.add(normalizeIp(row.ip_address)));
  cacheReady = true;
  return blockedAddresses.size;
}

function addBlockedIp(address) {
  if (!cacheReady) refreshBlockedIpCache();
  blockedAddresses.add(normalizeIp(address));
}

function removeBlockedIp(address) {
  blockedAddresses.delete(normalizeIp(address));
}

function blockChecker(req, res, next) {
  try {
    if (!cacheReady) refreshBlockedIpCache();
    const ip = normalizeIp(req.ip);
    if (!ip || isLoopback(ip) || !blockedAddresses.has(ip)) return next();

    recordSecurityEvent({
      eventType: 'ip.blocked_request',
      severity: 'high',
      message: 'Request rejected by the IP blocklist',
      req,
    });
    return res.status(403).json({ success: false, message: 'This IP address is blocked.' });
  } catch (err) {
    logger.error('IP block check failed', { error: err.message });
    return next();
  }
}

module.exports = { blockChecker, refreshBlockedIpCache, addBlockedIp, removeBlockedIp, normalizeIp, isLoopback };