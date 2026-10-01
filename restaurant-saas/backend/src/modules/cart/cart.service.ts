import { Types } from 'mongoose';
import { Cart, ICart } from './cart.model';
import { BillingModel } from '../billing/billing.model';
import { BillStatus } from '../billing/billing.schema';
import { MenuItem } from '../menu/menu.model';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';
import { AddItemInput, UpdateItemInput } from './cart.schema';

export class CartService {
  /**
   * Helper to fetch a cart or create an empty one if it doesn't exist
   */
  private static async getOrCreateCart(
    restaurantId: string | Types.ObjectId,
    sessionId: string | Types.ObjectId
  ): Promise<ICart> {
    let cart = await Cart.findOne({ restaurantId, sessionId }).populate({
      path: 'items.menuItem',
      select: 'name price discountPrice image isVeg isAvailable',
    });

    if (!cart) {
      cart = await Cart.create({
        restaurantId,
        sessionId,
        items: [],
        subtotal: 0,
        tax: 0,
        discount: 0,
        grandTotal: 0,
      });
    }

    return cart;
  }

  /**
   * Recalculates cart totals (subtotal, tax, discount, grandTotal)
   */
  private static async _recalculateTotals(cart: ICart): Promise<void> {
    let subtotal = 0;
    cart.items.forEach((item) => {
      subtotal += item.subtotal;
    });

    cart.subtotal = subtotal;

    // Cart tax should remain zero until billing ownership lands
    cart.tax = 0;
    cart.discount = 0;
    cart.grandTotal = cart.subtotal + cart.tax - cart.discount;
  }

  /**
   * Helper to format the cart response
   */
  private static formatCartResponse(cart: ICart) {
    const validItems = cart.items
      .filter((item) => item.menuItem != null)
      .map((item: any) => {
        const menuItem = item.menuItem;
        return {
          _id: item._id,
          menuItem: {
            _id: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            discountPrice: menuItem.discountPrice,
            image: menuItem.image,
            isVeg: menuItem.isVeg,
            isAvailable: menuItem.isAvailable,
          },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          notes: item.notes,
        };
      });

    return {
      _id: cart._id,
      restaurantId: cart.restaurantId,
      sessionId: cart.sessionId,
      items: validItems,
      subtotal: cart.subtotal,
      tax: cart.tax,
      discount: cart.discount,
      grandTotal: cart.grandTotal,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  static async getCart(restaurantId: string | Types.ObjectId, sessionId: string | Types.ObjectId) {
    const cart = await this.getOrCreateCart(restaurantId, sessionId);
    return this.formatCartResponse(cart);
  }

  static async addItemToCart(
    restaurantId: string | Types.ObjectId,
    sessionId: string | Types.ObjectId,
    data: AddItemInput
  ) {
    // 1. Validate menu item
    const menuItem = await MenuItem.findOne({ _id: data.menuItem, restaurantId });
    if (!menuItem) {
      throw new AppError('Menu item not found', 404, ErrorCode.NOT_FOUND);
    }
    if (!menuItem.isAvailable) {
      throw new AppError('Menu item is currently unavailable', 400, ErrorCode.VALIDATION_ERROR);
    }
    if (menuItem.isHidden) {
      throw new AppError('Menu item is hidden and cannot be ordered', 400, ErrorCode.VALIDATION_ERROR);
    }

    // 1.5 Check if bill is generated
    const existingBill = await BillingModel.findOne({ sessionId });
    if (existingBill && [BillStatus.GENERATED, BillStatus.PENDING_PAYMENT, BillStatus.PAID].includes(existingBill.status)) {
      throw new AppError('Cannot modify cart after bill has been generated', 400, ErrorCode.INVALID_REQUEST);
    }

    const cart = await this.getOrCreateCart(restaurantId, sessionId);

    // Snapshot price
    const unitPrice = menuItem.discountPrice != null ? menuItem.discountPrice : menuItem.price;

    // 2. Duplicate Check
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.menuItem._id.toString() === data.menuItem.toString() &&
        (item.notes || '') === (data.notes || '') &&
        Number(item.unitPrice) === Number(unitPrice)
    );

    if (existingItemIndex !== -1) {
      const existingItem = cart.items[existingItemIndex];
      existingItem.quantity += data.quantity;
      existingItem.subtotal = existingItem.quantity * existingItem.unitPrice;
    } else {
      cart.items.push({
        menuItem: new Types.ObjectId(data.menuItem) as any,
        quantity: data.quantity,
        unitPrice,
        subtotal: unitPrice * data.quantity,
        notes: data.notes,
      });
    }

    await this._recalculateTotals(cart);
    await cart.save();

    await cart.populate({
      path: 'items.menuItem',
      select: 'name price discountPrice image isVeg isAvailable',
    });

    return this.formatCartResponse(cart);
  }

  static async updateCartItem(
    restaurantId: string | Types.ObjectId,
    sessionId: string | Types.ObjectId,
    itemId: string | Types.ObjectId,
    updates: UpdateItemInput
  ) {
    const cart = await this.getOrCreateCart(restaurantId, sessionId);

    const item = cart.items.id(itemId);
    if (!item) {
      throw new AppError('Cart item not found', 404, ErrorCode.NOT_FOUND);
    }

    if (updates.quantity !== undefined) {
      item.quantity = updates.quantity;
      item.subtotal = item.quantity * item.unitPrice;
    }
    if (updates.notes !== undefined) {
      item.notes = updates.notes;
    }

    await this._recalculateTotals(cart);
    await cart.save();

    await cart.populate({
      path: 'items.menuItem',
      select: 'name price discountPrice image isVeg isAvailable',
    });

    return this.formatCartResponse(cart);
  }

  static async removeCartItem(
    restaurantId: string | Types.ObjectId,
    sessionId: string | Types.ObjectId,
    itemId: string | Types.ObjectId
  ) {
    const cart = await this.getOrCreateCart(restaurantId, sessionId);

    const item = cart.items.id(itemId);
    if (!item) {
      throw new AppError('Cart item not found', 404, ErrorCode.NOT_FOUND);
    }

    cart.items.pull(itemId);

    await this._recalculateTotals(cart);
    await cart.save();

    await cart.populate({
      path: 'items.menuItem',
      select: 'name price discountPrice image isVeg isAvailable',
    });

    return this.formatCartResponse(cart);
  }

  static async clearCart(restaurantId: string | Types.ObjectId, sessionId: string | Types.ObjectId) {
    const cart = await this.getOrCreateCart(restaurantId, sessionId);

    cart.items = [] as any;
    await this._recalculateTotals(cart);
    await cart.save();

    return this.formatCartResponse(cart);
  }
}
