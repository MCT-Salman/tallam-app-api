import bcrypt from 'bcrypt';
import { hashPassword} from "../utils/hash.js";
import prisma from '../prisma/client.js';
import { UserModel } from '../models/index.js';

async function addAdminAccount() {
  try {
    console.log('Creating admin account...');

    // Use default values
    const name = 'admin';
    const phone = '0987654322';
    const password = 'Admin@123';
    const birthDate = new Date();
    const sex = 'Male';
    const country = 'Saudi Arabia';
    const countryCode = '+966';
    const role = 'ADMIN';



    if (!name || !phone || !password) {
      console.log('All fields are required.');
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create admin user
     const user = await UserModel.createUser({
         phone,
         passwordHash,
         name,
         sex,
         birthDate,
         avatarUrl:null,
         country,
         countryCode,
        role,
         isVerified: true,
         isActive: true
       });

    console.log(`Admin account created successfully! User ID: ${user.id}`);
  } catch (error) {
    console.error('Error creating admin account:', error);
  }
}

addAdminAccount();
