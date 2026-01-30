import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/preplacement_portal';

async function resetPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'preplacement_portal'
    });

    console.log('Connected to MongoDB');

    // Find and update MU user
    const muUser = await User.findOne({ username: 'MU', userType: 'admin' });
    
    if (!muUser) {
      console.log('MU user not found. Creating new admin user...');
      const passwordHash = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'MU',
        email: 'mu@example.com',
        passwordHash,
        userType: 'admin',
        name: 'MU Admin'
      });
      console.log('✅ Created new MU admin user with password: admin123');
    } else {
      console.log('Found MU user, updating password...');
      const newPasswordHash = await bcrypt.hash('admin123', 10);
      muUser.passwordHash = newPasswordHash;
      await muUser.save();
      console.log('✅ Updated MU user password to: admin123');
    }

    // Also ensure admin user exists
    const adminUser = await User.findOne({ username: 'admin', userType: 'admin' });
    if (!adminUser) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        passwordHash,
        userType: 'admin',
        name: 'Admin User'
      });
      console.log('✅ Created admin user with password: admin123');
    } else {
      console.log('admin user already exists');
    }

    console.log('\n🔐 Login Credentials:');
    console.log('Username: MU');
    console.log('Password: admin123');
    console.log('User Type: Admin');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

resetPassword();
