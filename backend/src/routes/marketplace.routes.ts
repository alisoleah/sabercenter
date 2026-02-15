import { Router } from 'express';
import marketplaceController from '../controllers/marketplace.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';

const router = Router();

// All marketplace routes require admin authentication
router.use(authenticate);
router.use(requireRole('admin'));

/**
 * Amazon Integration Routes
 */

// GET /api/marketplace/amazon/status - Test Amazon connection
router.get('/amazon/status', marketplaceController.getAmazonStatus);

// GET /api/marketplace/amazon/orders - Get Amazon orders
router.get('/amazon/orders', marketplaceController.getAmazonOrders);

// GET /api/marketplace/amazon/orders/:orderId - Get single order
router.get('/amazon/orders/:orderId', marketplaceController.getAmazonOrderById);

// POST /api/marketplace/amazon/inventory/:productId - Sync inventory
router.post('/amazon/inventory/:productId', marketplaceController.syncInventory);

export default router;
