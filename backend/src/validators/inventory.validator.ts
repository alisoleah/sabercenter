import { z } from 'zod';

export const stockAdjustmentSchema = z.object({
    body: z.object({
        productId: z.string().uuid(),
        changeQty: z.number().int().refine(
            (val) => val !== 0,
            { message: 'Change quantity cannot be zero' }
        ),
        reason: z.enum(['sale', 'restock', 'return', 'adjustment', 'sync']),
        reference: z.string().optional(),
    }).strict(),
});

export const bulkStockAdjustmentSchema = z.object({
    body: z.object({
        adjustments: z.array(z.object({
            productId: z.string().uuid(),
            changeQty: z.number().int(),
            reason: z.enum(['sale', 'restock', 'return', 'adjustment', 'sync']),
            reference: z.string().optional(),
        })).min(1, 'At least one adjustment is required'),
    }).strict(),
});

export const lowStockQuerySchema = z.object({
    query: z.object({
        threshold: z.string().optional().refine(
            (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
            { message: 'Threshold must be a positive number' }
        ),
    }),
});
