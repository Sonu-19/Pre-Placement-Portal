import mcqResultRoutes from './src/routes/mcqResult.js';
import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import authRoutes from './src/routes/auth.js';
import adminRoutes from './src/routes/admin.js';
import technologyRoutes from './src/routes/technology.js';
import roadmapsRoutes from './src/routes/roadmaps.js';
import contactRoutes from './src/routes/contact.js';
import learningProgressRoutes from './src/routes/learningProgress.js';
import User from './src/models/User.js';
import Technology from './src/models/Technology.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/preplacement_portal';

// MongoDB connection
console.log('Connecting to MongoDB...');
console.log('MongoDB URI:', MONGO_URI);

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
  console.log('📊 Database name:', mongoose.connection.name);
  console.log('🔌 MongoDB host:', mongoose.connection.host);
  console.log('🚪 MongoDB port:', mongoose.connection.port);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('ℹ️ MongoDB disconnected');
});

// CORS Configuration
// Allow local dev origins (any localhost port) as well as specific production origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  // 'frontendurl'
];

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like curl or server-to-server)
    if (!origin) return callback(null, true);

    // Allow any localhost or 127.0.0.1 origin regardless of port (useful for Vite dev server)
    try {
      const url = new URL(origin);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return callback(null, true);
      }
    } catch (e) {
      // ignore URL parse errors and fall through to explicit list
    }

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      console.warn(msg, { origin });
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

app.use(express.json());

// Serve uploaded files (certificates)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Test database endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Get document counts for each collection
    const counts = {};
    for (const coll of collectionNames) {
      try {
        counts[coll] = await db.collection(coll).countDocuments();
      } catch (e) {
        counts[coll] = `Error: ${e.message}`;
      }
    }
    
    res.json({
      status: 'success',
      db: mongoose.connection.name,
      connected: mongoose.connection.readyState === 1,
      collections: collectionNames,
      counts
    });
  } catch (err) {
    console.error('Database test error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to test database connection',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/technologies', technologyRoutes);
app.use('/api/roadmaps', roadmapsRoutes);
import notificationsRoutes from './src/routes/notifications.js';
app.use('/api/notifications', notificationsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/learning-progress', learningProgressRoutes);
app.use('/api/mcq-results', mcqResultRoutes);

// Root
app.get('/', (req, res) => {
  res.send('Preplacement Portal API is running');
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI, {
    dbName: 'preplacement_portal'
  })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Create test users if they don't exist
    try {
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

      for (const testUser of testStudents) {
        const exists = await User.findOne({ username: testUser.username, userType: testUser.userType });
        if (!exists) {
          const passwordHash = await bcrypt.hash(testUser.password, 10);
          await User.create({
            username: testUser.username,
            email: testUser.email,
            passwordHash,
            userType: testUser.userType,
            studentId: testUser.studentId,
            name: testUser.name,
            lastLogin: new Date()
          });
          console.log(`Created test user: ${testUser.username}`);
        }
      }

      // Create admin user if doesn't exist (check by email or username)
      const adminExists = await User.findOne({
        $or: [
          { email: 'admin@example.com' },
          { username: 'admin', userType: 'admin' }
        ]
      });
      if (!adminExists) {
        const passwordHash = await bcrypt.hash('admin123', 10);
        await User.create({
          username: 'admin',
          email: 'admin@example.com',
          passwordHash,
          userType: 'admin',
          name: 'Admin User'
        });
        console.log('Created admin user: admin / admin123');
      }

      // Create MU admin user if doesn't exist
      const muAdminExists = await User.findOne({
        $or: [
          { email: 'mu@example.com' },
          { username: 'MU', userType: 'admin' }
        ]
      });
      if (!muAdminExists) {
        const passwordHash = await bcrypt.hash('admin123', 10);
        await User.create({
          username: 'MU',
          email: 'mu@example.com',
          passwordHash,
          userType: 'admin',
          name: 'MU Admin'
        });
        console.log('Created admin user: MU / admin123');
      }

      // Create default technologies if they don't exist
      const technologiesExist = await Technology.countDocuments();
      if (technologiesExist === 0) {
        const defaultTechnologies = [
          {
            name: 'JavaScript',
            description: 'A versatile programming language for web development',
            category: 'Web Development',
            resources: {
              videos: [{ title: 'JavaScript Basics', url: 'https://example.com' }],
              courses: [{ name: 'JavaScript Course', platform: 'Udemy', url: 'https://example.com' }],
              certifications: [{ name: 'JS Certification', url: 'https://example.com' }],
              practice: [{ platform: 'LeetCode', url: 'https://example.com' }]
            }
          },
          {
            name: 'React',
            description: 'A JavaScript library for building user interfaces',
            category: 'Web Development',
            resources: {
              videos: [{ title: 'React Fundamentals', url: 'https://example.com' }],
              courses: [{ name: 'React Course', platform: 'Coursera', url: 'https://example.com' }],
              certifications: [{ name: 'React Certification', url: 'https://example.com' }],
              practice: [{ platform: 'CodePen', url: 'https://example.com' }]
            }
          },
          {
            name: 'Python',
            description: 'A powerful programming language for backend development and data science',
            category: 'Backend Development',
            resources: {
              videos: [{ title: 'Python Basics', url: 'https://example.com' }],
              courses: [{ name: 'Python Course', platform: 'Udemy', url: 'https://example.com' }],
              certifications: [{ name: 'Python Certification', url: 'https://example.com' }],
              practice: [{ platform: 'HackerRank', url: 'https://example.com' }]
            }
          },
          {
            name: 'MongoDB',
            description: 'A NoSQL database for modern applications',
            category: 'Databases',
            resources: {
              videos: [{ title: 'MongoDB Basics', url: 'https://example.com' }],
              courses: [{ name: 'MongoDB Course', platform: 'MongoDB University', url: 'https://example.com' }],
              certifications: [{ name: 'MongoDB Certification', url: 'https://example.com' }],
              practice: [{ platform: 'MongoDB Atlas', url: 'https://example.com' }]
            }
          }
        ];

        await Technology.insertMany(defaultTechnologies);
        console.log('Created default technologies');
      }
    } catch (err) {
      console.error('Error initializing data:', err);
    }

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });


