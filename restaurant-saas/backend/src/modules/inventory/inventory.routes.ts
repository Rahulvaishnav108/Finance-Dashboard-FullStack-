import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { getInventoryAnalytics } from '../analytics/analytics.controller';
import {
  createInventoryItemBodySchema,
  inventoryItemParamsSchema,
  inventoryQuerySchema,
  updateInventoryItemBodySchema,
  bulkImportInventoryBodySchema,
} from './inventory.schema';
import {
  createInventoryItemController,
  getInventoryAlertsController,
  listInventoryController,
  updateInventoryItemController,
  deleteInventoryItemController,
  getInventoryStatsController,
  bulkImportController,
  getInventoryItemByIdController,
  getItemTransactionsController,
} from './inventory.controller';

const router = Router();

router.get('/', validate({ query: inventoryQuerySchema }), listInventoryController);
router.post('/', validate({ body: createInventoryItemBodySchema }), createInventoryItemController);
router.post('/bulk-import', validate({ body: bulkImportInventoryBodySchema }), bulkImportController);
router.get('/alerts', validate({ query: inventoryQuerySchema }), getInventoryAlertsController);
router.get('/stats', validate({ query: inventoryQuerySchema }), getInventoryStatsController);
router.get('/analytics', validate({ query: inventoryQuerySchema }), getInventoryAnalytics);
router.get('/:id', validate({ params: inventoryItemParamsSchema }), getInventoryItemByIdController);
router.get('/:id/transactions', validate({ params: inventoryItemParamsSchema }), getItemTransactionsController);
router.patch(
  '/:id',
  validate({ params: inventoryItemParamsSchema, body: updateInventoryItemBodySchema }),
  updateInventoryItemController,
);
router.delete('/:id', validate({ params: inventoryItemParamsSchema }), deleteInventoryItemController);

export default router;
