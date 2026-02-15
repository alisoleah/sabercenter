import { z } from 'zod';

export const kycSubmitSchema = z.object({
    body: z.object({
        nationalId: z.string().regex(/^\d{14}$/, 'National ID must be exactly 14 digits'),
        monthlySalary: z.number().min(1000, 'Salary must be at least 1000'),
        employer: z.string().min(2, 'Employer name is required'),
        address: z.string().min(5, 'Address is required'),
    }).strict(),
});

export const kycUploadSchema = z.object({
    body: z.object({
        type: z.enum(['id', 'bill']),
    }),
});
