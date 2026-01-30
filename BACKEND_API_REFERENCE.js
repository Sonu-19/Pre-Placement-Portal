// Add this to your server routes (admin.js or similar)

// GET messages for a specific student
router.get('/messages/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const adminId = req.user.id;

    // Fetch messages from database
    const messages = await Message.find({
      $or: [
        { studentId: studentId, adminId: adminId },
        { studentId: studentId, adminId: adminId }
      ]
    }).sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// POST - Save a new message
router.post('/messages', authenticateToken, async (req, res) => {
  try {
    const { studentId, message, sender } = req.body;
    const adminId = req.user.id;

    if (!studentId || !message || !sender) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Save message to database
    const newMessage = new Message({
      studentId,
      adminId,
      message,
      sender,
      createdAt: new Date()
    });

    await newMessage.save();

    res.json({ 
      success: true, 
      message: 'Message saved successfully',
      data: newMessage 
    });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Failed to save message' });
  }
});

// POST - Request meeting (sends email to student)
router.post('/request-meeting', authenticateToken, async (req, res) => {
  try {
    const { studentId, studentEmail, studentName, date, time, topic } = req.body;
    const adminId = req.user.id;

    if (!studentId || !studentEmail || !date || !time || !topic) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Save meeting request to database
    const meetingRequest = new MeetingRequest({
      studentId,
      adminId,
      date,
      time,
      topic,
      status: 'pending',
      createdAt: new Date()
    });

    await meetingRequest.save();

    // Send email to student
    const emailSubject = `Meeting Request from Admin: ${topic}`;
    const emailBody = `
      <h2>Meeting Request</h2>
      <p>Dear ${studentName},</p>
      <p>Your admin has requested a 1-to-1 meeting with you.</p>
      <hr>
      <h3>Meeting Details:</h3>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p><strong>Topic:</strong> ${topic}</p>
      <hr>
      <p>Please confirm your availability by logging into the platform.</p>
    `;

    // Send email using your email service
    await sendEmail(studentEmail, emailSubject, emailBody);

    res.json({ 
      success: true, 
      message: 'Meeting request sent successfully',
      data: meetingRequest 
    });
  } catch (error) {
    console.error('Error requesting meeting:', error);
    res.status(500).json({ message: 'Failed to request meeting' });
  }
});

// Note: You also need to create Message and MeetingRequest models in your models folder
