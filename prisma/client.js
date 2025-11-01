/*import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
*/
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['warn', 'error'],
  });

process.on('beforeExit', async () => {
  console.log('process beforeExit — reconnecting Prisma...');
  try {
    await prisma.$connect();
  } catch (err) {
    console.error('❌ Error reconnecting Prisma:', err);
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
