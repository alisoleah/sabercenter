import { z } from 'zod';

/**
 * Schema for calculating installment payments
 */
export const calculateInstallmentSchema = z.object({
    body: z.object({
        amount: z.number()
            .min(100, 'Amount must be at least 100 EGP')
            .max(1000000, 'Amount cannot exceed 1,000,000 EGP'),
        planId: z.string().uuid('Invalid installment plan ID'),
    }).strict(),
});

export const createPlanSchema = z.object({
    body: z.object({
        name: z.string().min(3, 'Name is required'),
        durationMonths: z.number().int().min(1, 'Duration must be at least 1 month'),
        interestRate: z.number().min(0, 'Interest rate cannot be negative'),
        minDownPayment: z.number().min(0, 'Down payment cannot be negative'),
        applicableCategories: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
    }).strict(),
});

export const updatePlanSchema = z.object({
    body: z.object({
        name: z.string().min(3).optional(),
        durationMonths: z.number().int().min(1).optional(),
        interestRate: z.number().min(0).optional(),
        minDownPayment: z.number().min(0).optional(),
        applicableCategories: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
    }).strict(),
});
