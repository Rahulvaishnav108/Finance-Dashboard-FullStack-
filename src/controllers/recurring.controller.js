'use strict';

const RecurringService = require('../services/recurring.service');
const ApiResponse = require('../utils/ApiResponse');

const RecurringController = {
  list(req, res, next) {
    try { return ApiResponse.success(res, RecurringService.list()); }
    catch (err) { next(err); }
  },

  getById(req, res, next) {
    try { return ApiResponse.success(res, RecurringService.getById(req.params.id)); }
    catch (err) { next(err); }
  },

  create(req, res, next) {
    try {
      const item = RecurringService.create(req.body, req.user.id, req);
      return ApiResponse.created(res, item, 'Recurring item created successfully');
    } catch (err) { next(err); }
  },

  update(req, res, next) {
    try {
      const item = RecurringService.update(req.params.id, req.body, req.user.id, req);
      return ApiResponse.success(res, item, 'Recurring item updated successfully');
    } catch (err) { next(err); }
  },

  delete(req, res, next) {
    try {
      RecurringService.delete(req.params.id, req.user.id, req);
      return ApiResponse.success(res, null, 'Recurring item deleted successfully');
    } catch (err) { next(err); }
  },

  recordPayment(req, res, next) {
    try {
      const result = RecurringService.recordPayment(req.params.id, req.user.id, req);
      return ApiResponse.created(res, result, 'Payment recorded in financial records');
    } catch (err) { next(err); }
  },
};

module.exports = RecurringController;