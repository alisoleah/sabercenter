import { Router } from 'express';
import installmentsController from '../controllers/installments.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { calculateInstallmentSchema, createPlanSchema, updatePlanSchema } from '../validators/installments.validator';

const router = Router();

// Get plans (Public)
router.get('/plans', installmentsController.getPlans);

// Calculate (Public)
router.post('/calculate', validate(calculateInstallmentSchema), installmentsController.calculate);

// Admin Routes (Protected)
router.post('/', authenticate, requireRole('admin'), validate(createPlanSchema), installmentsController.createPlan);
router.put('/:id', authenticate, requireRole('admin'), validate(updatePlanSchema), installmentsController.updatePlan);
router.delete('/:id', authenticate, requireRole('admin'), installmentsController.deletePlan);

export default router;

