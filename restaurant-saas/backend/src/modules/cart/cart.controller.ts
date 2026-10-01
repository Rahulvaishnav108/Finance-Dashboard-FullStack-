import { Request, Response } from 'express';
import { CartService } from './cart.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  // `requireSession` middleware attaches `tableSession` to `req`
  const { restaurantId, _id: sessionId } = req.tableSession!;

  const cart = await CartService.getCart(restaurantId, sessionId);

  sendSuccess(res, cart);
});

export const addItemToCart = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId, _id: sessionId } = req.tableSession!;

  const cart = await CartService.addItemToCart(restaurantId, sessionId, req.body);

  sendSuccess(res, cart, 201);
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId, _id: sessionId } = req.tableSession!;
  const { itemId } = req.params;

  const cart = await CartService.updateCartItem(restaurantId, sessionId, itemId, req.body);

  sendSuccess(res, cart);
});

export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId, _id: sessionId } = req.tableSession!;
  const { itemId } = req.params;

  const cart = await CartService.removeCartItem(restaurantId, sessionId, itemId);

  sendSuccess(res, cart);
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId, _id: sessionId } = req.tableSession!;

  const cart = await CartService.clearCart(restaurantId, sessionId);

  sendSuccess(res, cart);
});
