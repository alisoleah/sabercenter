import apiClient from './client';

export interface KYCApplication {
    userId: string;
    user: {
        fullName: string;
        email: string;
        phoneNumber: string;
    };
    nationalId: string;
    nationalIdImageUrl?: string;
    utilityBillImageUrl?: string;
    employmentStatus?: string;
    monthlyIncome?: number;
    kycStatus: 'Pending' | 'Approved' | 'Rejected';
    kycSubmittedAt: Date;
    kycApprovedAt?: Date;
    approvedBy?: string;
    rejectionReason?: string;
}

export interface InstallmentPlan {
    id: string;
    durationMonths: number;
    interestRate: number;
    downPaymentPercentage: number;
    categoryId?: string;
    category?: {
        name: string;
    };
    isActive: boolean;
}

export interface AdminStats {
    totalUsers: number;
    totalOrders: number;
    totalSales: number;
    pendingKyc: number;
}

export interface AdminUser {
    id: string;
    fullName: string;
    email: string | null;
    phoneNumber: string;
    role: string;
    isVerified: boolean;
    governorate: string | null;
    employmentStatus: string | null; // Mapped from profile
    monthlyIncome: number | null;    // Mapped from profile
    createdAt: string;
}

export interface AdminOrder {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    orderDate: string;
    user: {
        fullName: string;
        phoneNumber: string;
    };
    items: any[];
}

export const adminApi = {
    /**
     * Get All Users
     */
    async getAllUsers(page = 1, limit = 20) {
        const response = await apiClient.get('/api/admin/users', {
            params: { page, limit },
        });
        return response.data.data; // Returns { users: [], pagination: {} }
    },

    /**
     * Get All Orders
     */
    async getAllOrders(page = 1, limit = 20) {
        const response = await apiClient.get('/api/admin/orders', {
            params: { page, limit },
        });
        return response.data.data; // Returns { orders: [], pagination: {} }
    },

    /**
     * Get pending KYC applications
     */
    async getPendingKYC(page = 1, limit = 20) {
        const response = await apiClient.get('/api/admin/kyc/pending', {
            params: { page, limit },
        });
        return response.data;
    },

    /**
     * Approve KYC application and set credit limit
     */
    async approveKYC(userId: string, creditLimit: number) {
        const response = await apiClient.put('/api/admin/kyc/approve', {
            userId,
            creditLimit,
        });
        return response.data;
    },

    /**
     * Reject KYC application
     */
    async rejectKYC(userId: string, reason: string) {
        const response = await apiClient.put('/api/admin/kyc/reject', {
            userId,
            reason,
        });
        return response.data;
    },

    /**
     * Get admin dashboard statistics
     */
    async getAnalytics() {
        const response = await apiClient.get('/api/admin/analytics');
        return response.data;
    },

    /**
     * Get all installment plans
     */
    async getInstallmentPlans() {
        const response = await apiClient.get('/api/installments/plans');
        return response.data;
    },

    // User Management
    async createUser(data: any) {
        const response = await apiClient.post('/api/admin/users', data);
        return response.data;
    },
    async updateUser(userId: string, data: any) {
        const response = await apiClient.put(`/api/admin/users/${userId}`, data);
        return response.data;
    },
    async deleteUser(userId: string) {
        const response = await apiClient.delete(`/api/admin/users/${userId}`);
        return response.data;
    },

    // Order Management
    async updateOrderStatus(orderId: string, status: string) {
        const response = await apiClient.put(`/api/admin/orders/${orderId}/status`, { status });
        return response.data;
    },
    async deleteOrder(orderId: string) {
        const response = await apiClient.delete(`/api/admin/orders/${orderId}`);
        return response.data;
    },

    // Installment Plans Management
    async createPlan(data: any) {
        const response = await apiClient.post('/api/installments', data);
        return response.data;
    },
    async updatePlan(id: string, data: any) {
        const response = await apiClient.put(`/api/installments/${id}`, data);
        return response.data;
    },
    async deletePlan(id: string) {
        const response = await apiClient.delete(`/api/installments/${id}`);
        return response.data;
    },

    // Category Management
    async createCategory(data: { name: string; icon: string }) {
        const response = await apiClient.post('/api/admin/categories', data);
        return response.data;
    },
    async updateCategory(id: string, data: { name?: string; icon?: string }) {
        const response = await apiClient.put(`/api/admin/categories/${id}`, data);
        return response.data;
    },
    async deleteCategory(id: string) {
        const response = await apiClient.delete(`/api/admin/categories/${id}`);
        return response.data;
    },
};

export default adminApi;
