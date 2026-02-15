import { z } from 'zod';

/**
 * Common Zod Schemas
 */

export const paginationSchema = z.object({
    query: z.object({
        page: z.string().optional().default('1').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
            message: 'Page must be a positive number',
        }),
        limit: z.string().optional().default('20').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
            message: 'Limit must be a positive number',
        }),
    }).partial(),
});

export const uuidParamSchema = z.object({
    params: z.object({
        id: z.string().uuid({ message: 'Invalid UUID format' }),
    }),
});
