import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { requireSession } from '../../middleware/requireSession';
import { roleGuard } from '../../middleware/roleGuard';
import { validate } from '../../middleware/validate';
import { UserRole } from '../../constants/roles';
import { MenuController } from './menu.controller';
import {
  createCategorySchema,
  updateCategorySchema,
  reorderCategoriesSchema,
  createItemSchema,
  updateItemSchema,
  toggleItemAvailabilitySchema,
  toggleItemVisibilitySchema,
  updateItemImageSchema,
  reorderItemsSchema,
  menuItemQuerySchema,
  idParamSchema,
  restaurantIdParamSchema,
  restaurantIdQuerySchema,
  toggleCategorySchema,
  publicItemParamsSchema,
} from './menu.schema';

const router = Router();

/*
|--------------------------------------------------------------------------
| CUSTOMER APIS (Requires Table Session)
|--------------------------------------------------------------------------
*/
// Note: Customer routes hit `/customer/menu` where the restaurantId is extracted from `req.tableSession`
router.get(
  '/customer/menu/categories',
  requireSession,
  MenuController.getCustomerCategories
);

router.get(
  '/customer/menu/items',
  requireSession,
  validate({ query: menuItemQuerySchema }),
  MenuController.getCustomerItems
);

router.get(
  '/customer/menu/items/:id',
  requireSession,
  validate({ params: idParamSchema }),
  MenuController.getCustomerItemById
);

/*
|--------------------------------------------------------------------------
| PUBLIC APIS (No Auth)
|--------------------------------------------------------------------------
*/
// Public APIs need the restaurantId in the URL path
router.get(
  '/public/menu/:restaurantId',
  validate({ params: restaurantIdParamSchema, query: menuItemQuerySchema }),
  MenuController.getCustomerItems
);

router.get(
  '/public/menu/:restaurantId/categories',
  validate({ params: restaurantIdParamSchema }),
  MenuController.getCustomerCategories
);

router.get(
  '/public/menu/:restaurantId/items',
  validate({ params: restaurantIdParamSchema, query: menuItemQuerySchema }),
  MenuController.getCustomerItems
);

router.get(
  '/public/menu/:restaurantId/items/:id',
  validate({ params: publicItemParamsSchema }),
  MenuController.getPublicItemById
);

router.get(
  '/public/menu/items/:id',
  validate({ params: idParamSchema, query: restaurantIdQuerySchema }),
  MenuController.getPublicItemById
);

/*
|--------------------------------------------------------------------------
| ADMIN APIS (Requires JWT + Admin Role)
|--------------------------------------------------------------------------
*/
const adminRoles = [UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN];

// CATEGORIES
router.post(
  '/admin/menu/categories',
  requireAuth,
  roleGuard(...adminRoles),
  validate({ body: createCategorySchema }),
  MenuController.createCategory
);

router.get(
  '/admin/menu/categories',
  requireAuth,
  roleGuard(...adminRoles),
  MenuController.getAdminCategories
);

router.patch(
  '/admin/menu/categories/reorder',
  requireAuth,
  roleGuard(...adminRoles),
  validate({ body: reorderCategoriesSchema }),
  MenuController.reorderCategories
);

router.get(
  '/admin/menu/categories/:id',
  requireAuth,
  roleGuard(...adminRoles),
  validate({ params: idParamSchema }),
  MenuController.getAdminCategoryById
);

router.patch(
  '/admin/menu/categories/:id',
  requireAuth,
  roleGuard(...adminRoles),
  validate({ params: idParamSchema, body: updateCategorySchema }),
  MenuController.updateCategory
);

router.delete(
  '/admin/menu/categories/:id',
  requireAuth,
  roleGuard(...adminRoles),
  validate({ params: idParamSchema }),
  MenuController.deleteCategory
);

router.patch(
  '/admin/menu/categories/:id/toggle',
  requireAuth,
  roleGuard(...adminRoles),
  validate({ params: idParamSchema, body: toggleCategorySchema }),
  MenuController.toggleCategory
);


// ITEMS
router.post(
  '/admin/menu/items',
  requireAuth,
  roleGuard(...adminRoles),
  validate({ body: createItemSchema }),
  MenuController.createItem
);

router.get(
  '/admin/menu/items',
  requireAuth,
  roleGuard(...adminRoles),
  MenuController.getAdminItems
);

router.patch(
  '/admin/menu/items/reorder',
  requireAuth,
  roleGuard(...adminRoles),
  validate({ body: reorderItemsSchema }),
  MenuController.reorderItems
);

router.get(
  '/admin/menu/items/:id',
  requireAuth,
  roleGuard(...adminRoles),
  validate({ params: idParamSchema }),
  MenuController.getAdminItemById
);

router.patch(
  '/admin/menu/items/:id',
  requireAuth,
  roleGuard(...adminRoles),
  validate({ params: idParamSchema, body: updateItemSchema }),
  MenuController.updateItem
);

router.delete(
  '/admin/menu/items/:id',
  requireAuth,
  roleGuard(...adminRoles),
  validate({ params: idParamSchema }),
  MenuController.deleteItem
);

router.patch(
  '/admin/menu/items/:id/availability',
  requireAuth,
  roleGuard(...adminRoles),
  validate({ params: idParamSchema, body: toggleItemAvailabilitySchema }),
  MenuController.toggleItemAvailability
);

router.patch(
  '/admin/menu/items/:id/visibility',
  requireAuth,
  roleGuard(...adminRoles),
  validate({ params: idParamSchema, body: toggleItemVisibilitySchema }),
  MenuController.toggleItemVisibility
);

router.post(
  '/admin/menu/items/:id/image',
  requireAuth,
  roleGuard(...adminRoles),
  validate({ params: idParamSchema, body: updateItemImageSchema }),
  MenuController.updateItemImage
);

export default router;
