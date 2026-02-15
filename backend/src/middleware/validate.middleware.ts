import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Higher-order function that returns an Express middleware
 * to validate request data against a Zod schema.
 * Compatible with Zod v4.
 */
export const validate = (schema: z.ZodType<unknown>) => (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const result = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        }) as any;

        req.body = result.body;
        req.query = result.query;
        req.params = result.params;
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.issues.map((issue: z.ZodIssue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            });
            return;
        }
        next(error);
    }
};
