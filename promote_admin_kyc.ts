
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.user.update({
    where: { id: '' },
    data: { role: 'admin' }
  });
  console.log('Promoted to admin');
}
main().finally(() => prisma.$disconnect());
