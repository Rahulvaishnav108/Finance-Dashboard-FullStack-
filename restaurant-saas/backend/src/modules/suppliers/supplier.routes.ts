import { Router } from 'express';
import { validate } from '../../middleware/validate';
import {
  createSupplierBodySchema,
  supplierParamsSchema,
  supplierQuerySchema,
  updateSupplierBodySchema,
} from './supplier.schema';
import {
  createSupplierController,
  deleteSupplierController,
  listSuppliersController,
  updateSupplierController,
} from './supplier.controller';

const router = Router();

router.get('/', validate({ query: supplierQuerySchema }), listSuppliersController);
router.post('/', validate({ body: createSupplierBodySchema }), createSupplierController);
router.patch(
  '/:id',
  validate({ params: supplierParamsSchema, body: updateSupplierBodySchema }),
  updateSupplierController,
);
router.delete('/:id', validate({ params: supplierParamsSchema }), deleteSupplierController);

export default router;
