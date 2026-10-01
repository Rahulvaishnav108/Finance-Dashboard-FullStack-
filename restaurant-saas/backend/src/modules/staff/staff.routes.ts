import { Router } from 'express';
import { validate } from '../../middleware/validate';
import {
  adminStaffQuerySchema,
  assignStaffShiftBodySchema,
  createStaffBodySchema,
  entityIdParamsSchema,
  updateStaffBodySchema,
} from './staff.schema';
import {
  assignStaffShiftController,
  createStaffController,
  deleteStaffController,
  getStaffAttendanceController,
  getStaffByIdController,
  getStaffPerformanceController,
  listStaffController,
  updateStaffController,
} from './staff.controller';

const router = Router();

router.post('/', validate({ body: createStaffBodySchema }), createStaffController);
router.get('/', validate({ query: adminStaffQuerySchema }), listStaffController);
router.post('/shifts', validate({ body: assignStaffShiftBodySchema }), assignStaffShiftController);
router.get('/attendance', validate({ query: adminStaffQuerySchema }), getStaffAttendanceController);
router.get('/performance', validate({ query: adminStaffQuerySchema }), getStaffPerformanceController);
router.get('/:id', validate({ params: entityIdParamsSchema }), getStaffByIdController);
router.patch('/:id', validate({ params: entityIdParamsSchema, body: updateStaffBodySchema }), updateStaffController);
router.delete('/:id', validate({ params: entityIdParamsSchema }), deleteStaffController);

export default router;
