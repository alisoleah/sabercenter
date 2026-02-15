
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Updated Inline SVG Content (Iteration 5 - User's Latest Snippet)
const categoriesToUpsert = [
    // Air Conditioners
    { name: 'Air Conditioners', icon: '<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>' },

    // Electronics
    { name: 'Electronics', icon: '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>' },

    // Fashion
    { name: 'Fashion', icon: '<path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>' },

    // Home Decor (Updated to "Picture Frame" style)
    { name: 'Home Decor', icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>' },

    // Kids Appliances & Toys (Updated to "Toy Car")
    { name: 'Kids Appliances & Toys', icon: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>' },

    // Kitchen & Dining (Updated to "Cutlery")
    { name: 'Kitchen & Dining', icon: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>' },

    // Laptops
    { name: 'Laptops', icon: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="20" x2="22" y2="20"/>' },

    // Large Appliances (Updated to "Washing Machine")
    { name: 'Large Appliances', icon: '<path d="M3 6h3"/><path d="M17 6h.01"/><rect x="3" y="2" width="18" height="20" rx="2"/><circle cx="12" cy="14" r="4"/>' },

    // Mobile Accessories
    { name: 'Mobile Accessories', icon: '<path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>' },

    // Mobiles
    { name: 'Mobiles', icon: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>' },

    // Office Utilities
    { name: 'Office Utilities', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>' },

    // Perfumes (Updated to "Glass Bottle")
    { name: 'Perfumes', icon: '<path d="M12 3v2"/><path d="M12 5a4 4 0 0 1 4 4v8a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V9a4 4 0 0 1 4-4z"/><path d="M9 9h6"/>' },

    // Personal & Health Care
    { name: 'Personal & Health Care', icon: '<path d="M3 10h18"/><path d="M4 10v2a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-2"/><path d="M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/>' },

    // Small Appliances
    { name: 'Small Appliances', icon: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>' },

    // TVs
    { name: 'TVs', icon: '<rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>' },

    // Watches
    { name: 'Watches', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
];

async function main() {
    console.log('Start seeding SVG content categories (Iteration 5)...');

    for (const cat of categoriesToUpsert) {
        const existing = await prisma.category.findFirst({ where: { name: cat.name } });

        if (existing) {
            await prisma.category.update({
                where: { id: existing.id },
                data: { icon: cat.icon },
            });
            console.log(`Updated icon for: ${cat.name}`);
        } else {
            await prisma.category.create({
                data: {
                    name: cat.name,
                    icon: cat.icon,
                },
            });
            console.log(`Created category: ${cat.name}`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
