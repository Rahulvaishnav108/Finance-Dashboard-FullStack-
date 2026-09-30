'use strict';

const { body, param } = require('express-validator');

const blockIp = [
  body('ip_address').trim().isIP().withMessage('Enter a valid IPv4 or IPv6 address'),
  body('reason').optional({ nullable: true }).trim().isLength({ max: 200 }).withMessage('Reason must be at most 200 characters'),
];

const blockedIpId = [param('id').isUUID().withMessage('Invalid blocked IP ID')];

module.exports = { blockIp, blockedIpId };