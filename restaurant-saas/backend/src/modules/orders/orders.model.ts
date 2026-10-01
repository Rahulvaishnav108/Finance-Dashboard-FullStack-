// src/modules/orders/orders.model.ts

import { model } from "mongoose";
import { IOrder } from "./orders.schema";
import orderSchema from "./orders.schema";

export const OrderModel = model<IOrder>("Order", orderSchema);