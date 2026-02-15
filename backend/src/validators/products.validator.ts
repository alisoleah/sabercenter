import { z } from 'zod';

export const createProductSchema = z.object({
    body: z.object({
        name: z.string().min(3, 'Product name is required'),
        description: z.string().optional(),
        cashPrice: z.coerce.number().min(0, 'Price must be positive'),
        oldPrice: z.coerce.number().optional(),
        stockQty: z.coerce.number().int().min(0, 'Stock cannot be negative').default(0),
        categoryId: z.string().uuid(),
        brand: z.string().optional(),
        images: z.array(z.string()).optional(), // Relaxed to string for relative paths
        imageUrl: z.string().optional(),
        specs: z.any().optional(), // Flexible
        badges: z.any().optional(),
        isActive: z.union([z.boolean(), z.string().transform(val => val === 'true')]).optional(),
    }).strip(), // strip unknown keys instead of strict
});

export const updateProductSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        name: z.string().min(3).optional(),
        description: z.string().optional(),
        cashPrice: z.coerce.number().min(0).optional(),
        oldPrice: z.coerce.number().optional(),
        stockQty: z.coerce.number().int().min(0).optional(),
        categoryId: z.string().uuid().optional(),
        brand: z.string().optional(),
        images: z.array(z.string()).optional(),
        imageUrl: z.string().optional(),
        existingImages: z.any().optional(), // Allow existingImages
        specs: z.any().optional(),
        badges: z.any().optional(),
        isActive: z.union([z.boolean(), z.string().transform(val => val === 'true')]).optional(),
    }).strip(),
});

export const productQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        categoryId: z.string().uuid().optional(),
        brand: z.string().optional(),
        minPrice: z.string().optional(),
        maxPrice: z.string().optional(),
        search: z.string().optional(),
        inStock: z.string().optional(),
    }),
});
