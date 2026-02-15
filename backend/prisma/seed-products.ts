import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProducts() {
    console.log('🛍️  Starting product seeding from Products_info.txt...\n');

    // Get category IDs first
    const categories = await prisma.category.findMany();
    const categoryMap: Record<string, string> = {};

    categories.forEach(cat => {
        categoryMap[cat.name] = cat.id;
    });

    // Products data parsed from the file
    const products = [
        // PRODUCT 1: ALL BLACK AURA Watch
        {
            name: 'ALL BLACK | AURA Minimalist Analog Watch | Arabic Numerals',
            sku: 'AURA-BLACK-WATCH-001',
            brand: 'AURA',
            categoryId: categoryMap['Watches'],
            cashPrice: 200.00,
            oldPrice: null,
            stockQty: 50,
            warranty: '1 Year',
            rating: 0,
            reviewCount: 0,
            description: 'Make a bold statement with this sophisticated all-black timepiece that seamlessly blends minimalist design with contemporary style. The watch features a unique Arabic numeral dial set against a sleek black face, housed in a distinctive octagonal case that adds geometric intrigue. The integrated bracelet design flows smoothly from the case for a seamless look. The monochromatic aesthetic is perfect for both casual and formal occasions, whilst the premium construction ensures lasting durability. The watch\'s modern silhouette is complemented by its comfortable fit and secure deployment clasp. This timepiece stands as an excellent choice for those who appreciate understated luxury and contemporary design sensibilities.',
            specs: {
                'Design': 'Sleek matte black timepiece featuring minimalist Arabic numeral dial',
                'Construction': 'Stylish bracelet with integrated design',
                'Display': 'Modern monochromatic dial with seamless hands',
                'Bracelet': 'Solid fiber bracelet with secure folding clasp',
                'Movement': 'Precise quartz movement',
                'Water Resistance': 'Water-resistant construction'
            },
            badges: ['0% Interest', 'Modern Design', 'Water Resistant'],
            imageUrl: '/uploads/products/GenericWatch_1.jpg',
            images: [
                '/uploads/products/GenericWatch_1.jpg',
                '/uploads/products/GenericWatch_2.jpg'
            ]
        },

        // PRODUCT 2: Philips Shaver
        {
            name: 'Philips Shaver 1000 Series Wet & Dry Electric Shaver S1151/00',
            sku: 'PHILIPS-S1151-00',
            brand: 'Philips',
            categoryId: categoryMap['Personal & Health Care'],
            cashPrice: 2297.10,
            oldPrice: null,
            stockQty: 50,
            warranty: '2 Years',
            rating: 4.40,
            reviewCount: 3410,
            description: 'Philips Shaver 1000 Series gives you a fast, clean shave at an accessible price. The 27 self-sharpening ComfortCut blades, wet and dry use, and full washability make the shaver easy to use and provide excellent value. Features 3D Floating Heads for a comfortable shave, allowing you to shave at the sink or in the shower with complete convenience.',
            specs: {
                'Model': 'S1151/00',
                'Blades': '27 Self-sharpening ComfortCut blades',
                'Heads': '3D Floating Heads',
                'Usage': 'Wet and Dry',
                'Power Source': 'Battery Powered - Lithium-Ion',
                'Battery Life': '40 minutes',
                'Number of Blades': '3',
                'Blade Material': 'Stainless Steel',
                'Weight': '360 Grams',
                'Color': 'Blue',
                'Dimensions': '8 x 10 x 19 cm',
                'Features': 'Battery Indicator, Washable'
            },
            badges: ['0% Interest', '2 Year Warranty', 'Best Seller', 'Top Rated'],
            imageUrl: '/uploads/products/PhilipsShaver_1.jpg',
            images: [
                '/uploads/products/PhilipsShaver_1.jpg',
                '/uploads/products/PhilipsShaver_2.jpg',
                '/uploads/products/PhilipsShaver_3.jpg',
                '/uploads/products/PhilipsShaver_4.jpg'
            ]
        },

        // PRODUCT 3: Full Length Mirror
        {
            name: 'Full Length Mirror – Gold Frame – Large Floor Standing or Wall Mounted Dressing Mirror',
            sku: 'MIRROR-GOLD-170X50',
            brand: 'Generic',
            categoryId: categoryMap['Home Decor'],
            cashPrice: 2900.00,
            oldPrice: null,
            stockQty: 50,
            warranty: null,
            rating: 2.90,
            reviewCount: 4,
            description: 'Add elegance and functionality to your home with this full length mirror featuring a stylish gold frame. Designed to provide a complete head-to-toe view, it is ideal for bedrooms, living rooms, hallways, or closets. The versatile design allows it to be wall-mounted, leaned against a wall, or placed as a free-standing mirror. Crafted from durable materials with high-quality glass, this mirror combines practicality with modern décor, making it a timeless addition to any home.',
            specs: {
                'Dimensions': '170L x 50W centimeters',
                'Shape': 'Rectangular',
                'Frame Material': 'Metal',
                'Finish': 'Gold Plated',
                'Mounting Type': 'Floor Mount / Wall Mount',
                'Weight': '17 Kilograms',
                'Material': 'Glass, Metal',
                'Room Type': 'Living Room, Bedroom, Hallway, Closet',
                'Style': 'Modern, Stylish',
                'Assembly Required': 'No'
            },
            badges: ['Free Shipping', 'Elegant Design', 'Versatile'],
            imageUrl: '/uploads/products/mirror_1.jpg',
            images: [
                '/uploads/products/mirror_1.jpg'
            ]
        },

        // PRODUCT 4: Lattafa Perfume
        {
            name: 'Lattafa Asad Eau de Parfum 100ml',
            sku: 'LATTAFA-ASAD-100ML',
            brand: 'Lattafa',
            categoryId: categoryMap['Perfumes'],
            cashPrice: 1248.98,
            oldPrice: null,
            stockQty: 50,
            warranty: null,
            rating: 0,
            reviewCount: 0,
            description: 'Lattafa Asad Is A Vanilla Fragrance That Opens With Signature Fragrance With Unique Notes. The Fragrance Has Best Answer To The Other Clones And The Perfume Is For Men And Women Both. A sophisticated blend of spicy and woody notes creating an unforgettable signature scent.',
            specs: {
                'Volume': '100ml',
                'Form': 'Liquid',
                'Concentration': 'Eau de Parfum',
                'Scent': 'Amber Wood, Vanilla',
                'Gender': 'Unisex',
                'Top Notes': 'Black Pepper, Pineapple, Tobacco',
                'Heart Notes': 'Coffee, Patchouli, Iris',
                'Age Range': 'Adult',
                'Material Features': 'Travel Size'
            },
            badges: ['Unisex', 'Long Lasting', 'Signature Scent'],
            imageUrl: '/uploads/products/lattafa-asad.png',
            images: ['/uploads/products/lattafa-asad.png']
        },

        // PRODUCT 5: BLACK+DECKER Food Processor
        {
            name: 'BLACK+DECKER 800W Food Processor with Blender - 2L Bowl',
            sku: 'BD-FX822-B5',
            brand: 'BLACK+DECKER',
            categoryId: categoryMap['Kitchen & Dining'],
            cashPrice: 4124.00,
            oldPrice: null,
            stockQty: 50,
            warranty: '2 Years',
            rating: 0,
            reviewCount: 0,
            description: '800W high performance motor for smooth processing. Compact shape with contemporary style for an easier fit in a modern kitchen. Family sized 2.0L Gross/1.5L working capacity food processing bowl. 1.5L blender jar with detachable blade system for blending & pureeing tasks. 2 Speed control with Pulse function for chopping, slicing, shredding, kneading, whisking and blending versatility. Durable stainless-steel blades for chopping, mincing, etc. Dishwasher safe parts for easy cleaning.',
            specs: {
                'Model': 'FX822-B5',
                'Power': '800 watts',
                'Bowl Capacity': '2 Liters (1.5L working)',
                'Blender Jar': '1.5L',
                'Speeds': '2 Speed + Pulse',
                'Material': 'Stainless Steel',
                'Blade Material': 'Stainless Steel',
                'Color': 'Red',
                'Weight': '2.94 Kilograms',
                'Dimensions': '22.5D x 23.5W x 36.5H cm',
                'Voltage': '240 Volts',
                'Features': 'Safety Lock, Dishwasher Safe',
                'Includes': 'Chopping Blade, Slicing/Shredding Disc, Dough Blade, Emulsifying Disc, Measuring Cup'
            },
            badges: ['0% Interest', 'Family Size', 'Dishwasher Safe', 'Multi-Function'],
            imageUrl: '/uploads/products/Black&Decker_1.jpg',
            images: [
                '/uploads/products/Black&Decker_1.jpg',
                '/uploads/products/Black&Decker_2.jpg',
                '/uploads/products/Black&Decker_3.jpg',
                '/uploads/products/Black&Decker_4.jpg'
            ]
        },

        // PRODUCT 6: Anker Charger
        {
            name: 'Anker Zolo 1C Wall Charger Type-C 30W Fast Charging - Black',
            sku: 'ANKER-A2698L11',
            brand: 'Anker',
            categoryId: categoryMap['Mobile Accessories'],
            cashPrice: 519.00,
            oldPrice: null,
            stockQty: 50,
            warranty: '18 Months',
            rating: 4.50,
            reviewCount: 389,
            description: 'High-speed charging with a USB-C power port and a maximum power of 30W. Charge smartphones, tablets, etc., at a speed three times the speed of the original charger. Exceptional temperature control maintaining 13°C less than standard. With innovative stacked technology, it is 25% smaller than the original. GaN II Technology makes our latest charger smaller without sacrificing power. Includes 1.8m USB-C cable.',
            specs: {
                'Model': 'A2698L11',
                'Power': '30 watts',
                'Connector Type': 'USB Type C',
                'Technology': 'GaN II',
                'Input Voltage': '120 Volts',
                'Output Current': '1 Amps',
                'Amperage': '16 Amps',
                'Cable Included': '1.8m USB-C Cable',
                'Color': 'Black',
                'Weight': '30 Grams',
                'Compatible Devices': 'iPhone, iPad, Samsung, Pixel, Tablets',
                'Compatible Models': 'iPhone 13, Samsung Galaxy S21',
                'Features': 'Fast Charging, Temperature Control, Portable',
                'Power Plug': 'Type C, Type G'
            },
            badges: ['0% Interest', 'Best Seller', '#1 in Chargers', 'Fast Charging', 'GaN Technology'],
            imageUrl: '/uploads/products/Charger_1.jpg',
            images: [
                '/uploads/products/Charger_1.jpg',
                '/uploads/products/Charger_2.jpg',
                '/uploads/products/Charger_3.jpg',
                '/uploads/products/Charger_4.jpg'
            ]
        }
    ];

    // Insert products
    let successCount = 0;
    let errorCount = 0;

    for (const productData of products) {
        try {
            const product = await prisma.product.create({
                data: productData as any
            });
            console.log(`✅ Created: ${product.name}`);
            console.log(`   SKU: ${product.sku} | Price: ${product.cashPrice} EGP`);
            console.log(`   Images: ${(productData.images as string[]).length} image(s)\n`);
            successCount++;
        } catch (error: any) {
            console.error(`❌ Failed to create product: ${productData.name}`);
            console.error(`   Error: ${error.message}\n`);
            errorCount++;
        }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully created: ${successCount} products`);
    console.log(`   ❌ Failed: ${errorCount} products`);
    console.log(`   📦 Total: ${products.length} products\n`);
}

async function main() {
    try {
        await seedProducts();
    } catch (error) {
        console.error('❌ Error during product seeding:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
