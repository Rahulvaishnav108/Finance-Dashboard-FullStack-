'use strict';

const SecurityService = require('../services/security.service');
const ApiResponse = require('../utils/ApiResponse');

const SecurityController = {
  overview(req, res, next) {
    try { return ApiResponse.success(res, SecurityService.getOverview()); }
    catch (err) { next(err); }
  },

  listBlockedIps(req, res, next) {
    try { return ApiResponse.success(res, SecurityService.listBlockedIps()); }
    catch (err) { next(err); }
  },

  blockIp(req, res, next) {
    try {
      const item = SecurityService.blockIp(req.body, req.user.id, req);
      return ApiResponse.created(res, item, 'IP address blocked');
    } catch (err) { next(err); }
  },

  unblockIp(req, res, next) {
    try {
      SecurityService.unblockIp(req.params.id, req.user.id, req);
      return ApiResponse.success(res, null, 'IP address unblocked');
    } catch (err) { next(err); }
  },
};

module.exports = SecurityController;