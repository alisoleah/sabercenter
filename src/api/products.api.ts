import apiClient from './client';
import { Product } from '../types';

interface GetProductsParams {
    categoryId?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    inStock?: boolean;
    page?: number;
    limit?: number;
}

interface ProductsResponse {
    products: Product[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface Category {
    id: string;
    name: string;
    icon: string;
    productCount?: number;
}

export const productsApi = {
    /**
     * Get products with optional filtering
     */
    async getProducts(params?: GetProductsParams) {
        const response = await apiClient.get<{ success: boolean; data: ProductsResponse }>('/api/products', { params });
        return response.data;
    },

    /**
     * Get featured products
     */
    async getFeaturedProducts(limit = 8) {
        const response = await apiClient.get<{ success: boolean; data: Product[] }>('/api/products/featured', {
            params: { limit },
        });
        return response.data;
    },

    /**
     * Search products
     */
    async searchProducts(query: string, limit = 10) {
        const response = await apiClient.get<{ success: boolean; data: Product[] }>('/api/products/search', {
            params: { q: query, limit },
        });
        return response.data;
    },

    /**
     * Get product by ID
     */
    async getProductById(id: string) {
        const response = await apiClient.get<{ success: boolean; data: Product }>(`/api/products/${id}`);
        return response.data;
    },

    /**
     * Get products by monthly budget
     */
    async getProductsByBudget(monthlyBudget: number, duration = 24, limit = 20) {
        const response = await apiClient.get<{
            success: boolean;
            data: {
                monthlyBudget: number;
                durationMonths: number;
                maxProductPrice: number;
                products: Product[];
            };
        }>(`/api/products/budget/${monthlyBudget}`, {
            params: { duration, limit },
        });
        return response.data;
    },

    /**
     * Get all categories
     */
    async getCategories() {
        const response = await apiClient.get<{ success: boolean; data: Category[] }>('/api/products/categories');
        return response.data;
    },

    /**
     * Get category with products
     */
    async getCategoryById(id: string) {
        const response = await apiClient.get<{
            success: boolean;
            data: Category & { products: Product[] };
        }>(`/api/products/categories/${id}`);
        return response.data;
    },
    /**
     * Create Product (Admin)
     */
    async createProduct(data: any) {
        const response = await apiClient.post<{ success: boolean; data: Product }>('/api/products', data);
        return response.data;
    },

    /**
     * Update Product (Admin)
     */
    async updateProduct(id: string, data: any) {
        const response = await apiClient.put<{ success: boolean; data: Product }>(`/api/products/${id}`, data);
        return response.data;
    },

    /**
     * Delete Product (Admin)
     */
    async deleteProduct(id: string) {
        const response = await apiClient.delete<{ success: boolean; message: string }>(`/api/products/${id}`);
        return response.data;
    },
};
