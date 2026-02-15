import prisma from '../config/database';

interface StockAdjustment {
    productId: string;
    changeQty: number;
    reason: 'sale' | 'restock' | 'return' | 'adjustment' | 'sync';
    reference?: string;
    createdBy?: string;
    channelId?: string;
}

export class InventoryService {
    /**
     * Adjust stock and log the change
     * This is the centralized method for all inventory operations
     */
    async adjustStock(adjustment: StockAdjustment) {
        return await prisma.$transaction(async (tx) => {
            // Get current product stock
            const product = await tx.product.findUnique({
                where: { id: adjustment.productId },
                select: { stockQty: true, name: true },
            });

            if (!product) {
                throw new Error(`Product with ID ${adjustment.productId} not found`);
            }

            const newQty = product.stockQty + adjustment.changeQty;

            // Prevent negative stock
            if (newQty < 0) {
                throw new Error(
                    `Cannot adjust stock: would result in negative quantity. Current: ${product.stockQty}, Change: ${adjustment.changeQty}`
                );
            }

            // Update product stock
            await tx.product.update({
                where: { id: adjustment.productId },
                data: { stockQty: newQty },
            });

            // Log the change
            await tx.inventoryLog.create({
                data: {
                    productId: adjustment.productId,
                    channelId: adjustment.channelId,
                    changeQty: adjustment.changeQty,
                    reason: adjustment.reason,
                    reference: adjustment.reference,
                    beforeQty: product.stockQty,
                    afterQty: newQty,
                    createdBy: adjustment.createdBy || 'system',
                },
            });

            return {
                productId: adjustment.productId,
                productName: product.name,
                previousQty: product.stockQty,
                newQty,
                change: adjustment.changeQty,
            };
        });
    }

    /**
     * Get stock history for a product
     */
    async getStockHistory(productId: string, limit = 50) {
        return await prisma.inventoryLog.findMany({
            where: { productId },
            include: {
                product: {
                    select: { name: true, sku: true },
                },
                channel: {
                    select: { name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Get low stock products
     */
    async getLowStockProducts(threshold = 10) {
        return await prisma.product.findMany({
            where: {
                stockQty: { lte: threshold },
                isActive: true,
            },
            include: {
                category: true,
            },
            orderBy: { stockQty: 'asc' },
        });
    }

    /**
     * Get out of stock products
     */
    async getOutOfStockProducts() {
        return await prisma.product.findMany({
            where: {
                stockQty: 0,
                isActive: true,
            },
            include: {
                category: true,
            },
        });
    }

    /**
     * Bulk stock adjustment (for imports/restocks)
     */
    async bulkAdjustStock(adjustments: StockAdjustment[]) {
        const results = [];
        for (const adjustment of adjustments) {
            const result = await this.adjustStock(adjustment);
            results.push(result);
        }
        return results;
    }
}

export default new InventoryService();
