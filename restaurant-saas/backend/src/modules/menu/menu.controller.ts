import { Request, Response } from 'express';
import { MenuService } from './menu.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { parsePagination } from '../../utils/pagination';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';
import { logAudit } from '../auditLogs/auditLogs.helper';
import { AuditAction, AuditEntity } from '../auditLogs/auditLogs.types';

export class MenuController {
  /*
  |--------------------------------------------------------------------------
  | CATEGORIES (ADMIN)
  |--------------------------------------------------------------------------
  */

  static createCategory = asyncHandler(async (req: Request, res: Response) => {
    // Note: requires roleGuard and requireAuth middleware before reaching here
    const category = await MenuService.createCategory(req.user!.restaurantId!, req.body, req.user!._id);
    res.status(201).json({ success: true, data: category });
    void logAudit(req, {
      entityType: AuditEntity.MENU_ITEM,
      entityId:   category._id.toString(),
      action:     AuditAction.ADMIN_MENU_ITEM_CREATED,
      metadata: {
        name: category.name,
        type: 'CATEGORY',
      },
    });
  });

  static getAdminCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await MenuService.getCategories(req.user!.restaurantId!, {
      excludeHidden: false,
      activeOnly: false,
    });
    res.status(200).json({ success: true, data: categories });
  });

  static getAdminCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const category = await MenuService.getCategoryById(req.user!.restaurantId!, req.params.id);
    res.status(200).json({ success: true, data: category });
  });

  static updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await MenuService.updateCategory(req.user!.restaurantId!, req.params.id, req.body, req.user!._id);
    res.status(200).json({ success: true, data: category });
    void logAudit(req, {
      entityType: AuditEntity.MENU_ITEM,
      entityId:   req.params.id,
      action:     AuditAction.ADMIN_MENU_ITEM_UPDATED,
      metadata: {
        type:          'CATEGORY',
        updatedFields: Object.keys(req.body),
      },
    });
  });

  static deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    await MenuService.deleteCategory(req.user!.restaurantId!, req.params.id);
    res.status(200).json({ success: true, data: {} });
    void logAudit(req, {
      entityType: AuditEntity.MENU_ITEM,
      entityId:   req.params.id,
      action:     AuditAction.ADMIN_MENU_ITEM_DELETED,
      metadata: {
        type: 'CATEGORY',
      },
    });
  });

  static toggleCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await MenuService.updateCategory(
      req.user!.restaurantId!,
      req.params.id,
      { isActive: req.body.isActive },
      req.user!._id
    );
    res.status(200).json({ success: true, data: category });
    void logAudit(req, {
      entityType: AuditEntity.MENU_ITEM,
      entityId:   req.params.id,
      action:     AuditAction.ADMIN_MENU_ITEM_UPDATED,
      metadata: {
        type:     'CATEGORY',
        isActive: req.body.isActive,
        change:   'toggle_active',
      },
    });
  });

  static reorderCategories = asyncHandler(async (req: Request, res: Response) => {
    await MenuService.reorderCategories(req.user!.restaurantId!, req.body.categories, req.user!._id);
    res.status(200).json({ success: true, data: {} });
  });

  /*
  |--------------------------------------------------------------------------
  | MENU ITEMS (ADMIN)
  |--------------------------------------------------------------------------
  */

  static createItem = asyncHandler(async (req: Request, res: Response) => {
    const item = await MenuService.createItem(req.user!.restaurantId!, req.body, req.user!._id);
    res.status(201).json({ success: true, data: item });
    void logAudit(req, {
      entityType: AuditEntity.MENU_ITEM,
      entityId:   item._id.toString(),
      action:     AuditAction.ADMIN_MENU_ITEM_CREATED,
      metadata: {
        name:       item.name,
        type:       'ITEM',
        categoryId: req.body.categoryId,
        price:      req.body.price,
      },
    });
  });

  static getAdminItems = asyncHandler(async (req: Request, res: Response) => {
    const pagination = parsePagination(req.query as any);
    const data = await MenuService.getAdminItems(req.user!.restaurantId!, {
      ...pagination,
      categoryId: req.query.categoryId as string,
    });
    res.status(200).json({ success: true, data });
  });

  static getAdminItemById = asyncHandler(async (req: Request, res: Response) => {
    const item = await MenuService.getItemById(req.user!.restaurantId!, req.params.id);
    res.status(200).json({ success: true, data: item });
  });

  static updateItem = asyncHandler(async (req: Request, res: Response) => {
    console.log('[DEBUG] MenuController.updateItem req.body:', JSON.stringify(req.body, null, 2));
    const item = await MenuService.updateItem(req.user!.restaurantId!, req.params.id, req.body, req.user!._id);
    console.log('[DEBUG] MenuController.updateItem returned item:', JSON.stringify(item, null, 2));
    res.status(200).json({ success: true, data: item });
    void logAudit(req, {
      entityType: AuditEntity.MENU_ITEM,
      entityId:   req.params.id,
      action:     AuditAction.ADMIN_MENU_ITEM_UPDATED,
      metadata: {
        type:          'ITEM',
        updatedFields: Object.keys(req.body),
      },
    });
  });

  static deleteItem = asyncHandler(async (req: Request, res: Response) => {
    await MenuService.deleteItem(req.user!.restaurantId!, req.params.id);
    res.status(200).json({ success: true, data: {} });
    void logAudit(req, {
      entityType: AuditEntity.MENU_ITEM,
      entityId:   req.params.id,
      action:     AuditAction.ADMIN_MENU_ITEM_DELETED,
      metadata: {
        type: 'ITEM',
      },
    });
  });

  static toggleItemAvailability = asyncHandler(async (req: Request, res: Response) => {
    const item = await MenuService.toggleItemAvailability(
      req.user!.restaurantId!,
      req.params.id,
      req.body.isAvailable,
      req.user!._id
    );
    res.status(200).json({ success: true, data: item });
    void logAudit(req, {
      entityType: AuditEntity.MENU_ITEM,
      entityId:   req.params.id,
      action:     AuditAction.ADMIN_MENU_ITEM_UPDATED,
      metadata: {
        type:        'ITEM',
        isAvailable: req.body.isAvailable,
        change:      'toggle_availability',
      },
    });
  });

  static toggleItemVisibility = asyncHandler(async (req: Request, res: Response) => {
    const item = await MenuService.toggleItemVisibility(
      req.user!.restaurantId!,
      req.params.id,
      req.body.isHidden,
      req.user!._id
    );
    res.status(200).json({ success: true, data: item });
    void logAudit(req, {
      entityType: AuditEntity.MENU_ITEM,
      entityId:   req.params.id,
      action:     AuditAction.ADMIN_MENU_ITEM_UPDATED,
      metadata: {
        type:     'ITEM',
        isHidden: req.body.isHidden,
        change:   'toggle_visibility',
      },
    });
  });

  static updateItemImage = asyncHandler(async (req: Request, res: Response) => {
    const item = await MenuService.updateItemImage(
      req.user!.restaurantId!,
      req.params.id,
      req.body.image ?? req.body.imageUrl,
      req.user!._id,
      { addToGallery: req.body.addToGallery },
    );
    res.status(200).json({ success: true, data: item });
    void logAudit(req, {
      entityType: AuditEntity.MENU_ITEM,
      entityId:   req.params.id,
      action:     AuditAction.ADMIN_MENU_ITEM_UPDATED,
      metadata: {
        type:         'ITEM',
        change:       'image_update',
        addToGallery: req.body.addToGallery,
      },
    });
  });

  static reorderItems = asyncHandler(async (req: Request, res: Response) => {
    await MenuService.reorderItems(req.user!.restaurantId!, req.body.items, req.user!._id);
    res.status(200).json({ success: true, data: {} });
  });

  /*
  |--------------------------------------------------------------------------
  | PUBLIC / CUSTOMER (READ-ONLY)
  |--------------------------------------------------------------------------
  */

  // Gets restaurantId from JWT session (Customer) or param (Public)
  private static getRestaurantIdFromReq(req: Request): string {
    if (req.tableSession) return req.tableSession.restaurantId.toString();
    if (req.params.restaurantId) return req.params.restaurantId;
    if (typeof req.query.restaurantId === 'string') return req.query.restaurantId;
    throw new AppError('Restaurant ID is required', 400, ErrorCode.INVALID_REQUEST);
  }

  static getCustomerCategories = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = MenuController.getRestaurantIdFromReq(req);
    const categories = await MenuService.getCategories(restaurantId, {
      excludeHidden: true,
      activeOnly: true,
    });
    res.status(200).json({ success: true, data: categories });
  });

  static getCustomerItems = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = MenuController.getRestaurantIdFromReq(req);
    const pagination = parsePagination(req.query as any);

    const data = await MenuService.getItems(restaurantId, {
      ...pagination,
      category: req.query.category as string,
      vegOnly: String(req.query.vegOnly ?? req.query.veg) === 'true',
      spicy: req.query.spicy === undefined ? undefined : String(req.query.spicy) === 'true',
      availableOnly: String(req.query.available) === 'true',
      popularOnly: String(req.query.popular) === 'true',
      recommendedOnly: String(req.query.recommended) === 'true',
      priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
      priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
      search: req.query.search as string,
      sortBy: req.query.sortBy as string,
    });
    res.status(200).json({ success: true, data });
  });

  static getCustomerItemById = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = MenuController.getRestaurantIdFromReq(req);
    const item = await MenuService.getItemById(restaurantId, req.params.id, { excludeHidden: true });
    res.status(200).json({ success: true, data: item });
  });

  static getPublicItemById = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = MenuController.getRestaurantIdFromReq(req);
    const item = await MenuService.getItemById(restaurantId, req.params.id, { excludeHidden: true });
    res.status(200).json({ success: true, data: item });
  });
}
