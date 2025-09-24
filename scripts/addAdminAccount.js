import bcrypt from 'bcrypt';
import prisma from '../prisma/client.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function addAdminAccount() {
  try {
    console.log('Creating admin account...');

    const email = await question('admin@gmail.com');
    const name = await question('admin');
    const phone = await question('0987654321');
    const password = await question('Admin@123');

    if (!email || !name || !phone || !password) {
      console.log('All fields are required.');
      rl.close();
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('User with this email already exists.');
      rl.close();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log(`Admin account created successfully! User ID: ${adminUser.id}`);
  } catch (error) {
    console.error('Error creating admin account:', error);
  } finally {
    rl.close();
  }
}

addAdminAccount();
