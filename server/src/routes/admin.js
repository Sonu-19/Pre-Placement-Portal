import express from 'express';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendEventToUser } from '../utils/sse.js';
import Technology from '../models/Technology.js';
import LearningProgress from '../models/LearningProgress.js';
import auth, { admin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/statistics
// Returns portal statistics (total students, placed students, total courses)
router.get('/statistics', async (req, res) => {
  try {
    console.log('Fetching statistics...');
    
    // Get all users for debugging
    const allUsers = await User.find({}).lean();
    console.log('All users in database:', JSON.stringify(allUsers, null, 2));
    
    // Get counts in parallel with better error handling
    let totalStudents = 0;
    let placedStudents = 0;
    let totalCourses = 0;
    
    try {
      totalStudents = await User.countDocuments({ userType: 'student' });
    } catch (err) {
      console.error('Error counting students:', err);
      throw new Error(`Error counting students: ${err.message}`);
    }
    
    try {
      placedStudents = await User.countDocuments({
        userType: 'student',
        $or: [
          { 'placements.0': { $exists: true } },
          { isPlaced: true }
        ]
      });
    } catch (err) {
      console.error('Error counting placed students:', err);
      // Continue with 0 if there's an error
      placedStudents = 0;
    }
    
    try {
      const agg = await Technology.aggregate([
        { $project: { numCourses: { $size: { $ifNull: ["$resources.courses", []] } } } },
        { $group: { _id: null, total: { $sum: "$numCourses" } } }
      ]);
      totalCourses = (agg && agg[0] && agg[0].total) ? agg[0].total : 0;
    } catch (err) {
      console.error('Error counting courses across technologies:', err);
      throw new Error(`Error counting courses: ${err.message}`);
    }

    console.log('Statistics:', { 
      totalStudents, 
      placedStudents, 
      totalCourses 
    });
    
    // Get all technologies for debugging
    try {
      const allTechs = await Technology.find({}, 'name');
      console.log('All technologies:', JSON.stringify(allTechs, null, 2));
    } catch (err) {
      console.error('Error fetching technologies:', err);
      // Continue without failing the request
    }
    
    res.json({
      success: true,
      totalStudents,
      placedStudents,
      totalCourses
    });
  } catch (err) {
    console.error('Error in /api/admin/statistics:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch statistics',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Apply auth and admin middleware to all other admin routes
router.use(auth);
router.use(admin);

// POST /api/admin/students/:studentId/block - Block a student with reason
router.post('/students/:studentId/block', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { reason } = req.body;

    if (!studentId) return res.status(400).json({ message: 'studentId is required' });

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    student.isBlocked = true;
    student.blockedReason = reason || 'Blocked by admin';
    student.blockedAt = new Date();
    student.blockedBy = req.user._id;

    await student.save();

    // Optionally create a notification for the student
    try {
      await Notification.create({
        userId: student._id,
        title: 'Account blocked',
        message: `Your account has been blocked. Reason: ${student.blockedReason}`,
        type: 'alert'
      });
    } catch (notifErr) {
      console.error('Failed to create block notification:', notifErr);
    }

    res.json({ success: true, message: 'Student blocked', blockedReason: student.blockedReason });
  } catch (err) {
    console.error('Error blocking student:', err);
    res.status(500).json({ message: 'Failed to block student' });
  }
});

// POST /api/admin/students/:studentId/unblock - Unblock a student
router.post('/students/:studentId/unblock', async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) return res.status(400).json({ message: 'studentId is required' });

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    student.isBlocked = false;
    student.blockedReason = undefined;
    student.blockedAt = undefined;
    student.blockedBy = undefined;

    await student.save();

    try {
      await Notification.create({
        userId: student._id,
        title: 'Account unblocked',
        message: 'Your account has been unblocked. You may resume activities.',
        type: 'info'
      });
    } catch (notifErr) {
      console.error('Failed to create unblock notification:', notifErr);
    }

    res.json({ success: true, message: 'Student unblocked' });
  } catch (err) {
    console.error('Error unblocking student:', err);
    res.status(500).json({ message: 'Failed to unblock student' });
  }
});

// GET /api/admin/profile
// Returns current admin's profile information
router.get('/profile', async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select('-passwordHash');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        userType: admin.userType,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin
      }
    });
  } catch (err) {
    console.error('Error fetching admin profile:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch admin profile',
      error: err.message
    });
  }
});

// GET /api/admin/details
// Alias for profile endpoint for backward compatibility
router.get('/details', async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select('-passwordHash');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        userType: admin.userType,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin
      }
    });
  } catch (err) {
    console.error('Error fetching admin details:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch admin details',
      error: err.message
    });
  }
});

