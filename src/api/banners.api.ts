import apiClient from './client';

export interface Banner {
    id: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink?: string | null;
    imageUrl: string;
    bgGradient: string;
    isActive: boolean;
    sortOrder: number;
    startDate?: Date | null;
    endDate?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export const bannersApi = {
    /**
     * Get active banners for homepage carousel (public)
     */
    async getActiveBanners(): Promise<Banner[]> {
        const response = await apiClient.get('/api/banners');
        return response.data.data;
    },

    /**
     * Get all banners (admin only)
     */
    async getAllBanners(): Promise<Banner[]> {
        const response = await apiClient.get('/api/banners/admin');
        return response.data.data;
    },

    /**
     * Create new banner (admin only)
     */
    async createBanner(formData: FormData): Promise<Banner> {
        const response = await apiClient.post('/api/banners', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    /**
     * Update existing banner (admin only)
     */
    async updateBanner(id: string, formData: FormData): Promise<Banner> {
        const response = await apiClient.put(`/api/banners/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    /**
     * Delete banner (admin only)
     */
    async deleteBanner(id: string): Promise<void> {
        await apiClient.delete(`/api/banners/${id}`);
    },

    /**
     * Reorder banners (admin only)
     */
    async reorderBanners(bannerOrders: { id: string; sortOrder: number }[]): Promise<void> {
        await apiClient.put('/api/banners/reorder', { bannerOrders });
    },
};
