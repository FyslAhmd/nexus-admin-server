import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { User } from '../models';
import { UserRole, UserStatus } from '../types';

const ADMIN_EMAIL = 'info.faysal.32@gmail.com';
const ADMIN_PASSWORD = 'Ahmed@3632';
const ADMIN_NAME = 'System Admin';

const seedDatabase = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Skipping seed.');
      console.log(`   Email: ${ADMIN_EMAIL}`);
    } else {
      // Create admin user
      const admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      });

      console.log('✅ Admin user created successfully!');
      console.log('');
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║                    Admin Credentials                      ║');
      console.log('╠═══════════════════════════════════════════════════════════╣');
      console.log(`║  Email:    ${ADMIN_EMAIL.padEnd(45)}║`);
      console.log(`║  Password: ${'*'.repeat(ADMIN_PASSWORD.length).padEnd(45)}║`);
      console.log(`║  Role:     ${UserRole.ADMIN.padEnd(45)}║`);
      console.log('╚═══════════════════════════════════════════════════════════╝');
      console.log('');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
