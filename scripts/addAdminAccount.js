import bcrypt from 'bcrypt';
import prisma from '../prisma/client.js';

async function addAdminAccount() {
  try {
    console.log('Creating admin account...');

    // Use default values
    const name = 'admin';
    const phone = '0987654321';
    const password = 'Admin@123';
    const birthDate = new Date();
    const sex = 'Male';
    const country = 'Saudi Arabia';
    const countryCode = '+966';
    const isVerified = true;
    const isActive = true;
    const expiresAt = null;
    const avatarUrl = null;
    const role = 'ADMIN';
    const createdAt = new Date();
    const updatedAt = new Date();



    if (!name || !phone || !password) {
      console.log('All fields are required.');
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name,
        phone,
        passwordHash,
        role,
        isActive,
        birthDate,
        sex,
        country,
        countryCode,
        isVerified,
        expiresAt,
        avatarUrl,
        createdAt,
        updatedAt
      }
    });

    console.log(`Admin account created successfully! User ID: ${adminUser.id}`);
  } catch (error) {
    console.error('Error creating admin account:', error);
  }
}

addAdminAccount();
