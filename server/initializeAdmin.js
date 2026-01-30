import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/preplacement_portal';

async function initializeAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 URI:', MONGO_URI);

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin', userType: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Admin user "admin" already exists');
      console.log('Admin details:', {
        username: existingAdmin.username,
        email: existingAdmin.email,
        userType: existingAdmin.userType,
        createdAt: existingAdmin.createdAt
      });
    } else {
      // Create admin user
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      const admin = new User({
        username: 'admin',
        email: 'admin@preplacement.com',
        passwordHash,
        userType: 'admin',
        name: 'Administrator'
      });

      await admin.save();
      console.log('✅ Admin user created successfully');
      console.log('Admin details:', {
        username: admin.username,
        email: admin.email,
        userType: admin.userType,
        _id: admin._id
      });
    }

    // Also check for "MU" admin
    const muAdmin = await User.findOne({ username: 'MU', userType: 'admin' });
    if (muAdmin) {
      console.log('⚠️ Admin user "MU" already exists');
    } else {
      // Create MU admin
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      const muAdminUser = new User({
        username: 'MU',
        email: 'mu@preplacement.com',
        passwordHash,
        userType: 'admin',
        name: 'MU Administrator'
      });

      await muAdminUser.save();
      console.log('✅ Admin user "MU" created successfully');
      console.log('Admin details:', {
        username: muAdminUser.username,
        email: muAdminUser.email,
        userType: muAdminUser.userType,
        _id: muAdminUser._id
      });
    }

    // List all users
    const allUsers = await User.find({}, { username: 1, userType: 1, email: 1, _id: 1 });
    console.log('\n📋 All users in database:');
    console.table(allUsers);

    console.log('\n✨ Initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during initialization:', err);
    process.exit(1);
  }
}

initializeAdmin();
