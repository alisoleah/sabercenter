import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { approveKycSchema, rejectKycSchema, createUserSchema } from '../validators/admin.validator';

const router = Router();

// Protect all admin routes
router.use(authenticate);
router.use(requireRole('admin'));

// KYC Management
router.get('/kyc/pending', adminController.getPendingKyc);
router.put('/kyc/approve', validate(approveKycSchema), adminController.approveKyc);
router.put('/kyc/reject', validate(rejectKycSchema), adminController.rejectKyc);

// Analytics
router.get('/analytics', adminController.getAnalytics);

// User Management
router.get('/users', adminController.getAllUsers);
router.post('/users', validate(createUserSchema), adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Category Management
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Order Management
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.delete('/orders/:id', adminController.deleteOrder);

export default router;

