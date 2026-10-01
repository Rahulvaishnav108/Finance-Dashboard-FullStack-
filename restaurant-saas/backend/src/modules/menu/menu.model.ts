import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  description?: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
  isHidden: boolean;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String, trim: true },
    displayOrder: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    isHidden: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, collection: 'menuCategories' }
);

CategorySchema.index({ restaurantId: 1, displayOrder: 1 });
CategorySchema.index({ restaurantId: 1, isActive: 1 });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);

export interface IMenuItem extends Document {
  restaurantId: Types.ObjectId;
  categoryId: Types.ObjectId;
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  image?: string;
  images?: string[];
  isVeg: boolean;
  isAvailable: boolean;
  isHidden: boolean;
  preparationTime?: number; // in minutes
  spiceLevel?: number; // 0-5
  tags?: string[];
  displayOrder: number;
  ingredients?: {
    inventoryItemId: Types.ObjectId;
    quantity: number;
  }[];
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    shortDescription: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    image: { type: String, trim: true },
    images: [{ type: String, trim: true }],
    isVeg: { type: Boolean, required: true },
    isAvailable: { type: Boolean, default: true },
    isHidden: { type: Boolean, default: false },
    preparationTime: { type: Number, min: 0 },
    spiceLevel: { type: Number, min: 0, max: 5 },
    tags: [{ type: String, trim: true }],
    displayOrder: { type: Number, default: 0, min: 0 },
    ingredients: [
      {
        inventoryItemId: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
        quantity: { type: Number, required: true, min: 0 },
        _id: false,
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, collection: 'menuItems' }
);

MenuItemSchema.index({ restaurantId: 1, categoryId: 1 });
MenuItemSchema.index({ restaurantId: 1, isAvailable: 1 });
MenuItemSchema.index({ restaurantId: 1, isHidden: 1 });
MenuItemSchema.index({ restaurantId: 1, name: 1 });

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
