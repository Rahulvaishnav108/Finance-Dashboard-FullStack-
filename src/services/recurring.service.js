'use strict';

const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/database');
const { audit } = require('../utils/audit');
const RecordService = require('./record.service');

function serviceError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.isOperational = true;
  return err;
}

function advanceDueDate(date, frequency) {
  const [year, month, day] = date.split('-').map(Number);
  const targetYear = frequency === 'yearly' ? year + 1 : year + Math.floor(month / 12);
  const targetMonth = frequency === 'yearly' ? month - 1 : month % 12;
  const maxDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(Math.min(day, maxDay)).padStart(2, '0')}`;
}

function validateCategory(db, categoryId, type) {
  if (!categoryId) return;
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);
  if (!category) throw serviceError('Category not found', 422);
  if (category.type !== 'both' && category.type !== type) {
    throw serviceError(`Category '${category.name}' is for ${category.type} records only`, 422);
  }
}

const RecurringService = {
  list() {
    return getDb().prepare(`
      SELECT r.*, c.name AS category_name, c.color AS category_color,
        u.full_name AS created_by_name
      FROM recurring_transactions r
      LEFT JOIN categories c ON c.id = r.category_id
      LEFT JOIN users u ON u.id = r.created_by
      ORDER BY CASE r.status WHEN 'active' THEN 0 WHEN 'paused' THEN 1 ELSE 2 END,
        r.next_due_date ASC, r.name COLLATE NOCASE ASC
    `).all();
  },

  getById(id) {
    const item = getDb().prepare(`
      SELECT r.*, c.name AS category_name, c.color AS category_color,
        u.full_name AS created_by_name
      FROM recurring_transactions r
      LEFT JOIN categories c ON c.id = r.category_id
      LEFT JOIN users u ON u.id = r.created_by
      WHERE r.id = ?
    `).get(id);
    if (!item) throw serviceError('Recurring item not found', 404);
    return item;
  },

  create(data, userId, req) {
    const db = getDb();
    validateCategory(db, data.category_id, data.type);
    const id = uuidv4();
    db.prepare(`
      INSERT INTO recurring_transactions
        (id, name, amount, type, frequency, category_id, next_due_date, notes, created_by)
      VALUES (@id, @name, @amount, @type, @frequency, @category_id, @next_due_date, @notes, @created_by)
    `).run({
      id,
      name: data.name,
      amount: data.amount,
      type: data.type,
      frequency: data.frequency,
      category_id: data.category_id || null,
      next_due_date: data.next_due_date,
      notes: data.notes || null,
      created_by: userId,
    });
    const item = this.getById(id);
    audit({ userId, action: 'recurring.create', resource: 'recurring_transactions', resourceId: id, newData: item, req });
    return item;
  },

  update(id, data, userId, req) {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM recurring_transactions WHERE id = ?').get(id);
    if (!existing) throw serviceError('Recurring item not found', 404);

    const categoryId = data.category_id !== undefined ? data.category_id : existing.category_id;
    const type = data.type || existing.type;
    validateCategory(db, categoryId, type);

    const fields = ['name', 'amount', 'type', 'frequency', 'category_id', 'next_due_date', 'status', 'notes'];
    const updates = fields.filter(field => data[field] !== undefined);
    if (!updates.length) throw serviceError('No updatable fields provided', 400);

    const setClause = updates.map(field => `${field} = @${field}`);
    setClause.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')");
    const params = { id };
    updates.forEach(field => { params[field] = data[field] ?? null; });
    db.prepare(`UPDATE recurring_transactions SET ${setClause.join(', ')} WHERE id = @id`).run(params);

    const item = this.getById(id);
    audit({ userId, action: 'recurring.update', resource: 'recurring_transactions', resourceId: id, oldData: existing, newData: item, req });
    return item;
  },

  delete(id, userId, req) {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM recurring_transactions WHERE id = ?').get(id);
    if (!existing) throw serviceError('Recurring item not found', 404);
    db.prepare('DELETE FROM recurring_transactions WHERE id = ?').run(id);
    audit({ userId, action: 'recurring.delete', resource: 'recurring_transactions', resourceId: id, oldData: existing, req });
  },

  recordPayment(id, userId, req) {
    const db = getDb();
    let createdRecord;
    const action = db.transaction(() => {
      const item = db.prepare('SELECT * FROM recurring_transactions WHERE id = ?').get(id);
      if (!item) throw serviceError('Recurring item not found', 404);
      if (item.status !== 'active') throw serviceError('Only active recurring items can be recorded', 409);
      const today = new Date().toISOString().slice(0, 10);
      if (item.next_due_date > today) throw serviceError(`This item is not due until ${item.next_due_date}`, 409);

      createdRecord = RecordService.create({
        amount: item.amount,
        type: item.type,
        category_id: item.category_id,
        date: item.next_due_date,
        description: `Recurring: ${item.name}`,
        notes: item.notes,
        reference_no: `RECURRING-${item.id}-${item.next_due_date}`,
        tags: ['recurring', item.frequency],
      }, userId, req);

      const nextDueDate = advanceDueDate(item.next_due_date, item.frequency);
      db.prepare(`
        UPDATE recurring_transactions
        SET next_due_date = ?, last_recorded_date = ?, last_record_id = ?,
          updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
        WHERE id = ?
      `).run(nextDueDate, item.next_due_date, createdRecord.id, id);
      audit({
        userId,
        action: 'recurring.record_payment',
        resource: 'recurring_transactions',
        resourceId: id,
        oldData: { next_due_date: item.next_due_date },
        newData: { next_due_date: nextDueDate, financial_record_id: createdRecord.id },
        req,
      });
    });
    action();
    return { record: createdRecord, item: this.getById(id) };
  },
};

module.exports = RecurringService;