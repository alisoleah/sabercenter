
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany();

    for (const product of products) {
        let needsUpdate = false;
        let newImageUrl = product.imageUrl;
        let newImages = product.images as string[];

        // Fix Main Image
        if (newImageUrl && newImageUrl.includes('localhost:3003')) {
            newImageUrl = newImageUrl.replace('localhost:3003', 'localhost:3000');
            needsUpdate = true;
        }

        // Fix Images Array
        if (Array.isArray(newImages)) {
            const updatedImages = newImages.map(img => {
                if (img.includes('localhost:3003')) {
                    needsUpdate = true;
                    return img.replace('localhost:3003', 'localhost:3000');
                }
                return img;
            });
            newImages = updatedImages;
        }

        if (needsUpdate) {
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    imageUrl: newImageUrl,
                    images: newImages,
                },
            });
            console.log(`Updated product: ${product.name}`);
        }
    }

    console.log('Done fixing URLs');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
