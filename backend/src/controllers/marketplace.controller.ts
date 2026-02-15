import { Request, Response, NextFunction } from 'express';
import amazonService from '../services/amazon.service';

export class MarketplaceController {
    /**
     * Test Amazon connection
     * GET /api/marketplace/amazon/status
     */
    async getAmazonStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const isConnected = await amazonService.testConnection();

            if (isConnected) {
                const marketplaceStatus = await amazonService.getMarketplaceStatus();

                return res.status(200).json({
                    success: true,
                    message: 'Amazon connection successful',
                    data: {
                        connected: true,
                        marketplaces: marketplaceStatus,
                    },
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to connect to Amazon',
                });
            }
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Get Amazon orders
     * GET /api/marketplace/amazon/orders
     * Query params: startDate (ISO string), endDate (ISO string, optional)
     */
    async getAmazonOrders(req: Request, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate) {
                return res.status(400).json({
                    success: false,
                    message: 'startDate is required (ISO format)',
                });
            }

            const start = new Date(startDate as string);
            const end = endDate ? new Date(endDate as string) : undefined;

            const orders = await amazonService.getOrders(start, end);

            return res.status(200).json({
                success: true,
                data: {
                    count: orders.length,
                    orders,
                },
            });
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Get single Amazon order by ID (for sandbox testing)
     * GET /api/marketplace/amazon/orders/:orderId
     */
    async getAmazonOrderById(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId } = req.params;

            const order = await amazonService.getOrderById(orderId);

            return res.status(200).json({
                success: true,
                data: order,
            });
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Sync inventory to Amazon (placeholder)
     * POST /api/marketplace/amazon/inventory/:productId
     */
    async syncInventory(req: Request, res: Response, next: NextFunction) {
        try {
            const { productId } = req.params;
            const { quantity } = req.body;

            // TODO: Get product SKU from database
            // await amazonService.updateInventory(sku, quantity);

            return res.status(501).json({
                success: false,
                message: 'Inventory sync not yet implemented',
            });
        } catch (error: any) {
            next(error);
        }
    }
}

export default new MarketplaceController();
