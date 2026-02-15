import { Request, Response, NextFunction } from 'express';
import inventoryService from '../services/inventory.service';

export class InventoryController {
    /**
     * Adjust stock for a product
     * POST /api/admin/inventory/adjust
     */
    async adjustStock(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            const { productId, changeQty, reason, reference } = req.body;

            const result = await inventoryService.adjustStock({
                productId,
                changeQty,
                reason,
                reference,
                createdBy: user.userId,
            });

            res.status(200).json({
                success: true,
                message: 'Stock adjusted successfully',
                data: result,
            });
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Get stock history for a product
     * GET /api/admin/inventory/history/:productId
     */
    async getStockHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const { productId } = req.params;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

            const history = await inventoryService.getStockHistory(productId, limit);

            res.status(200).json({
                success: true,
                data: history,
            });
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Get low stock products
     * GET /api/admin/inventory/low-stock
     */
    async getLowStockProducts(req: Request, res: Response, next: NextFunction) {
        try {
            const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 10;

            const products = await inventoryService.getLowStockProducts(threshold);

            res.status(200).json({
                success: true,
                data: {
                    threshold,
                    count: products.length,
                    products,
                },
            });
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Get out of stock products
     * GET /api/admin/inventory/out-of-stock
     */
    async getOutOfStockProducts(req: Request, res: Response, next: NextFunction) {
        try {
            const products = await inventoryService.getOutOfStockProducts();

            res.status(200).json({
                success: true,
                data: {
                    count: products.length,
                    products,
                },
            });
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Bulk stock adjustment
     * POST /api/admin/inventory/bulk-adjust
     */
    async bulkAdjustStock(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            const { adjustments } = req.body;

            // Add createdBy to each adjustment
            const adjustmentsWithUser = adjustments.map((adj: any) => ({
                ...adj,
                createdBy: user.userId,
            }));

            const results = await inventoryService.bulkAdjustStock(adjustmentsWithUser);

            res.status(200).json({
                success: true,
                message: `${results.length} stock adjustments completed`,
                data: results,
            });
        } catch (error: any) {
            next(error);
        }
    }
}

export default new InventoryController();
