import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import installmentsService from './installments.service';

interface CreateOrderData {
  userId: string;
  items: {
    productId: string;
    quantity: number;
    warrantyMonths?: number;
  }[];
  deliveryMethod: string;
  deliveryAddress?: string;
  governorate?: string;
  pickupBranch?: string;
  paymentMethod: string;
  source?: string;
  // Installment specific
  installmentPlanId?: string;
}

export class OrdersService {
  /**
   * Create a new order with transaction support
   */
  async createOrder(data: CreateOrderData) {
    // 1. Calculate totals and verify stock
    let totalAmount = 0;
    const orderItemsData: Array<{
      productId: string;
      quantity: number;
      priceAtPurchase: number;
      warrantyMonths: number;
    }> = [];

    // Pre-fetch all products to check stock and prices
    const productIds = data.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    for (const item of data.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      if (product.stockQty < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      const itemPrice = Number(product.cashPrice);
      totalAmount += itemPrice * item.quantity;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: itemPrice,
        warrantyMonths: item.warrantyMonths || 0,
      });
    }

    // 2. Generate Order Number (ORD-YYYY-XXXX)
    const date = new Date();
    const year = date.getFullYear();
    const count = await prisma.order.count();
    const orderNumber = `ORD-${year}-${(count + 1).toString().padStart(4, '0')}`;

    // 3. Create Order in Transaction with optimistic locking
    // We re-check stock inside the transaction to prevent race conditions
    const order = await prisma.$transaction(async (tx) => {
      // Re-fetch products with current stock inside transaction
      const currentProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, stockQty: true, name: true },
      });

      const currentProductMap = new Map(currentProducts.map(p => [p.id, p]));

      // Verify stock again inside transaction (critical for race condition prevention)
      for (const item of data.items) {
        const currentProduct = currentProductMap.get(item.productId);
        if (!currentProduct) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
        if (currentProduct.stockQty < item.quantity) {
          throw new Error(`Insufficient stock for product: ${currentProduct.name}. Available: ${currentProduct.stockQty}, Requested: ${item.quantity}`);
        }
      }

      // Decrease stock atomically
      for (const item of data.items) {
        const product = currentProductMap.get(item.productId);
        if (!product) continue;

        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.quantity } },
        });

        // Log inventory change
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            changeQty: -item.quantity,
            reason: 'sale',
            reference: orderNumber,
            beforeQty: product.stockQty,
            afterQty: product.stockQty - item.quantity,
            createdBy: data.userId,
          },
        });
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          userId: data.userId,
          orderNumber,
          totalAmount: new Prisma.Decimal(totalAmount),
          status: 'Pending',
          deliveryMethod: data.deliveryMethod,
          deliveryAddress: data.deliveryAddress,
          governorate: data.governorate,
          pickupBranch: data.pickupBranch,
          paymentMethod: data.paymentMethod,
          source: data.source || 'saberstore',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Handle Installment Contract
      if (data.paymentMethod === 'installment') {
        if (!data.installmentPlanId) {
          throw new Error('Installment plan ID is required for installment payments');
        }

        const calculation = await installmentsService.calculate(totalAmount, data.installmentPlanId);

        // Generate Contract Number
        const contractNumber = `CON-${year}-${(count + 1).toString().padStart(4, '0')}`;

        // Get user phone for contract
        const user = await tx.user.findUnique({ where: { id: data.userId } });
        if (!user) throw new Error('User not found');

        // Create Contract
        const contract = await tx.installmentContract.create({
          data: {
            contractNumber,
            orderId: newOrder.id,
            userId: data.userId,
            installmentPlanId: data.installmentPlanId,
            totalFinancedAmount: new Prisma.Decimal(calculation.totalAmount),
            downPaymentAmount: new Prisma.Decimal(calculation.downPayment),
            monthlyPaymentAmount: new Prisma.Decimal(calculation.monthlyPayment),
            startDate: new Date(), // Starts now
            endDate: calculation.schedule[calculation.schedule.length - 1].dueDate,
            phoneNumber: user.phoneNumber,
            status: 'Active', // Should be 'Pending' until OTP verified? using Active for now as per MVP
          }
        });

        // Create Payment Schedule
        const scheduleData = installmentsService.generateScheduleData(
          contract.id,
          new Date(),
          calculation.durationMonths,
          calculation.monthlyPayment
        );

        await tx.paymentSchedule.createMany({
          data: scheduleData
        });
      }

      return newOrder;
    });

    return order;
  }

  /**
   * Get all orders for a user
   */
  async getUserOrders(userId: string) {
    return await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
                brand: true,
              },
            },
          },
        },
        contract: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get single order by ID
   */
  async getOrderById(orderId: string, userId?: string) {
    const where: any = { id: orderId };

    // If userId is provided, ensure the order belongs to them
    if (userId) {
      where.userId = userId;
    }

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        contract: {
          include: {
            paymentSchedule: true,
            installmentPlan: true,
          },
        },
        user: {
          select: {
            fullName: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }
}

export default new OrdersService();
