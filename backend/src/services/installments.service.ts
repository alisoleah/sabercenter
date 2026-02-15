import prisma from '../config/database';
import { Prisma } from '@prisma/client';

interface CalculationResult {
  planId: string;
  planName: string;
  totalAmount: number; // Total financed amount + interest
  monthlyPayment: number;
  downPayment: number;
  durationMonths: number;
  interestRate: number;
  schedule: {
    installmentNumber: number;
    dueDate: Date;
    amount: number;
  }[];
}

export class InstallmentsService {
  /**
   * Get available installment plans
   */
  async getPlans() {
    return await prisma.installmentPlan.findMany({
      where: { isActive: true },
      orderBy: { durationMonths: 'asc' },
    });
  }

  /**
   * Calculate installment details
   */
  async calculate(amount: number, planId: string): Promise<CalculationResult> {
    const plan = await prisma.installmentPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error('Installment plan not found');
    }

    const duration = plan.durationMonths;
    const interestRate = Number(plan.interestRate) / 100;
    const minDownPaymentRate = Number(plan.minDownPayment) / 100;

    // Calculate Down Payment (using minimum for now, could be user input)
    const downPayment = amount * minDownPaymentRate;

    // Amount to finance
    const financedAmount = amount - downPayment;

    // Total Interest
    // Simple interest for now: Principal * Rate * (Duration/12) ?
    // Or flat rate? "20% interest" usually means flat on the financed amount in retail.
    // Let's assume flat rate on financed amount for the duration.
    // If interest is 0, totalInterest is 0.
    const totalInterest = financedAmount * interestRate;

    const totalFinancedWithInterest = financedAmount + totalInterest;

    // Monthly Payment
    const monthlyPayment = totalFinancedWithInterest / duration;

    // Generate Schedule
    const schedule = [];
    const today = new Date();

    for (let i = 1; i <= duration; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + i);

      schedule.push({
        installmentNumber: i,
        dueDate,
        amount: Number(monthlyPayment.toFixed(2)),
      });
    }

    return {
      planId: plan.id,
      planName: plan.name,
      totalAmount: Number((totalFinancedWithInterest + downPayment).toFixed(2)),
      monthlyPayment: Number(monthlyPayment.toFixed(2)),
      downPayment: Number(downPayment.toFixed(2)),
      durationMonths: duration,
      interestRate: Number(plan.interestRate),
      schedule,
    };
  }

  /**
   * Generate schedule for database insertion
   */
  generateScheduleData(contractId: string, startDate: Date, duration: number, monthlyAmount: number) {
    const schedule = [];

    for (let i = 1; i <= duration; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + i);

      schedule.push({
        contractId,
        installmentNumber: i,
        dueDate,
        amount: new Prisma.Decimal(monthlyAmount),
        status: 'Pending',
      });
    }

    return schedule;
  }
  /**
   * Create a new installment plan
   */
  async createPlan(data: any) {
    const {
      name,
      durationMonths,
      interestRate,
      minDownPayment,
      applicableCategories,
      isActive
    } = data;

    return await prisma.installmentPlan.create({
      data: {
        name,
        durationMonths,
        interestRate,
        minDownPayment,
        applicableCategories: applicableCategories || [],
        isActive: isActive !== undefined ? isActive : true,
      },
    });
  }

  /**
   * Update an existing installment plan
   */
  async updatePlan(id: string, data: any) {
    const {
      name,
      durationMonths,
      interestRate,
      minDownPayment,
      applicableCategories,
      isActive
    } = data;

    return await prisma.installmentPlan.update({
      where: { id },
      data: {
        name,
        durationMonths,
        interestRate,
        minDownPayment,
        applicableCategories,
        isActive,
      },
    });
  }

  /**
   * Delete an installment plan
   */
  async deletePlan(id: string) {
    return await prisma.installmentPlan.delete({
      where: { id },
    });
  }
}

export default new InstallmentsService();
