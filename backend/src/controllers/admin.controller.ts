import { Request, Response, NextFunction } from 'express';
import adminService from '../services/admin.service';
import { securityLog } from '../config/logger';

export class AdminController {
  /**
   * Get Pending KYC
   */
  async getPendingKyc(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await adminService.getPendingKyc(
        Number(page || 1),
        Number(limit || 20)
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Approve KYC
   * Input validated by Zod middleware
   */
  async approveKyc(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, creditLimit } = req.body;
      const adminId = (req as any).user.userId;

      const result = await adminService.approveKyc(userId, adminId, creditLimit);

      // Log security event
      securityLog.kycApproved(userId, adminId, creditLimit);

      res.status(200).json({
        success: true,
        message: 'KYC Approved and Credit Limit Set',
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Reject KYC
   * Input validated by Zod middleware
   */
  async rejectKyc(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, reason } = req.body;
      const adminId = (req as any).user.userId;

      const result = await adminService.rejectKyc(userId, adminId, reason);

      // Log security event
      securityLog.kycRejected(userId, adminId, reason);

      res.status(200).json({
        success: true,
        message: 'KYC Rejected',
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get Analytics
   */
  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getAnalytics();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get All Users
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await adminService.getAllUsers(
        Number(page || 1),
        Number(limit || 20)
      );

      // Map profile fields (employer/salary) directly to user object for easier frontend consumption
      const mappedUsers = result.users.map((u: any) => ({
        ...u,
        employmentStatus: u.profile?.employer || null,
        monthlyIncome: u.profile?.monthlySalary || null,
        // profile: undefined // optional cleanup
      }));

      res.status(200).json({
        success: true,
        data: {
          users: mappedUsers,
          pagination: result.pagination
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get All Orders
   */
  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await adminService.getAllOrders(
        Number(page || 1),
        Number(limit || 20)
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }
  /**
   * Update User
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await adminService.updateUser(id, req.body);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) { next(error); }
  }

  /**
   * Delete User
   */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await adminService.deleteUser(id);
      res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error: any) { next(error); }
  }

  // ==========================================
  // CATEGORY MANAGEMENT
  // ==========================================

  /**
   * Create Category
   */
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      // In a real app, handle image upload via Multer middleware here
      // For now, assume icon is a URL string passed in body
      const category = await import('../services/products.service').then(s => s.default.createCategory(req.body));
      res.status(201).json({ success: true, data: category });
    } catch (error: any) { next(error); }
  }

  /**
   * Update Category
   */
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await import('../services/products.service').then(s => s.default.updateCategory(id, req.body));
      res.status(200).json({ success: true, data: category });
    } catch (error: any) { next(error); }
  }

  /**
   * Delete Category
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await import('../services/products.service').then(s => s.default.deleteCategory(id));
      res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error: any) { next(error); }
  }

  /**
   * Update Order Status
   */
  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await adminService.updateOrderStatus(id, status);
      res.status(200).json({ success: true, data: order });
    } catch (error: any) { next(error); }
  }

  /**
   * Delete Order
   */
  async deleteOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await adminService.deleteOrder(id);
      res.status(200).json({ success: true, message: 'Order deleted' });
    } catch (error: any) { next(error); }
  }

  /**
   * Create User (Admin)
   */
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await adminService.createUser(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error: any) { next(error); }
  }
}

export default new AdminController();
