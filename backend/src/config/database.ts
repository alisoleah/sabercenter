import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Test database connection
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to Supabase PostgreSQL database');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
}

// Disconnect on shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
