import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Technology from '../src/models/Technology.js';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/preplacement_portal';

async function run() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to', MONGO_URI);

    const techs = await Technology.find({}).lean();
    if (!techs || techs.length === 0) {
      console.log('No technologies found');
      process.exit(0);
    }

    let total = 0;
    techs.forEach(t => {
      const courses = (t.resources && Array.isArray(t.resources.courses)) ? t.resources.courses : [];
      console.log(`- ${t.name} : courses=${courses.length}`);
      total += courses.length;
    });

    console.log('TOTAL COURSES:', total);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
