// src/modules/tables/tables.routes.ts
// Table route definitions — staff/admin protected + public QR lookup

import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { roleGuard } from '../../middleware/roleGuard';
import { validate } from '../../middleware/validate';
import { UserRole } from '../../constants/roles';
import {
  createTableSchema,
  restaurantTablesParamsSchema,
  tableIdParamsSchema,
  updateTableSchema,
  updateTableStatusSchema,
} from './tables.schema';
import * as tablesController from './tables.controller';

const router = Router();

// ── Public — QR code lookup (used by customer QR scan flow) ──────────
router.get('/qr/:qrCode', tablesController.findByQrCodeController);

// ── Protected — Staff/Admin CRUD ─────────────────────────────────────
router.use(requireAuth);

// Get all tables for a restaurant
router.get(
  '/restaurant/:restaurantId',
  validate({ params: restaurantTablesParamsSchema }),
  roleGuard(UserRole.SERVICE_STAFF, UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN),
  tablesController.listTablesController
);

// Get single table
router.get(
  '/:id',
  validate({ params: tableIdParamsSchema }),
  roleGuard(UserRole.SERVICE_STAFF, UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN),
  tablesController.getTableController
);

// Create table
router.post(
  '/',
  roleGuard(UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN),
  validate({ body: createTableSchema }),
  tablesController.createTableController
);

// Update table properties
router.patch(
  '/:id',
  roleGuard(UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN),
  validate({ params: tableIdParamsSchema, body: updateTableSchema }),
  tablesController.updateTableController
);

// Update table status (lifecycle transition)
router.patch(
  '/:id/status',
  roleGuard(UserRole.SERVICE_STAFF, UserRole.CLEANING_STAFF, UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN),
  validate({ params: tableIdParamsSchema, body: updateTableStatusSchema }),
  tablesController.updateTableStatusController
);

// Regenerate QR Token
router.post(
  '/:id/qr/regenerate',
  roleGuard(UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN),
  validate({ params: tableIdParamsSchema }),
  tablesController.regenerateTableQrController
);

// Stream QR as PNG
router.get(
  '/:id/qr/png',
  roleGuard(UserRole.SERVICE_STAFF, UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN),
  validate({ params: tableIdParamsSchema }),
  tablesController.getTableQrPngController
);

// Stream QR as SVG
router.get(
  '/:id/qr/svg',
  roleGuard(UserRole.SERVICE_STAFF, UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN),
  validate({ params: tableIdParamsSchema }),
  tablesController.getTableQrSvgController
);

// Stream bulk PDF for a restaurant
router.get(
  '/restaurant/:restaurantId/qrs/pdf',
  roleGuard(UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN),
  tablesController.getRestaurantTablesPdfController
);

export default router;
