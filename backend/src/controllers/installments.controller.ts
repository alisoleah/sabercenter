import { Request, Response, NextFunction } from 'express';
import installmentsService from '../services/installments.service';

export class InstallmentsController {
  /**
   * Get all active installment plans
   */
  async getPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await installmentsService.getPlans();
      res.status(200).json({
        success: true,
        data: plans,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Calculate installment details
   * Input validated by Zod middleware
   */
  async calculate(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, planId } = req.body;

      const calculation = await installmentsService.calculate(amount, planId);

      res.status(200).json({
        success: true,
        data: calculation,
      });
    } catch (error: any) {
      next(error);
    }
  }
  /**
   * Create plan (Admin)
   */
  async createPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await installmentsService.createPlan(req.body);
      res.status(201).json({ success: true, data: plan });
    } catch (error: any) { next(error); }
  }

  /**
   * Update plan (Admin)
   */
  async updatePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const plan = await installmentsService.updatePlan(id, req.body);
      res.status(200).json({ success: true, data: plan });
    } catch (error: any) { next(error); }
  }

  /**
   * Delete plan (Admin)
   */
  async deletePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await installmentsService.deletePlan(id);
      res.status(200).json({ success: true, message: 'Plan deleted' });
    } catch (error: any) { next(error); }
  }
}

export default new InstallmentsController();
