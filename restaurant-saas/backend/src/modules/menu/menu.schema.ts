import { z } from 'zod';
import { Types } from 'mongoose';

// Custom validator for MongoDB ObjectId
export const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId format',
});

const imageReferenceSchema = z
  .string()
  .trim()
  .min(1, 'Image reference is required')
  .refine((value) => value.startsWith('/') || /^https?:\/\//i.test(value), {
    message: 'Image must be an absolute URL or upload path',
  });

// Generic query schemas
export const paginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
  sortBy: z.string().optional(),
  search: z.string().optional(),
});

export const idParamSchema = z.object({
  id: objectIdSchema,
});

export const restaurantIdParamSchema = z.object({
  restaurantId: objectIdSchema,
});

export const restaurantIdQuerySchema = z.object({
  restaurantId: objectIdSchema,
});

/*
|--------------------------------------------------------------------------
| CATEGORY SCHEMAS
|--------------------------------------------------------------------------
*/

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  displayOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
  isHidden: z.boolean().optional().default(false),
});

export const updateCategorySchema = createCategorySchema.partial();

export const toggleCategorySchema = z.object({
  isActive: z.boolean(),
});

export const reorderCategoriesSchema = z.object({
  categories: z.array(
    z.object({
      id: objectIdSchema,
      displayOrder: z.number().int().min(0),
    })
  ).min(1, 'At least one category is required for reordering'),
});

/*
|--------------------------------------------------------------------------
| MENU ITEM SCHEMAS
|--------------------------------------------------------------------------
*/

export const createItemSchema = z.object({
  categoryId: objectIdSchema,
  name: z.string().min(1, 'Name is required').max(150),
  description: z.string().max(1000).optional(),
  shortDescription: z.string().max(200).optional(),
  price: z.number().min(0, 'Price must be a positive number'),
  discountPrice: z.number().min(0).optional(),
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  images: z.array(z.string().url()).max(10).optional(),
  isVeg: z.boolean(),
  isAvailable: z.boolean().optional().default(true),
  isHidden: z.boolean().optional().default(false),
  preparationTime: z.number().int().min(0).optional(),
  spiceLevel: z.number().int().min(0).max(5).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  displayOrder: z.number().int().min(0).optional().default(0),
  ingredients: z
    .array(
      z.object({
        inventoryItemId: objectIdSchema,
        quantity: z.number().positive('Quantity must be greater than 0'),
      })
    )
    .optional(),
});

export const updateItemSchema = createItemSchema.partial();

export const toggleItemAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

export const toggleItemVisibilitySchema = z.object({
  isHidden: z.boolean(),
});

export const reorderItemsSchema = z.object({
  items: z.array(
    z.object({
      id: objectIdSchema,
      displayOrder: z.number().int().min(0),
    })
  ).min(1, 'At least one item is required for reordering'),
});

export const updateItemImageSchema = z.object({
  image: imageReferenceSchema.optional(),
  imageUrl: imageReferenceSchema.optional(),
  addToGallery: z.boolean().optional().default(true),
}).refine((value) => Boolean(value.image || value.imageUrl), {
  message: 'Image is required',
  path: ['image'],
});

// Menu Item Query Schema (Customers/Public)
export const menuItemQuerySchema = paginationQuerySchema.extend({
  category: z.string().trim().min(1).optional(),
  veg: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
  vegOnly: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
  spicy: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
  available: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
  popular: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
  recommended: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
  priceMin: z.string().regex(/^\d+$/).transform(Number).optional(),
  priceMax: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export const publicItemParamsSchema = z.object({
  restaurantId: objectIdSchema,
  id: objectIdSchema,
});
