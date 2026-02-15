import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        fullName: z.string().min(2, 'Full name must be at least 2 characters'),
        email: z.string().email('Invalid email address').optional(),
        phoneNumber: z.string().regex(/^01[0125][0-9]{8}$/, 'Invalid Egyptian phone number'),
        password: z
            .string()
            .min(12, 'Password must be at least 12 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[\W_]/, 'Password must contain at least one special character'),
        governorate: z.string().optional(),
        role: z.enum(['customer', 'admin', 'seller']).optional().default('customer'),
    }).strict(),
});

export const loginSchema = z.object({
    body: z.object({
        phoneNumber: z.string().regex(/^01[0125][0-9]{8}$/, 'Invalid Egyptian phone number'),
        password: z.string().min(1, 'Password is required'),
    }).strict(),
});

export const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().optional(),
    }).strict(),
});
