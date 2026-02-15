import { Router } from 'express';
import inventoryController from '../controllers/inventory.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
    stockAdjustmentSchema,
    bulkStockAdjustmentSchema,
    lowStockQuerySchema
} from '../validators/inventory.validator';

const router = Router();

// All inventory routes require admin authentication
router.use(authenticate);
router.use(requireRole('admin'));

// Stock adjustment
router.post('/adjust', validate(stockAdjustmentSchema), inventoryController.adjustStock);

// Bulk stock adjustment
router.post('/bulk-adjust', validate(bulkStockAdjustmentSchema), inventoryController.bulkAdjustStock);

// Stock history
router.get('/history/:productId', inventoryController.getStockHistory);

// Low stock monitoring
router.get('/low-stock', validate(lowStockQuerySchema), inventoryController.getLowStockProducts);

// Out of stock
router.get('/out-of-stock', inventoryController.getOutOfStockProducts);

export default router;
