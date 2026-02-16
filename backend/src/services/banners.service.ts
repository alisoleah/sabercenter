import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BannersService {
    /**
     * Get active banners for public display (homepage carousel)
     * Filters by isActive=true and optional date range
     * Orders by sortOrder ascending
     */
    async getActiveBanners() {
        const now = new Date();

        const banners = await prisma.banner.findMany({
            where: {
                isActive: true,
                OR: [
                    { startDate: null, endDate: null }, // No date restrictions
                    { startDate: { lte: now }, endDate: { gte: now } }, // Within date range
                    { startDate: { lte: now }, endDate: null }, // Started, no end
                    { startDate: null, endDate: { gte: now } }, // No start, not ended
                ],
            },
            orderBy: {
                sortOrder: 'asc',
            },
        });

        // Transform image URLs to include backend URL only if relative
        return banners.map(banner => ({
            ...banner,
            imageUrl: banner.imageUrl.startsWith('http')
                ? banner.imageUrl
                : `${process.env.BACKEND_URL || 'http://localhost:3000'}${banner.imageUrl}`,
        }));
    }

    /**
     * Get all banners (admin only)
     */
    async getAllBanners() {
        return await prisma.banner.findMany({
            orderBy: {
                sortOrder: 'asc',
            },
        });
    }

    /**
     * Get banner by ID
     */
    async getBannerById(id: string) {
        return await prisma.banner.findUnique({
            where: { id },
        });
    }

    /**
     * Create new banner
     */
    async createBanner(data: {
        title: string;
        subtitle: string;
        ctaText: string;
        ctaLink?: string;
        imageUrl: string;
        bgGradient?: string;
        isActive?: boolean;
        sortOrder?: number;
        startDate?: Date;
        endDate?: Date;
    }) {
        return await prisma.banner.create({
            data,
        });
    }

    /**
     * Update existing banner
     */
    async updateBanner(
        id: string,
        data: {
            title?: string;
            subtitle?: string;
            ctaText?: string;
            ctaLink?: string;
            imageUrl?: string;
            bgGradient?: string;
            isActive?: boolean;
            sortOrder?: number;
            startDate?: Date;
            endDate?: Date;
        }
    ) {
        return await prisma.banner.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete banner
     */
    async deleteBanner(id: string) {
        return await prisma.banner.delete({
            where: { id },
        });
    }

    /**
     * Update banner sort orders (for drag-and-drop reordering)
     */
    async updateBannerOrders(bannerOrders: { id: string; sortOrder: number }[]) {
        const updatePromises = bannerOrders.map(({ id, sortOrder }) =>
            prisma.banner.update({
                where: { id },
                data: { sortOrder },
            })
        );

        return await Promise.all(updatePromises);
    }
}

export const bannersService = new BannersService();
