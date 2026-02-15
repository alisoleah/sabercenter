import { Request, Response, NextFunction } from 'express';
import kycService from '../services/kyc.service';

export class KycController {
  /**
   * Upload Document (ID or Utility Bill)
   */
  async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const { type } = req.body;
      if (!type || !['id', 'bill'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid document type. Must be "id" or "bill".',
        });
      }

      const user = (req as any).user;
      const url = await kycService.uploadDocument(user.userId, req.file, type);

      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: { url },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Submit KYC Data
   */
  async submitKyc(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { nationalId, monthlySalary, employer, address } = req.body;

      if (!nationalId || !monthlySalary || !employer) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: nationalId, monthlySalary, employer',
        });
      }

      const profile = await kycService.submitApplication({
        userId: user.userId,
        nationalId,
        monthlySalary: Number(monthlySalary),
        employer,
        address,
      });

      res.status(200).json({
        success: true,
        message: 'KYC application submitted successfully',
        data: profile,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get KYC Status
   */
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const status = await kycService.getStatus(user.userId);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export default new KycController();
