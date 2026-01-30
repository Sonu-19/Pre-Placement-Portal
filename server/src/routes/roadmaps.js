import express from 'express';
import Roadmap from '../models/Roadmap.js';
import auth, { admin } from '../middleware/auth.js';

const router = express.Router();

// @route GET /api/roadmaps
// @desc  Get all roadmaps
// @access Public
router.get('/', async (req, res) => {
  try {
    const roadmaps = await Roadmap.find().sort({ createdAt: -1 }).lean();

    // Ensure shape is consistent
    const sanitized = roadmaps.map(r => {
      if (!Array.isArray(r.steps)) r.steps = [];
      r.steps = r.steps.map(s => ({
        id: Number(s.id) || 0,
        title: s.title || '',
        duration: s.duration || '',
        whatYouWillLearn: Array.isArray(s.whatYouWillLearn) ? s.whatYouWillLearn : [],
        practiceTasks: Array.isArray(s.practiceTasks) ? s.practiceTasks : [],
        resources: Array.isArray(s.resources) ? s.resources : []
      }));
      return r;
    });

    res.json(sanitized);
  } catch (err) {
    console.error('Error fetching roadmaps:', err?.stack || err);
    res.status(500).json({ message: 'Server error', error: err?.message || String(err) });
  }
});

// @route POST /api/roadmaps
// @desc  Create a new roadmap (admin)
// @access Admin
router.post('/', [auth, admin], async (req, res) => {
  try {
    const { key, title, description, totalSteps, steps } = req.body;

    if (!key || !title) {
      return res.status(400).json({ message: 'Key and title are required' });
    }

    // Normalize payload
    const normalizedSteps = Array.isArray(steps) ? steps.map((s, idx) => ({
      id: Number(s.id) || (idx + 1),
      title: s.title || '',
      duration: s.duration || '',
      whatYouWillLearn: Array.isArray(s.whatYouWillLearn) ? s.whatYouWillLearn : [],
      practiceTasks: Array.isArray(s.practiceTasks) ? s.practiceTasks : [],
      resources: Array.isArray(s.resources) ? s.resources : []
    })) : [];

    const roadmap = new Roadmap({
      key,
      title,
      description: description || '',
      totalSteps: Number(totalSteps) || normalizedSteps.length,
      steps: normalizedSteps,
      createdBy: req.user?._id
    });

    await roadmap.save();
    res.status(201).json(roadmap);
  } catch (err) {
    console.error('Error creating roadmap:', err);
    // duplicate key
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Roadmap with this key already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err?.message || String(err) });
  }
});

export default router;
