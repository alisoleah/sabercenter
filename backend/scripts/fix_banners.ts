
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Reliable Unsplash URLs
const NEW_BANNERS = [
    {
        id: 'c29d74ae-6773-4701-af5b-e2c284ad6c3e',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1920&q=80' // Watch/Tech Clean
    },
    {
        id: '40dad118-8554-4e9a-b050-99f320a61c5b',
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=1920&q=80' // Payment/Card/Shopping
    },
    {
        id: '07f8b1c6-7fa8-4ea2-a568-4c26634b0ee4',
        imageUrl: 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?auto=format&fit=crop&w=1920&q=80' // Laptop/Tech
    }
];

async function main() {
    console.log('Fixing banner URLs...');

    for (const b of NEW_BANNERS) {
        const exists = await prisma.banner.findUnique({ where: { id: b.id } });
        if (exists) {
            await prisma.banner.update({
                where: { id: b.id },
                data: { imageUrl: b.imageUrl },
            });
            console.log(`Updated banner ${b.id}`);
        } else {
            // Fallback: Use title to find if ID mismatch
            console.log(`Banner ID ${b.id} not found, skipping specific update.`);
        }
    }

    // Also fix ANY other banner with "unsplash.com/photo-17" because those seem generated/broken
    const badBanners = await prisma.banner.findMany({
        where: {
            imageUrl: { contains: 'photo-17' }
        }
    });

    for (const bb of badBanners) {
        if (!NEW_BANNERS.find(n => n.id === bb.id)) {
            // Provide a generic tech fallback
            await prisma.banner.update({
                where: { id: bb.id },
                data: { imageUrl: 'https://images.unsplash.com/photo-1526406915894-7bcd1ef788e6?auto=format&fit=crop&w=1920&q=80' }
            });
            console.log(`Fixed bad URL for banner ${bb.title}`);
        }
    }

    console.log('Banner fix complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
