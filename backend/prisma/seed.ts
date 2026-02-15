import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { encrypt } from '../src/utils/encryption';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...\n');

    // ==========================================
    // 1. CATEGORIES
    // ==========================================
    console.log('📦 Creating categories...');

    const categories = [
        { name: 'Personal & Health Care', icon: '🧴' },
        { name: 'Perfumes', icon: '🌸' },
        { name: 'Watches', icon: '⌚' },
        { name: 'Fashion', icon: '👗' },
        { name: 'Home Decor', icon: '🏠', nameAr: 'ديكور المنزل' },
        { name: 'Kitchen & Dining', icon: '🍳', nameAr: 'المطبخ والطعام' },
        { name: 'Mobile Accessories', icon: '📱' },
        { name: 'Kids Appliances & Toys', icon: '🧸' },
        { name: 'Office Utilities', icon: '📎' },
        { name: 'Electronics', icon: '💻' },
    ];

    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: { icon: category.icon },
            create: {
                name: category.name,
                icon: category.icon,
                productCount: 0,
            },
        });
        console.log(`✅ Category: ${category.name} ${category.icon}`);
    }

    // ==========================================
    // 2. INSTALLMENT PLANS
    // ==========================================
    console.log('\n💳 Creating installment plans...');

    const installmentPlans = [
        {
            name: 'Zero Interest - 6 Months',
            durationMonths: 6,
            interestRate: 0,
            minDownPayment: 15,
            isActive: true,
        },
        {
            name: 'Zero Interest - 12 Months',
            durationMonths: 12,
            interestRate: 0,
            minDownPayment: 20,
            isActive: true,
        },
        {
            name: 'Standard - 18 Months',
            durationMonths: 18,
            interestRate: 12,
            minDownPayment: 15,
            isActive: true,
        },
        {
            name: 'Extended - 24 Months',
            durationMonths: 24,
            interestRate: 15,
            minDownPayment: 20,
            isActive: true,
        },
    ];

    for (const plan of installmentPlans) {
        await prisma.installmentPlan.create({
            data: plan,
        });
        console.log(`✅ Plan: ${plan.name} (${plan.durationMonths} months, ${plan.interestRate}% interest)`);
    }

    // ==========================================
    // 3. MARKETPLACE CHANNELS
    // ==========================================
    console.log('\n🌐 Creating marketplace channels...');

    const channels = [
        {
            name: 'SaberStore',
            code: 'saberstore',
            isActive: true,
        },
        {
            name: 'Amazon Egypt',
            code: 'amazon',
            isActive: true,
        },
        {
            name: 'Noon Egypt',
            code: 'noon',
            isActive: false, // Will be activated later
        },
        {
            name: 'Instagram Shopping',
            code: 'instagram',
            isActive: false, // Will be activated later
        },
    ];

    for (const channel of channels) {
        await prisma.marketplaceChannel.upsert({
            where: { code: channel.code },
            update: { isActive: channel.isActive },
            create: channel,
        });
        console.log(`✅ Channel: ${channel.name} (${channel.isActive ? 'Active' : 'Inactive'})`);
    }

    // ==========================================
    // 4. ADMIN USER
    // ==========================================
    console.log('\n👤 Creating admin user...');

    const adminPassword = await hash('Admin@123456', 10);

    const adminUser = await prisma.user.upsert({
        where: { phoneNumber: '01000000000' },
        update: {},
        create: {
            fullName: 'Admin User',
            phoneNumber: '01000000000',
            email: 'admin@saberstore.com',
            passwordHash: adminPassword,
            isVerified: true,
            role: 'ADMIN',
            governorate: 'Cairo',
        },
    });

    console.log(`✅ Admin created: ${adminUser.email} (Phone: ${adminUser.phoneNumber})`);
    console.log(`   📝 Password: Admin@123456`);

    // ==========================================
    // 5. TEST CUSTOMER WITH KYC
    // ==========================================
    console.log('\n👥 Creating test customer...');

    const customerPassword = await hash('Test@123456', 10);

    const customer = await prisma.user.upsert({
        where: { phoneNumber: '01012345678' },
        update: {},
        create: {
            fullName: 'Ahmed Test Customer',
            phoneNumber: '01012345678',
            email: 'ahmed@example.com',
            passwordHash: customerPassword,
            isVerified: false,
            role: 'customer',
            governorate: 'Cairo',
        },
    });

    console.log(`✅ Customer created: ${customer.email} (Phone: ${customer.phoneNumber})`);
    console.log(`   📝 Password: Test@123456`);

    // Create pending KYC for test customer
    const encryptedNationalId = encrypt('12345678901234');

    await prisma.profile.upsert({
        where: { userId: customer.id },
        update: {},
        create: {
            userId: customer.id,
            nationalId: encryptedNationalId,
            monthlySalary: 10000,
            employer: 'Test Company Ltd.',
            address: '123 Test Street, Cairo, Egypt',
            kycStatus: 'Pending',
            kycSubmittedAt: new Date(),
        },
    });

    console.log('✅ Pending KYC application created for test customer');

    // ==========================================
    // 6. STORE BRANCHES
    // ==========================================
    console.log('\n🏢 Creating store branches...');

    const branches = [
        {
            name: 'SaberStore Cairo - Nasr City',
            city: 'Cairo',
            address: 'Abbas El-Akkad Street, Nasr City, Cairo',
            phone: '0221234567',
            workingHours: 'Sat-Thu: 10AM-10PM, Fri: 2PM-10PM',
            hasStock: true,
            isActive: true,
        },
        {
            name: 'SaberStore Giza - Mall of Arabia',
            city: 'Giza',
            address: 'Mall of Arabia, 6th of October City, Giza',
            phone: '0233456789',
            workingHours: 'Daily: 10AM-12AM',
            hasStock: true,
            isActive: true,
        },
        {
            name: 'SaberStore Alexandria - San Stefano',
            city: 'Alexandria',
            address: 'San Stefano Grand Plaza, Alexandria',
            phone: '0335678901',
            workingHours: 'Daily: 10AM-11PM',
            hasStock: true,
            isActive: true,
        },
    ];

    for (const branch of branches) {
        await prisma.storeBranch.create({
            data: branch,
        });
        console.log(`✅ Branch: ${branch.name}`);
    }

    console.log('\n✨ Database seeding completed successfully!\n');

    console.log('📋 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Installment Plans: ${installmentPlans.length}`);
    console.log(`   - Marketplace Channels: ${channels.length}`);
    console.log(`   - Store Branches: ${branches.length}`);
    console.log(`   - Test Users: 2 (1 admin, 1 customer)`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: 01000000000 / Admin@123456');
    console.log('   Customer: 01012345678 / Test@123456\n');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:');
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
