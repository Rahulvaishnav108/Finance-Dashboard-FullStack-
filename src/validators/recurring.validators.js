'use strict';

const { body, param } = require('express-validator');

const createRecurring = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }).withMessage('Name must be at most 120 characters'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than zero').toFloat(),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('frequency').isIn(['monthly', 'yearly']).withMessage('Frequency must be monthly or yearly'),
  body('category_id').optional({ nullable: true }).isUUID().withMessage('Invalid category ID'),
  body('next_due_date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Next due date must use YYYY-MM-DD').isISO8601({ strict: true, strictSeparator: true }).withMessage('Next due date must be a valid date'),
  body('notes').optional({ nullable: true }).trim().isLength({ max: 500 }).withMessage('Notes must be at most 500 characters'),
];

const updateRecurring = [
  param('id').isUUID().withMessage('Invalid recurring item ID'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 120 }).withMessage('Name must be at most 120 characters'),
  body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be greater than zero').toFloat(),
  body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('frequency').optional().isIn(['monthly', 'yearly']).withMessage('Frequency must be monthly or yearly'),
  body('category_id').optional({ nullable: true }).isUUID().withMessage('Invalid category ID'),
  body('next_due_date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Next due date must use YYYY-MM-DD').isISO8601({ strict: true, strictSeparator: true }).withMessage('Next due date must be a valid date'),
  body('status').optional().isIn(['active', 'paused', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional({ nullable: true }).trim().isLength({ max: 500 }).withMessage('Notes must be at most 500 characters'),
];

const recurringId = [param('id').isUUID().withMessage('Invalid recurring item ID')];

module.exports = { createRecurring, updateRecurring, recurringId };