import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/preplacement_portal';

async function removeStudentOne() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    console.log('✅ Connected to MongoDB');

    // Find the student to delete
    const student = await User.findOne({ 
      email: 'student1@example.com',
      userType: 'student'
    });

    if (!student) {
      console.log('⚠️ Student "student1@example.com" not found in database');
    } else {
      console.log('Found student to delete:', {
        id: student._id,
        username: student.username,
        email: student.email,
        name: student.name
      });

      // Delete the student
      await User.deleteOne({ _id: student._id });
      console.log('✅ Student "Student One" (student1@example.com) deleted successfully');
    }

    // Get updated count
    const totalStudents = await User.countDocuments({ userType: 'student' });
    console.log('\n📊 Total students in database now:', totalStudents);

    // List all students
    const allStudents = await User.find({ userType: 'student' }, { username: 1, email: 1, name: 1, studentId: 1 });
    console.log('\n📋 All students in database:');
    console.table(allStudents);

    console.log('\n✨ Cleanup complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during cleanup:', err);
    process.exit(1);
  }
}

removeStudentOne();
