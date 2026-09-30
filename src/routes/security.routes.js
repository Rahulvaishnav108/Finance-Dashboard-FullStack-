'use strict';

const express = require('express');
const SecurityController = require('../controllers/security.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const securityV = require('../validators/security.validators');

const router = express.Router();

router.use(authenticate);
router.get('/overview', authorize('security:read'), SecurityController.overview);
router.get('/blocked-ips', authorize('security:read'), SecurityController.listBlockedIps);
router.post('/blocked-ips', authorize('security:block_ip'), securityV.blockIp, validate, SecurityController.blockIp);
router.delete('/blocked-ips/:id', authorize('security:unblock_ip'), securityV.blockedIpId, validate, SecurityController.unblockIp);

module.exports = router;