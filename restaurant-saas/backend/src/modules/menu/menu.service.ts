import { Types } from 'mongoose';
import { Category, MenuItem, ICategory, IMenuItem } from './menu.model';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';
import { buildPaginationMeta } from '../../utils/pagination';

export class MenuService {
  /*
  |--------------------------------------------------------------------------
  | CATEGORY METHODS
  |--------------------------------------------------------------------------
  */

  static async createCategory(
    restaurantId: string | Types.ObjectId,
    data: Partial<ICategory>,
    userId: string | Types.ObjectId
  ): Promise<ICategory> {
    const lastCategory = await Category.findOne({ restaurantId })
      .sort({ displayOrder: -1 })
      .select('displayOrder')
      .lean();

    const displayOrder = data.displayOrder ?? ((lastCategory?.displayOrder || 0) + 1);

    const category = new Category({
      ...data,
      restaurantId,
      displayOrder,
      createdBy: userId,
      updatedBy: userId,
    });

    await category.save();
    return category;
  }

  static async getCategories(
    restaurantId: string | Types.ObjectId,
    options: { excludeHidden?: boolean; activeOnly?: boolean } = {}
  ): Promise<ICategory[]> {
    const query: any = { restaurantId };
    if (options.activeOnly) query.isActive = true;
    if (options.excludeHidden) query.isHidden = false;

    return Category.find(query).sort({ displayOrder: 1 });
  }

  static async getCategoryById(
    restaurantId: string | Types.ObjectId,
    categoryId: string | Types.ObjectId
  ): Promise<ICategory> {
    const category = await Category.findOne({ _id: categoryId, restaurantId });
    if (!category) {
      throw new AppError('Category not found', 404, ErrorCode.NOT_FOUND);
    }
    return category;
  }

  static async updateCategory(
    restaurantId: string | Types.ObjectId,
    categoryId: string | Types.ObjectId,
    data: Partial<ICategory>,
    userId: string | Types.ObjectId
  ): Promise<ICategory> {
    const category = await Category.findOneAndUpdate(
      { _id: categoryId, restaurantId },
      { $set: { ...data, updatedBy: userId } },
      { new: true, runValidators: true }
    );

    if (!category) {
      throw new AppError('Category not found', 404, ErrorCode.NOT_FOUND);
    }
    return category;
  }

