import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Debug endpoint - List all users
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.find({}, { username: 1, userType: 1, email: 1, _id: 1 });
    res.json({
      message: 'All users in database',
      count: users.length,
      users
    });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

// Debug endpoint - Test admin credentials
router.post('/debug/test-admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Test admin credentials
    const admin = await User.findOne({ username, userType: 'admin' });
    
    if (!admin) {
      return res.json({
        success: false,
        message: 'Admin not found',
        username,
        userType: 'admin'
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.passwordHash);
    
    res.json({
      success: isPasswordCorrect,
      message: isPasswordCorrect ? 'Password correct' : 'Password incorrect',
      admin: {
        username: admin.username,
        email: admin.email,
        userType: admin.userType,
        _id: admin._id
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});


// Helper to create JWT
const createToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    userType: user.userType
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret_key', { expiresIn: '7d' });
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, userType, studentId, name, dsaProfile } = req.body;

    if (!username || !email || !password || !userType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!['student', 'admin'].includes(userType)) {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    if (userType === 'student' && !studentId) {
      return res.status(400).json({ message: 'Student ID is required for students' });
    }

    const existing = await User.findOne({
      $or: [{ username }, { email }]
    });
    if (existing) {
      return res.status(409).json({ message: 'Username or email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      passwordHash,
      userType,
      studentId: userType === 'student' ? studentId : undefined,
      name,
      dsaProfile
    });

    const token = createToken(user);

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        studentId: user.studentId,
        name: user.name,
        dsaProfile: user.dsaProfile,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password, userType } = req.body;

    console.log('Login attempt:', { username, userType });

    if (!username || !password || !userType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findOne({ username, userType });
    console.log('User found:', user ? `Yes (${user._id})` : 'No');
    
    if (!user) {
      console.log('User not found for username:', username, 'userType:', userType);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Prevent blocked users from logging in
    if (user.isBlocked) {
      const reason = user.blockedReason || 'Please contact your placement cell';
      console.warn(`Blocked user attempted login: ${user._id} - ${reason}`);
      return res.status(403).json({ message: 'You are blocked. Kindly meet your placement cell.', blockedReason: reason });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    const token = createToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        studentId: user.studentId,
        name: user.name,
        dsaProfile: user.dsaProfile,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { name, dsaProfile, email, username } = req.body;
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken (if changed)
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    // Check if username is already taken (if changed)
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(409).json({ message: 'Username already in use' });
      }
      user.username = username;
    }

    if (name) user.name = name;
    if (dsaProfile) user.dsaProfile = dsaProfile;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        studentId: user.studentId,
        name: user.name,
        dsaProfile: user.dsaProfile,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/profile - Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        studentId: user.studentId,
        name: user.name,
        dsaProfile: user.dsaProfile,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/conversations - Get student's conversation with admin
router.get('/conversations', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const student = await User.findById(decoded.id).select('name email messages _id lastLogin');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Return a single conversation with the admin
    const conversations = [{
      id: student._id,
      name: 'Admin',
      email: 'admin@university.ac.in',
      messages: (student.messages || []).map(m => ({
        message: m.message,
        sender: m.sender,
        delivered: !!m.delivered,
        read: !!m.read,
        createdAt: m.createdAt
      })),
      lastMessage: student.messages && student.messages.length > 0 
        ? student.messages[student.messages.length - 1].message 
        : null,
      unread: student.messages ? student.messages.filter(m => m.sender === 'admin' && !m.read).length : 0
    }];

    res.json({ conversations });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/notifications - Get notifications for authenticated user
router.get('/notifications', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const notifications = await Notification.find({ userId: decoded.id }).sort({ createdAt: -1 }).limit(100);

    res.json({ success: true, notifications });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/notifications/read - mark notification(s) as read
router.post('/notifications/read', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { notificationId } = req.body;

    if (notificationId) {
      const n = await Notification.findOne({ _id: notificationId, userId: decoded.id });
      if (!n) return res.status(404).json({ message: 'Notification not found' });
      n.read = true;
      await n.save();
      return res.json({ success: true, notification: n });
    }

    // Mark all unread notifications for user as read
    const resu = await Notification.updateMany({ userId: decoded.id, read: false }, { $set: { read: true } });
    res.json({ success: true, modifiedCount: resu.modifiedCount });
  } catch (err) {
    console.error('Error marking notifications read:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/messages - Student sends message to admin
router.post('/messages', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const student = await User.findById(decoded.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.messages) {
      student.messages = [];
    }

    student.messages.push({
      message: message,
      sender: 'student',
      delivered: true, // message from student to admin: mark delivered to admin
      read: false,
      createdAt: new Date()
    });

    await student.save();

    res.json({ 
      success: true, 
      message: 'Message saved successfully'
    });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/messages/read - mark admin->student messages as read by student
router.post('/messages/read', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const student = await User.findById(decoded.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    let changed = false;
    if (student.messages && student.messages.length > 0) {
      student.messages.forEach(m => {
        if (m.sender === 'admin' && !m.read) {
          m.read = true;
          changed = true;
        }
      });
    }

    if (changed) await student.save();

    res.json({ success: true, marked: changed });
  } catch (err) {
    console.error('Error marking messages read:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;




