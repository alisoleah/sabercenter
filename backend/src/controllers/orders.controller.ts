import { Request, Response, NextFunction } from 'express';
import ordersService from '../services/orders.service';

export class OrdersController {
  /**
   * Create a new order
   */
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      const order = await ordersService.createOrder({
        userId: user.userId,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get logged-in user's orders
   */
  async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      const orders = await ordersService.getUserOrders(user.userId);

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const order = await ordersService.getOrderById(id, user.userId);

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export default new OrdersController();