  static async deleteCategory(
    restaurantId: string | Types.ObjectId,
    categoryId: string | Types.ObjectId
  ): Promise<void> {
    const session = await Category.startSession();
    session.startTransaction();
    try {
      const category = await Category.findOneAndDelete({ _id: categoryId, restaurantId }).session(session);
      if (!category) {
        throw new AppError('Category not found', 404, ErrorCode.NOT_FOUND);
      }

      // Delete associated items
      await MenuItem.deleteMany({ categoryId, restaurantId }).session(session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async reorderCategories(
    restaurantId: string | Types.ObjectId,
    updates: { id: string | Types.ObjectId; displayOrder: number }[],
    userId: string | Types.ObjectId
  ): Promise<void> {
    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.id, restaurantId },
        update: { $set: { displayOrder: update.displayOrder, updatedBy: userId as Types.ObjectId } },
      },
    }));

    await Category.bulkWrite(bulkOps);
  }

  /*
  |--------------------------------------------------------------------------
  | MENU ITEM METHODS
  |--------------------------------------------------------------------------
  */

  static async createItem(
    restaurantId: string | Types.ObjectId,
    data: Partial<IMenuItem>,
    userId: string | Types.ObjectId
  ): Promise<IMenuItem> {
    // Validate category exists
    await this.getCategoryById(restaurantId, data.categoryId as Types.ObjectId);

    const lastItem = await MenuItem.findOne({ restaurantId, categoryId: data.categoryId })
      .sort({ displayOrder: -1 })
      .select('displayOrder')
      .lean();

    const displayOrder = data.displayOrder ?? ((lastItem?.displayOrder || 0) + 1);

    const item = new MenuItem({
      ...data,
      restaurantId,
      displayOrder,
      createdBy: userId,
      updatedBy: userId,
    });

    await item.save();
    return item;
  }

  static async getItems(
    restaurantId: string | Types.ObjectId,
    query: {
      page: number;
      limit: number;
      skip: number;
      category?: string;
      vegOnly?: boolean;
      spicy?: boolean;
      availableOnly?: boolean;
      popularOnly?: boolean;
      recommendedOnly?: boolean;
      priceMin?: number;
      priceMax?: number;
      search?: string;
      sortBy?: string;
    }
  ) {
    const dbQuery: any = { restaurantId, isHidden: false };

    if (query.category) {
      const categoryLookup = query.category.trim().toLowerCase();
      const categoryFilters: Array<Record<string, unknown>> = [{ name: categoryLookup }];
      if (Types.ObjectId.isValid(query.category)) {
        categoryFilters.push({ _id: query.category });
      }

      const category = await Category.findOne({
        restaurantId,
        $or: categoryFilters,
      }).select('_id');

      if (category) {
        dbQuery.categoryId = category._id;
      } else {
        dbQuery.categoryId = null;
      }
    }
    if (query.vegOnly) dbQuery.isVeg = true;
    if (query.spicy === true) dbQuery.spiceLevel = { $gt: 0 };
    if (query.spicy === false) dbQuery.spiceLevel = { $in: [0, null] };
    if (query.availableOnly) dbQuery.isAvailable = true;
    if (query.popularOnly) dbQuery.tags = { $in: ['popular'] };
    if (query.recommendedOnly) dbQuery.tags = { $in: ['recommended'] };
    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      dbQuery.price = {};
      if (query.priceMin !== undefined) dbQuery.price.$gte = query.priceMin;
      if (query.priceMax !== undefined) dbQuery.price.$lte = query.priceMax;
    }

    if (query.search) {
      dbQuery.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { tags: { $regex: query.search, $options: 'i' } },
      ];
    }

    let sort: any = { displayOrder: 1 };
    if (query.sortBy === 'price' || query.sortBy === 'price_asc') sort = { price: 1 };
    if (query.sortBy === 'price_desc') sort = { price: -1 };
    if (query.sortBy === 'name_asc') sort = { name: 1 };

    const [items, total] = await Promise.all([
      MenuItem.find(dbQuery).sort(sort).skip(query.skip).limit(query.limit).lean(),
      MenuItem.countDocuments(dbQuery),
    ]);

    return {
      items,
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  static async getAdminItems(
    restaurantId: string | Types.ObjectId,
    query: {
      page: number;
      limit: number;
      skip: number;
      categoryId?: string | Types.ObjectId;
    }
  ) {
    const dbQuery: any = { restaurantId };
    if (query.categoryId) dbQuery.categoryId = query.categoryId;

    const [items, total] = await Promise.all([
      MenuItem.find(dbQuery).sort({ categoryId: 1, displayOrder: 1 }).skip(query.skip).limit(query.limit).lean(),
      MenuItem.countDocuments(dbQuery),
    ]);

    return {
      items,
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  static async getItemById(
    restaurantId: string | Types.ObjectId,
    itemId: string | Types.ObjectId,
    options: { excludeHidden?: boolean } = {}
  ): Promise<IMenuItem> {
    const query: Record<string, unknown> = { _id: itemId, restaurantId };
    if (options.excludeHidden) {
      query.isHidden = false;
    }

    const item = await MenuItem.findOne(query);
    if (!item) {
      throw new AppError('Menu item not found', 404, ErrorCode.NOT_FOUND);
    }
    return item;
  }

  static async updateItem(
    restaurantId: string | Types.ObjectId,
    itemId: string | Types.ObjectId,
    data: Partial<IMenuItem>,
    userId: string | Types.ObjectId
  ): Promise<IMenuItem> {
    console.log('[DEBUG] MenuService.updateItem received data:', JSON.stringify(data, null, 2));
    if (data.categoryId) {
      // Validate category exists if it's being updated
      await this.getCategoryById(restaurantId, data.categoryId as Types.ObjectId);
    }

    const updatePayload = { $set: { ...data, updatedBy: userId } };
    console.log('[DEBUG] MenuService.updateItem MongoDB updatePayload:', JSON.stringify(updatePayload, null, 2));

    const item = await MenuItem.findOneAndUpdate(
      { _id: itemId, restaurantId },
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!item) {
      throw new AppError('Menu item not found', 404, ErrorCode.NOT_FOUND);
    }
    return item;
  }

  static async deleteItem(
    restaurantId: string | Types.ObjectId,
    itemId: string | Types.ObjectId
  ): Promise<void> {
    const item = await MenuItem.findOneAndDelete({ _id: itemId, restaurantId });
    if (!item) {
      throw new AppError('Menu item not found', 404, ErrorCode.NOT_FOUND);
    }
  }

  static async toggleItemAvailability(
    restaurantId: string | Types.ObjectId,
    itemId: string | Types.ObjectId,
    isAvailable: boolean,
    userId: string | Types.ObjectId
  ): Promise<IMenuItem> {
    const item = await MenuItem.findOneAndUpdate(
      { _id: itemId, restaurantId },
      { $set: { isAvailable, updatedBy: userId } },
      { new: true }
    );

    if (!item) {
      throw new AppError('Menu item not found', 404, ErrorCode.NOT_FOUND);
    }
    return item;
  }

  static async toggleItemVisibility(
    restaurantId: string | Types.ObjectId,
    itemId: string | Types.ObjectId,
    isHidden: boolean,
    userId: string | Types.ObjectId
  ): Promise<IMenuItem> {
    const item = await MenuItem.findOneAndUpdate(
      { _id: itemId, restaurantId },
      { $set: { isHidden, updatedBy: userId } },
      { new: true }
    );

    if (!item) {
      throw new AppError('Menu item not found', 404, ErrorCode.NOT_FOUND);
    }
    return item;
  }

  static async updateItemImage(
    restaurantId: string | Types.ObjectId,
    itemId: string | Types.ObjectId,
    image: string,
    userId: string | Types.ObjectId,
    options: { addToGallery?: boolean } = {}
  ): Promise<IMenuItem> {
    const item = await this.getItemById(restaurantId, itemId);
    const shouldAddToGallery = options.addToGallery !== false;

    item.image = image;
    if (shouldAddToGallery) {
      item.images = Array.from(new Set([...(item.images ?? []), image]));
    }
    item.updatedBy = userId as Types.ObjectId;

    await item.save();
    return item;
  }

  static async reorderItems(
    restaurantId: string | Types.ObjectId,
    updates: { id: string | Types.ObjectId; displayOrder: number }[],
    userId: string | Types.ObjectId
  ): Promise<void> {
    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.id, restaurantId },
        update: { $set: { displayOrder: update.displayOrder, updatedBy: userId as Types.ObjectId } },
      },
    }));

    await MenuItem.bulkWrite(bulkOps);
  }
}
