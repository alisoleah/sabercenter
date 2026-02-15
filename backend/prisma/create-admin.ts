import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        const password = 'Admin@2026!Secure';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if admin user already exists by phone
        const existingUser = await prisma.user.findUnique({
            where: { phoneNumber: '01000000001' },
        });

        let admin;
        if (existingUser) {
            // Update existing user to admin role
            admin = await prisma.user.update({
                where: { phoneNumber: '01000000001' },
                data: {
                    role: 'admin',
                    fullName: 'System Administrator',
                    passwordHash: hashedPassword, // Update password
                },
            });
            console.log('✅ Existing user updated to admin role!');
        } else {
            // Create new admin user with unique email
            admin = await prisma.user.create({
                data: {
                    fullName: 'System Administrator',
                    phoneNumber: '01000000001',
                    email: `admin.${Date.now()}@saberstore.com`, // Unique email
                    passwordHash: hashedPassword,
                    isVerified: true,
                    governorate: 'Cairo',
                    role: 'admin',
                },
            });
            console.log('✅ New admin user created!');
        }

        console.log('');
        console.log('===========================================');
        console.log('   ADMIN LOGIN CREDENTIALS');
        console.log('===========================================');
        console.log('   Login with:  01000000001');
        console.log('   Password:    Admin@2026!Secure');
        console.log('   Role:        admin');
        console.log('===========================================');
        console.log('');
        console.log(`✓ Name: ${admin.fullName}`);
        console.log(`✓ Email: ${admin.email}`);
        console.log(`✓ Role: ${admin.role}`);
        console.log('');
        console.log('You can now login as admin using phone: 01000000001');

    } catch (error) {
        console.error('❌ Error with admin user:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser();
