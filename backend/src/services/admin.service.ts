import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { decrypt } from '../utils/encryption';
import bcrypt from 'bcryptjs';

export class AdminService {
  /**
   * Get Pending KYC Applications
   */
  async getPendingKyc(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where: { kycStatus: 'Pending' },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { kycSubmittedAt: 'asc' },
      }),
      prisma.profile.count({ where: { kycStatus: 'Pending' } }),
    ]);

    // Decrypt nationalId for admin view
    const decryptedProfiles = profiles.map(profile => ({
      ...profile,
      nationalId: decrypt(profile.nationalId || ''),
    }));

    return {
      profiles: decryptedProfiles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Approve KYC
   */
  async approveKyc(userId: string, adminId: string, creditLimitAmount: number) {
    // Transaction: Update Profile AND Create/Update CreditLimit
    return await prisma.$transaction(async (tx) => {
      // 1. Update Profile
      const profile = await tx.profile.update({
        where: { userId },
        data: {
          kycStatus: 'Approved',
          kycApprovedAt: new Date(),
          approvedBy: adminId,
        },
      });

      // 2. Set Credit Limit
      // If user is verified, we should also update User table
      await tx.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });

      // 3. Create or Update Credit Limit
      const creditLimit = await tx.creditLimit.upsert({
        where: { userId },
        update: {
          totalLimit: new Prisma.Decimal(creditLimitAmount),
          remainingLimit: new Prisma.Decimal(creditLimitAmount), // Reset remaining? Or adjust? Usually reset/set new limit.
          // Note: If they had existing balance, we should probably check that.
          // For simplicity, we assume new limit sets the total, and remaining = total - currentBalance
          // But we need to know current balance.
          // Let's fetch it first if we want to be safe, but upsert 'update' can't reference current easily without raw query or separate fetch.
          // For MVP, let's assume if it exists, we update total. Remaining = total - existing_balance.
          // BUT, prisma upsert doesn't let us read old value in update easily.
          // Let's do a find first.
        },
        create: {
          userId,
          totalLimit: new Prisma.Decimal(creditLimitAmount),
          remainingLimit: new Prisma.Decimal(creditLimitAmount),
          currentBalance: new Prisma.Decimal(0),
          status: 'Active',
          approvedBy: adminId,
          approvedAt: new Date(),
        },
      });

      // Fix for remaining limit logic if it was an update
      // Since we can't easily do it in one upsert without raw query or assumptions,
      // let's rely on the fact that if they are getting approved, they might be new.
      // If they are existing, we should probably calculate correctly.
      // Let's refine this:

      const existingLimit = await tx.creditLimit.findUnique({ where: { userId } });
      if (existingLimit) {
        // Update
        const newTotal = new Prisma.Decimal(creditLimitAmount);
        const balance = existingLimit.currentBalance;
        const newRemaining = newTotal.sub(balance);

        await tx.creditLimit.update({
          where: { userId },
          data: {
            totalLimit: newTotal,
            remainingLimit: newRemaining,
            approvedBy: adminId,
            approvedAt: new Date(),
          }
        });
      }

      return profile;
    });
  }

  /**
   * Reject KYC
   */
  async rejectKyc(userId: string, adminId: string, reason: string) {
    return await prisma.profile.update({
      where: { userId },
      data: {
        kycStatus: 'Rejected',
        approvedBy: adminId, // or rejectedBy
        rejectionReason: reason,
        kycApprovedAt: null, // Reset if it was approved before? Or keep history?
        // Let's just update status.
      },
    });
  }

  /**
   * Get Analytics
   */
  async getAnalytics() {
    const [totalUsers, totalOrders, totalSales, pendingKyc] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
      }),
      prisma.profile.count({ where: { kycStatus: 'Pending' } }),
    ]);

    return {
      totalUsers,
      totalOrders,
      totalSales: totalSales._sum.totalAmount || 0,
      pendingKyc,
    };
  }


  /**
   * Get All Users
   */
  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          role: true,
          isVerified: true,
          createdAt: true,
          governorate: true,
          profile: {
            select: {
              employer: true,
              monthlySalary: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get All Orders
   */
  async getAllOrders(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: {
          user: {
            select: {
              fullName: true,
              phoneNumber: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count(),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  /**
   * Update User (Role, Verification)
   */
  async updateUser(userId: string, data: { role?: string; isVerified?: boolean; governorate?: string }) {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  /**
   * Delete User
   */
  async deleteUser(userId: string) {
    return await prisma.user.delete({
      where: { id: userId },
    });
  }

  /**
   * Update Order Status
   */
  async updateOrderStatus(orderId: string, status: string) {
    return await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  /**
   * Delete Order (or Cancel)
   * Usually perform soft delete or status update, but user asked for delete.
   * If strictly delete, cascading might wipe related data.
   * Let's implement as Cancel by default for safety, but if explicit delete requested...
   * Let's stick to true Delete as requested, assuming Prisma cascade handles it (OrderItem, etc.) based on schema.
   */
  async deleteOrder(orderId: string) {
    return await prisma.order.delete({
      where: { id: orderId },
    });
  }
  /**
   * Create User (Admin)
   */
  async createUser(data: any) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: data.phoneNumber },
          data.email ? { email: data.email } : {}
        ]
      }
    });

    if (existing) {
      throw new Error('User with this Phone Number or Email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    return await prisma.user.create({
      data: {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        email: data.email || null,
        passwordHash: hashedPassword,
        role: data.role || 'customer',
        governorate: data.governorate,
        isVerified: data.isVerified !== undefined ? data.isVerified : false,
      }
    });
  }
}

export default new AdminService();
