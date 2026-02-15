import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const banners = [
    {
        title: 'Flash Sale: Up to 40% Off!',
        subtitle: 'Limited time offers on top brands',
        ctaText: 'Shop Now',
        ctaLink: '/products',
        imageUrl: 'https://images.unsplash.com/photo-1741061963569-9d0ef54d10d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920',
        bgGradient: 'from-[#003366] to-[#004488]',
        isActive: true,
        sortOrder: 0,
    },
    {
        title: 'Pay in Installments - 0% Interest',
        subtitle: 'Buy now, pay later with our MiniCash program',
        ctaText: 'Learn More',
        ctaLink: '/installments',
        imageUrl: 'https://images.unsplash.com/photo-1758488438758-5e2eedf769ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920',
        bgGradient: 'from-[#FF6600] to-[#FF8833]',
        isActive: true,
        sortOrder: 1,
    },
    {
        title: 'New Arrivals: Latest Tech',
        subtitle: 'Discover the newest smartphones and laptops',
        ctaText: 'Explore',
        ctaLink: '/products',
        imageUrl: 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920',
        bgGradient: 'from-[#1A1A1A] to-[#333333]',
        isActive: true,
        sortOrder: 2,
    },
];

async function seedBanners() {
    console.log('🎯 Seeding banners...');

    try {
        // Delete existing banners
        await prisma.banner.deleteMany({});
        console.log('Deleted existing banners');

        // Create new banners
        for (const banner of banners) {
            await prisma.banner.create({
                data: banner,
            });
            console.log(`✅ Created banner: ${banner.title}`);
        }

        console.log('🎉 Banner seeding completed!');
    } catch (error) {
        console.error('❌ Error seeding banners:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedBanners();
