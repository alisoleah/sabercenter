
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        take: 5,
        select: {
            name: true,
            imageUrl: true,
            images: true,
        },
    });

    console.log('--- Product Image URLs ---');
    products.forEach(p => {
        console.log(`Product: ${p.name}`);
        console.log(`Main Image: ${p.imageUrl}`);
        console.log(`Images: ${JSON.stringify(p.images)}`);
        console.log('---');
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
