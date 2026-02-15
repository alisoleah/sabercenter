import { z } from 'zod';

const orderItemSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
    warrantyMonths: z.number().int().min(0).max(60).optional(),
});

export const createOrderSchema = z.object({
    body: z.object({
        items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
        deliveryMethod: z.enum(['delivery', 'pickup']),
        deliveryAddress: z.string().min(10, 'Delivery address is required').optional(),
        governorate: z.string().optional(),
        pickupBranch: z.string().optional(),
        paymentMethod: z.enum(['cash', 'installment', 'card']),
        source: z.string().optional(),
        installmentPlanId: z.string().uuid().optional(),
    }).strict()
        .refine(
            (data) => {
                if (data.deliveryMethod === 'delivery') {
                    return !!data.deliveryAddress && data.deliveryAddress.length >= 10;
                }
                return true;
            },
            {
                message: 'Delivery address is required when delivery method is "delivery"',
                path: ['deliveryAddress'],
            }
        )
        .refine(
            (data) => {
                if (data.deliveryMethod === 'pickup') {
                    return !!data.pickupBranch;
                }
                return true;
            },
            {
                message: 'Pickup branch is required when delivery method is "pickup"',
                path: ['pickupBranch'],
            }
        )
        .refine(
            (data) => {
                if (data.paymentMethod === 'installment') {
                    return !!data.installmentPlanId;
                }
                return true;
            },
            {
                message: 'Installment plan ID is required for installment payments',
                path: ['installmentPlanId'],
            }
        ),
});
