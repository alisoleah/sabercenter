
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// Candidates
const CANDIDATES = [
    {
        role: 'Flash Sale (Watch)',
        id: 'c29d74ae-6773-4701-af5b-e2c284ad6c3e',
        // Currently working:
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1920&q=80'
    },
    {
        role: 'Installments (Payment)',
        id: '40dad118-8554-4e9a-b050-99f320a61c5b',
        // New Candidate 1
        url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1920&q=80'
    },
    {
        role: 'New Arrivals (Tech)',
        id: '07f8b1c6-7fa8-4ea2-a568-4c26634b0ee4',
        // New Candidate 2
        url: 'https://images.unsplash.com/photo-1531297461136-82lw8?auto=format&fit=crop&w=1920&q=80'
        // Actually let's use a simpler known one:
        // url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&w=1920&q=80' (Macbook)
    }
];

// Fallback list if first candidates fail
const BACKUPS = [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1920&q=80', // Laptop
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1920&q=80', // Shopping
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1920&q=80' // Electronics
];

async function checkUrl(url: string) {
    try {
        const res = await axios.head(url);
        return res.status === 200;
    } catch (e) {
        return false;
    }
}

async function main() {
    console.log('Verifying and Fixing banners...');

    for (const item of CANDIDATES) {
        console.log(`Checking ${item.role}...`);
        let validUrl = item.url;
        let valid = await checkUrl(validUrl);

        if (!valid) {
            console.warn(`Primary URL for ${item.role} failed. Trying backups...`);
            for (const backup of BACKUPS) {
                if (await checkUrl(backup)) {
                    validUrl = backup;
                    valid = true;
                    console.log(`Found working backup: ${validUrl}`);
                    break;
                }
            }
        }

        if (valid) {
            await prisma.banner.update({
                where: { id: item.id },
                data: { imageUrl: validUrl }
            });
            console.log(`Updated ${item.role} with valid URL.`);
        } else {
            console.error(`Could not find ANY valid URL for ${item.role}!`);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
