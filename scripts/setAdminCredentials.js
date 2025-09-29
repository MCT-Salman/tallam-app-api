import { config } from 'dotenv';
import prisma from '../prisma/client.js';
import { hashPassword } from '../utils/hash.js';

config();

/**
 * Usage examples:
 *   node scripts/setAdminCredentials.js --userId=1 --username=admin --email=admin@example.com --password=StrongPass123
 *   node scripts/setAdminCredentials.js --phone=0987654323 --username=admin --email=admin@example.com --password=StrongPass123
 */
async function main() {
  const args = Object.fromEntries(process.argv.slice(2).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v];
  }));

  const { userId, phone, username, email, password } = args;
  if ((!userId && !phone) || !username || !email || !password) {
    console.error('Missing args. Provide --userId or --phone, and --username, --email, --password');
    process.exit(1);
  }

  const user = userId
    ? await prisma.user.findUnique({ where: { id: Number(userId) } })
    : await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    console.error('User not found');
    process.exit(1);
  }

  if (!['ADMIN', 'SUBADMIN'].includes(user.role)) {
    console.error('User is not ADMIN/SUBADMIN');
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  // Upsert Admin row
  const admin = await prisma.admin.upsert({
    where: {
      // Use a composite unique workaround via unique email if exists
      // We have unique on email; try find by userId first
      // But Prisma requires a unique field in where, so we lookup first
      // We'll do manual flow:
    },
    update: {},
    create: { userId: user.id, username, email, passwordHash }
  }).catch(async () => {
    // Fallback: check if admin exists by userId
    const existing = await prisma.admin.findFirst({ where: { userId: user.id } });
    if (existing) {
      return prisma.admin.update({
        where: { id: existing.id },
        data: { username, email, passwordHash }
      });
    }
    // Otherwise create new
    return prisma.admin.create({ data: { userId: user.id, username, email, passwordHash } });
  });

  console.log('Admin credentials set:', { id: admin.id, username: admin.username, email: admin.email });
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
