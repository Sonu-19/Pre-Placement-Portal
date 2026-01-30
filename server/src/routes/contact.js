import express from 'express';
import Contact from '../models/Contact.js';

const router = express.Router();

// POST /api/contact - Submit a contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, mobile, subject, message } = req.body;

    // Validation
    if (!name || !email || !mobile || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    // Phone validation (10 digits)
    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(mobile.trim().replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile number. Please enter a 10-digit number'
      });
    }

    // Message length validation
    if (message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message should be at least 10 characters long'
      });
    }

    // Create new contact
    const newContact = new Contact({
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      subject: subject.trim(),
      message: message.trim()
    });

    // Save to database
    await newContact.save();

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. We will get back to you soon.',
      data: newContact
    });
  } catch (err) {
    console.error('Error submitting contact form:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to submit your message. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET /api/contact - Get all contact messages (admin only - optional)
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: contacts
    });
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts'
    });
  }
});

export default router;
