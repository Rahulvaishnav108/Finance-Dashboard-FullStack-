import { Router } from 'express';
import { validate } from '../../middleware/validate';
import {
  getRestaurantOverviewController,
  getRestaurantSettingsController,
  updateRestaurantSettingsController,
} from '../restaurants/restaurants.controller';

import {
  bulkCreateTablesController,
  createTableController,
  deleteTableController,
  getTableController,
  listTablesController,
  updateTableController,
  regenerateTableQrController,
  getTableQrPngController,
  getTableQrSvgController,
  getTableQrControllerLegacy,
} from '../tables/tables.controller';
import {
  bulkCreateTablesRequestSchema,
  createTableRequestSchema,
  tableIdParamsSchema,
  updateTableRequestSchema,
} from '../tables/tables.schema';
import analyticsRouter from '../analytics/analytics.routes';
import auditLogsRouter from '../auditLogs/auditLogs.routes';
import { updateRestaurantSettingsSchema } from '../restaurants/restaurants.schema';
import inventoryRouter from '../inventory/inventory.routes';
import loyaltyRouter from '../loyalty/loyalty.routes';
import offersRouter from '../offers/offers.routes';
import staffManagementRouter from '../staff/staff.routes';
import supplierRouter from '../suppliers/supplier.routes';

export const adminRouter = Router();

adminRouter.get('/restaurant/overview', getRestaurantOverviewController);
adminRouter.get('/restaurant/settings', getRestaurantSettingsController);
adminRouter.patch('/restaurant/settings', validate({ body: updateRestaurantSettingsSchema }), updateRestaurantSettingsController);


adminRouter.post('/tables', validate(createTableRequestSchema), createTableController);
adminRouter.get('/tables', listTablesController);
adminRouter.get('/tables/:id', validate({ params: tableIdParamsSchema }), getTableController);
adminRouter.patch('/tables/:id', validate(updateTableRequestSchema), updateTableController);
adminRouter.delete('/tables/:id', validate({ params: tableIdParamsSchema }), deleteTableController);
adminRouter.post('/tables/bulk', validate(bulkCreateTablesRequestSchema), bulkCreateTablesController);
adminRouter.post('/tables/:id/qr/regenerate', validate({ params: tableIdParamsSchema }), regenerateTableQrController);
adminRouter.get('/tables/:id/qr/png', validate({ params: tableIdParamsSchema }), getTableQrPngController);
adminRouter.get('/tables/:id/qr/svg', validate({ params: tableIdParamsSchema }), getTableQrSvgController);
adminRouter.post('/tables/:id/qr', validate({ params: tableIdParamsSchema }), regenerateTableQrController);
adminRouter.get('/tables/:id/qr', validate({ params: tableIdParamsSchema }), getTableQrControllerLegacy);
adminRouter.use('/staff', staffManagementRouter);
adminRouter.use('/offers', offersRouter);
adminRouter.use('/loyalty', loyaltyRouter);
adminRouter.use('/inventory', inventoryRouter);
adminRouter.use('/suppliers', supplierRouter);
adminRouter.use('/analytics', analyticsRouter);
adminRouter.use('/audit-logs', auditLogsRouter);
