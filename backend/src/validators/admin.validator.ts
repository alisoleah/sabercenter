import { z } from 'zod';

/**
 * Schema for approving KYC applications
 */
export const approveKycSchema = z.object({
    body: z.object({
        userId: z.string().uuid('Invalid user ID format'),
        creditLimit: z.number()
            .min(1000, 'Credit limit must be at least 1000 EGP')
            .max(500000, 'Credit limit cannot exceed 500,000 EGP'),
    }).strict(),
});

/**
 * Schema for rejecting KYC applications
 */
export const rejectKycSchema = z.object({
    body: z.object({
        userId: z.string().uuid('Invalid user ID format'),
        reason: z.string()
            .min(10, 'Rejection reason must be at least 10 characters')
            .max(500, 'Rejection reason cannot exceed 500 characters'),
    }).strict(),
});
/**
 * Schema for creating a user (Admin)
 */
export const createUserSchema = z.object({
    body: z.object({
        fullName: z.string().min(2, 'Full name must be at least 2 characters'),
        email: z.string().email('Invalid email address').optional().or(z.literal('')),
        phoneNumber: z.string().regex(/^01[0125][0-9]{8}$/, 'Invalid Egyptian phone number'),
        password: z.string().min(6, 'Password is required (min 6 chars)'),
        governorate: z.string().optional(),
        role: z.enum(['customer', 'admin', 'seller', 'credit_officer']).default('customer'),
        isVerified: z.boolean().optional(),
    }).strict(), // Strict to prevent unknown fields
});
