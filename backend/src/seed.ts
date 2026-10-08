import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User';
import { connectDB } from './config/database';

dotenv.config();

async function seed() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected to MongoDB.');

    try {
      await User.collection.dropIndex('mobile_1');
      console.log('Dropped legacy mobile index.');
    } catch (e) {
      // Ignore if index doesn't exist
    }

    const demoAccounts: Array<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      passwordPlain: string;
      role: "SUPER_ADMIN" | "ADMIN" | "USER";
      status: "ACTIVE" | "DISABLED";
    }> = [
      {
        firstName: 'System',
        lastName: 'Administrator',
        email: 'superadmin@demo.com',
        phone: '+919000000001',
        passwordPlain: 'SuperAdmin@123',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE'
      },
      {
        firstName: 'Blood',
        lastName: 'Manager',
        email: 'admin@demo.com',
        phone: '+919000000002',
        passwordPlain: 'Admin@123',
        role: 'ADMIN',
        status: 'ACTIVE'
      },
      {
        firstName: 'Demo',
        lastName: 'User',
        email: 'user@demo.com',
        phone: '+919000000003',
        passwordPlain: 'User@123',
        role: 'USER',
        status: 'ACTIVE'
      }
    ];

    for (const acc of demoAccounts) {
      const emailNormal = acc.email.trim().toLowerCase();
      
      const passwordHash = await bcrypt.hash(acc.passwordPlain, 10);
      
      console.log(`Ensuring ${acc.role} exists and password is set...`);
      await User.findOneAndUpdate(
        { email: emailNormal },
        {
          $set: {
            firstName: acc.firstName,
            lastName: acc.lastName,
            email: emailNormal,
            phone: acc.phone,
            passwordHash: passwordHash,
            role: acc.role,
            status: acc.status,
          }
        },
        { upsert: true, new: true }
      );
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
