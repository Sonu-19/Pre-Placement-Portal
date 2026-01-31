import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Routes
import authRoutes from './src/routes/auth.js';
import adminRoutes from './src/routes/admin.js';
import technologyRoutes from './src/routes/technology.js';
import roadmapsRoutes from './src/routes/roadmaps.js';
import contactRoutes from './src/routes/contact.js';
import learningProgressRoutes from './src/routes/learningProgress.js';
import notificationsRoutes from './src/routes/notifications.js';
import mcqResultRoutes from './src/routes/mcqResult.js';

// Models
import User from './src/models/User.js';
import Technology from './src/models/Technology.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/preplacement_portal';


// ======================
// MIDDLEWARE
// ======================
app.use(express.json());

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://pre-placement-portal.vercel.app' // replace after frontend deploy
    ],
    credentials: true
  })
);

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


// ======================
// ROUTES
// ======================
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/technologies', technologyRoutes);
app.use('/api/roadmaps', roadmapsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/learning-progress', learningProgressRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/mcq-results', mcqResultRoutes);


// ======================
// TEST ROUTE
// ======================
app.get('/api/test-db', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    const counts = {};
    for (const coll of collectionNames) {
      counts[coll] = await db.collection(coll).countDocuments();
    }

    res.json({
      status: 'success',
      db: mongoose.connection.name,
      connected: mongoose.connection.readyState === 1,
      collections: collectionNames,
      counts
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});


// ======================
// ROOT
// ======================
app.get('/', (req, res) => {
  res.send('✅ Pre-Placement Portal API is running');
});


// ======================
// DATABASE + SERVER START
// ======================
mongoose
  .connect(MONGO_URI, {
    dbName: 'preplacement_portal'
  })
  .then(async () => {
    console.log('✅ MongoDB connected');

    // ======================
    // SEED USERS
    // ======================
    const testStudents = [
      {
        username: 'raj',
        email: 'raj@example.com',
        password: 'password123',
        name: 'Raj Kumar',
        studentId: 'STU002',
        userType: 'student'
      }
    ];

    for (const user of testStudents) {
      const exists = await User.findOne({ username: user.username });
      if (!exists) {
        const passwordHash = await bcrypt.hash(user.password, 10);
        await User.create({
          ...user,
          passwordHash,
          lastLogin: new Date()
        });
        console.log(`Created student: ${user.username}`);
      }
    }

    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        passwordHash,
        userType: 'admin',
        name: 'Admin User'
      });
      console.log('Created admin: admin / admin123');
    }

    // ======================
    // SEED TECHNOLOGIES
    // ======================
    const techCount = await Technology.countDocuments();
    if (techCount === 0) {
      await Technology.insertMany([
        {
          name: 'JavaScript',
          description: 'Web programming language',
          category: 'Web Development',
          resources: {}
        },
        {
          name: 'React',
          description: 'Frontend library',
          category: 'Web Development',
          resources: {}
        },
        {
          name: 'Python',
          description: 'Backend & Data Science',
          category: 'Backend Development',
          resources: {}
        },
        {
          name: 'MongoDB',
          description: 'NoSQL Database',
          category: 'Database',
          resources: {}
        }
      ]);
      console.log('Seeded default technologies');
    }

    // ======================
    // START SERVER
    // ======================
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
