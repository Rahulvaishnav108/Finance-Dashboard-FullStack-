'use strict';

const RecordService = require('../services/record.service');
const ApiResponse   = require('../utils/ApiResponse');
const { toCSV }     = require('../utils/csv');

const EXPORT_COLUMNS = ['id','date','type','amount','category','description','notes','reference_no','tags','created_by','created_at'];

const RecordController = {

  list(req, res, next) {
    try {
      const { type, category_id, date_from, date_to, amount_min, amount_max, search } = req.query;
      const { page, limit, sort_by, sort_dir } = req.query;
      const result = RecordService.list(
        { type, category_id, date_from, date_to, amount_min, amount_max, search },
        { page, limit, sort_by, sort_dir },
      );
      return ApiResponse.paginated(res, result.data, result.pagination);
    } catch (err) { next(err); }
  },

  getById(req, res, next) {
    try {
      const record = RecordService.getById(req.params.id);
      return ApiResponse.success(res, record);
    } catch (err) { next(err); }
  },

  create(req, res, next) {
    try {
      const record = RecordService.create(req.body, req.user.id, req);
      return ApiResponse.created(res, record, 'Financial record created successfully');
    } catch (err) { next(err); }
  },

  update(req, res, next) {
    try {
      const updated = RecordService.update(req.params.id, req.body, req.user.id, req);
      return ApiResponse.success(res, updated, 'Financial record updated successfully');
    } catch (err) { next(err); }
  },

  delete(req, res, next) {
    try {
      RecordService.delete(req.params.id, req.user.id, req);
      return ApiResponse.success(res, null, 'Financial record deleted successfully');
    } catch (err) { next(err); }
  },

  exportCSV(req, res, next) {
    try {
      const { type, category_id, date_from, date_to } = req.query;
      const rows = RecordService.exportFlat({ type, category_id, date_from, date_to });
      const csv  = toCSV(rows, EXPORT_COLUMNS);
      const filename = `records-${new Date().toISOString().slice(0,10)}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    } catch (err) { next(err); }
  },
};

module.exports = RecordController;
