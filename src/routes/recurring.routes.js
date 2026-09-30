'use strict';

const express = require('express');
const RecurringController = require('../controllers/recurring.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const recurringV = require('../validators/recurring.validators');

const router = express.Router();

router.use(authenticate);
router.get('/', authorize('recurring:read'), RecurringController.list);
router.post('/', authorize('recurring:create'), recurringV.createRecurring, validate, RecurringController.create);
router.get('/:id', authorize('recurring:read'), recurringV.recurringId, validate, RecurringController.getById);
router.put('/:id', authorize('recurring:update'), recurringV.updateRecurring, validate, RecurringController.update);
router.post('/:id/record-payment', authorize('recurring:record_payment'), recurringV.recurringId, validate, RecurringController.recordPayment);
router.delete('/:id', authorize('recurring:delete'), recurringV.recurringId, validate, RecurringController.delete);

module.exports = router;