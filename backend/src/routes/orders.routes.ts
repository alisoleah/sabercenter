import { Router } from 'express';
import ordersController from '../controllers/orders.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createOrderSchema } from '../validators/orders.validator';

const router = Router();

// Protect all order routes
router.use(authenticate);

// Create new order
router.post('/', validate(createOrderSchema), ordersController.createOrder);

// Get my orders
router.get('/', ordersController.getMyOrders);

// Get order by ID
router.get('/:id', ordersController.getOrderById);

export default router;
