
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const banners = await prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
    });

    console.log('Active Banners in Database:');
    console.log(JSON.stringify(banners, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