// GET /api/admin/students
// Returns list of student users with activity and DSA profile info
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ userType: 'student' }).select(
      'username email studentId name dsaProfile lastLogin createdAt _id isBlocked blockedReason'
    );

    // Fetch learning progress for each student and compute activity status
    const studentsWithProgress = await Promise.all(
      students.map(async (s) => {
        const progress = await LearningProgress.find({ userId: s._id });

        const completedCourses = progress
          .filter(p => p.certificateEarned)
          .map(p => p.courseName);

        const inProgressCourses = progress
          .filter(p => !p.certificateEarned && p.completedSteps > 0)
          .map(p => p.courseName);

        // Determine active/inactive based on lastLogin (inactive if not active for > 15 days)
        const now = Date.now();
        const last = s.lastLogin ? new Date(s.lastLogin).getTime() : null;
        const daysSinceLast = last ? (now - last) / (1000 * 60 * 60 * 24) : Infinity;
        const isActive = !!(last && daysSinceLast <= 15);

        // Persist isActive flag on user document when it differs (keeps DB in sync)
        try {
          if (typeof s.isActive === 'undefined' || s.isActive !== isActive) {
            await User.findByIdAndUpdate(s._id, { isActive }, { new: true });
          }
        } catch (updateErr) {
          console.error(`Failed to update isActive for user ${s._id}:`, updateErr);
        }

        return {
          id: s._id,
          username: s.username,
          email: s.email,
          studentId: s.studentId,
          name: s.name,
          dsaProfile: s.dsaProfile,
          lastLogin: s.lastLogin,
          createdAt: s.createdAt,
          completedCourses,
          inProgressCourses,
          isActive,
          isBlocked: !!s.isBlocked,
          blockedReason: s.blockedReason || null,
          status: s.isBlocked ? 'Blocked' : (isActive ? 'Active' : 'Inactive')
        };
      })
    );

    res.json(studentsWithProgress);
  } catch (err) {
    console.error('Error fetching students for admin:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET /api/admin/messages/:studentId - Get all messages for a student
router.get('/messages/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get messages from User's messages array
    const student = await User.findById(studentId).select('messages');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const messages = (student.messages || []).map(msg => ({
      text: msg.message,
      sender: msg.sender,
      delivered: !!msg.delivered,
      read: !!msg.read,
      timestamp: msg.createdAt
    }));

    res.json({ success: true, messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

  // POST /api/admin/messages/read - mark student->admin messages as read for a student
  router.post('/messages/read', async (req, res) => {
    try {
      const { studentId } = req.body;

      if (!studentId) {
        return res.status(400).json({ message: 'studentId is required' });
      }

      const student = await User.findById(studentId);
      if (!student) return res.status(404).json({ message: 'Student not found' });

      let changed = false;
      if (student.messages && student.messages.length > 0) {
        student.messages.forEach(m => {
          if (m.sender === 'student' && !m.read) {
            m.read = true;
            changed = true;
          }
        });
      }

      if (changed) await student.save();

      res.json({ success: true, marked: changed });
    } catch (err) {
      console.error('Error marking student messages read:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

// POST /api/admin/messages - Save a new message
router.post('/messages', async (req, res) => {
  try {
    const { studentId, message, sender } = req.body;

    if (!studentId || !message || !sender) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Add message to student's messages array
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.messages) {
      student.messages = [];
    }

    // Determine delivered status: consider student "active" if lastLogin within 7 days
    let deliveredFlag = false;
    if (student.lastLogin) {
      const last = new Date(student.lastLogin).getTime();
      const now = Date.now();
      const diffDays = (now - last) / (1000 * 60 * 60 * 24);
      if (diffDays <= 7) deliveredFlag = true;
    }

    student.messages.push({
      message: message,
      sender: sender,
      delivered: deliveredFlag,
      read: false,
      createdAt: new Date()
    });

    await student.save();

    res.json({ 
      success: true, 
      message: 'Message saved successfully'
    });
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ message: 'Failed to save message' });
  }
});

// POST /api/admin/request-meeting - Request a 1-to-1 meeting
router.post('/request-meeting', async (req, res) => {
  try {
    const { studentId, studentEmail, studentName, date, time, topic } = req.body;

    if (!studentId || !studentEmail || !date || !time || !topic) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Store meeting request in student's record
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.meetingRequests) {
      student.meetingRequests = [];
    }

    student.meetingRequests.push({
      date: date,
      time: time,
      topic: topic,
      status: 'pending',
      createdAt: new Date()
    });

    await student.save();

    // TODO: Send email notification to student
    console.log(`Meeting request sent to ${studentEmail} for ${date} at ${time}`);

    res.json({ 
      success: true, 
      message: 'Meeting request sent successfully'
    });
  } catch (err) {
    console.error('Error requesting meeting:', err);
    res.status(500).json({ message: 'Failed to request meeting' });
  }
});

// GET /api/admin/conversations - Get all student conversations for admin
router.get('/conversations', async (req, res) => {
  try {
    const adminId = req.user._id;
    const students = await User.find({ userType: 'student' }).select('name email messages _id');

    const conversations = students.map(student => ({
      id: student._id,
      name: student.name || student.username,
      email: student.email,
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
      unread: student.messages ? student.messages.filter(m => m.sender === 'student' && !m.read).length : 0
    }));

    res.json({ conversations });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/meeting-records/:studentId - Get all meeting records for a student
router.get('/meeting-records/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      success: true,
      meetingRequests: student.meetingRequests || []
    });
  } catch (err) {
    console.error('Error fetching meeting records:', err);
    res.status(500).json({ message: 'Failed to fetch meeting records' });
  }
});

// POST /api/admin/notify - create a notification for a student
router.post('/notify', async (req, res) => {
  try {
    const { studentId, title, message, type } = req.body;

    if (!studentId || !title || !message) {
      return res.status(400).json({ message: 'studentId, title and message are required' });
    }

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const notif = await Notification.create({
      userId: studentId,
      title,
      message,
      type: type || 'general'
    });

    // Push real-time event to connected clients (if any)
    try {
      sendEventToUser(studentId, 'notification', notif);
      console.log(`SSE: notification sent to ${studentId}`);
    } catch (e) {
      console.error('Failed to send SSE notification:', e);
    }

    res.json({ success: true, notification: notif });
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

export default router;



