import apiClient from './client';
import { Order } from '../types';

interface CreateOrderData {
    items: {
        productId: string;
        quantity: number;
        installmentPlanId?: string;
    }[];
    deliveryMethod: 'pickup' | 'delivery';
    storeId?: string;
    address?: {
        street: string;
        city: string;
        governorate: string;
        postalCode?: string;
    };
    paymentMethod: 'cash' | 'card' | 'installment';
}

interface OrderResponse {
    success: boolean;
    message?: string;
    data: Order;
}

interface OrdersResponse {
    success: boolean;
    data: {
        orders: Order[];
        pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export const ordersApi = {
    /**
     * Create new order
     */
    async createOrder(data: CreateOrderData): Promise<OrderResponse> {
        const response = await apiClient.post<OrderResponse>('/api/orders', data);
        return response.data;
    },

    /**
     * Get current user's orders
     */
    async getMyOrders(params?: { page?: number; limit?: number }): Promise<OrdersResponse> {
        const response = await apiClient.get<OrdersResponse>('/api/orders', { params });
        return response.data;
    },

    /**
     * Get single order by ID
     */
    async getOrderById(id: string): Promise<OrderResponse> {
        const response = await apiClient.get<OrderResponse>(`/api/orders/${id}`);
        return response.data;
    },
};
