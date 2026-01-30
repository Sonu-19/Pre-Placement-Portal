import express from 'express';
import Technology from '../models/Technology.js';
import LearningProgress from '../models/LearningProgress.js';
import auth, { admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/technologies
// @desc    Get all technologies
// @access  Public
router.get('/', async (req, res) => {
  try {
    const technologies = await Technology.find().sort({ name: 1 });

    // Sanitize documents before sending to avoid errors when `resources` is malformed
    const sanitized = technologies.map(t => {
      const obj = t.toObject ? t.toObject() : t;
      if (!obj.resources || typeof obj.resources !== 'object') {
        obj.resources = { videos: [], courses: [], certifications: [], practice: [] };
      } else {
        obj.resources.videos = Array.isArray(obj.resources.videos) ? obj.resources.videos : [];
        obj.resources.courses = Array.isArray(obj.resources.courses) ? obj.resources.courses : [];
        obj.resources.certifications = Array.isArray(obj.resources.certifications) ? obj.resources.certifications : [];
        obj.resources.practice = Array.isArray(obj.resources.practice) ? obj.resources.practice : [];
      }
      return obj;
    });

    res.json(sanitized);
  } catch (err) {
    console.error('Error fetching technologies:', err?.stack || err);
    // Include the error message in the response temporarily to aid debugging
    res.status(500).json({ message: 'Server error', error: err?.message || String(err) });
  }
});

// @route   GET /api/technologies/stats/enrolled
// @desc    Get enrollment stats for all technologies
// @access  Public
router.get('/stats/enrolled', async (req, res) => {
  try {
    // Count learning progress records where either overallProgress > 0
    // OR at least one step has progress > 0 (covers older documents)
    const enrollmentStats = await LearningProgress.aggregate([
      {
        $match: {
          $or: [
            { overallProgress: { $gt: 0 } },
            { 'steps.progress': { $gt: 0 } }
          ]
        }
      },
      {
        $group: {
          _id: '$courseName',
          enrolledCount: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$certificateEarned', true] }, 1, 0] }
          }
        }
      }
    ]);

    console.log('[STATS] Enrollment stats from aggregation:', enrollmentStats);

    // Convert to object with course names as keys
    const statsObj = {};
    enrollmentStats.forEach(stat => {
      statsObj[stat._id] = {
        enrolledCount: stat.enrolledCount,
        completedCount: stat.completedCount
      };
    });

    // Load existing technology names from DB and filter stats to only include those
    const techNames = await Technology.find().distinct('name');
    const techNameSet = new Set(techNames.map(n => (n || '').toLowerCase()));

    const filteredStats = {};
    Object.keys(statsObj).forEach(k => {
      if (techNameSet.has((k || '').toLowerCase())) {
        filteredStats[k] = statsObj[k];
      }
    });

    console.log('[STATS] Final stats object (filtered to existing technologies):', filteredStats);
    res.json(filteredStats);
  } catch (err) {
    console.error('Error fetching enrollment stats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/technologies/migrate/add-courseNames
// @desc    Migrate technologies to add courseName field
// @access  Admin
router.post('/migrate/add-courseNames', [auth, admin], async (req, res) => {
  try {
    const courseMapping = {
      'MERN Stack': 'mern',
      'Python Django': 'python',
      'Java Spring Boot': 'java',
      'Data Structures': 'dsA',
      'JavaScript': 'javascript',
      'AWS Cloud': 'aws',
      'Machine Learning': 'ml',
      'UI/UX Design': 'uiux',
      'DevOps': 'devops',
      'Cyber Security': 'security',
      'Mobile App Development': 'mobile',
      'Blockchain Technology': 'blockchain',
      'TCS Interview Preparation': 'tcs',
      'Infosys Interview Preparation': 'infosys',
      'Wipro Interview Preparation': 'wipro',
      'Accenture Interview Preparation': 'accenture',
      'Capgemini Interview Preparation': 'capgemini',
      'Logical Reasoning': 'reasoning',
      'Verbal Ability': 'verbal',
      'Quantitative Aptitude': 'reasoning'
    };

    const allTechs = await Technology.find({});
    let updated = 0;

    for (const tech of allTechs) {
      if (!tech.courseName && courseMapping[tech.name]) {
        tech.courseName = courseMapping[tech.name];
        await tech.save();
        updated++;
        console.log(`[MIGRATE] Updated ${tech.name} with courseName: ${tech.courseName}`);
      }
    }

    res.json({ 
      message: `Migration completed. Updated ${updated} technologies.`,
      updated
    });
  } catch (err) {
    console.error('Error in migration:', err);
    res.status(500).json({ message: 'Migration error', error: err.message });
  }
});

// @route   POST /api/technologies
// @desc    Create a new technology
// @access  Admin
router.post('/', [auth, admin], async (req, res) => {
  try {
    const { name, description, icon, category, resources, courseName } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Technology name is required' });
    }

    // Ensure `resources` is an object with expected arrays. Earlier code incorrectly
    // defaulted `resources` to a number which caused runtime errors when reading.
    const resourcesPayload = (resources && typeof resources === 'object') ? resources : {
      videos: [],
      courses: [],
      certifications: [],
      practice: []
    };

    const newTech = new Technology({
      name,
      description: description || `Learn ${name}`,
      icon: icon || 'fas fa-code',
      category: category || 'Other',
      resources: resourcesPayload,
      courseName: courseName || ''
    });

    const tech = await newTech.save();
    res.status(201).json(tech);
  } catch (err) {
    console.error('Error creating technology:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/technologies/:id
// @desc    Update a technology
// @access  Admin
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const tech = await Technology.findByIdAndUpdate(
      req.params.id,
      { $set: req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!tech) {
      return res.status(404).json({ message: 'Technology not found' });
    }
    res.json(tech);
  } catch (err) {
    console.error('Error updating technology:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/technologies/:id
// @desc    Delete a technology
// @access  Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const tech = await Technology.findByIdAndDelete(req.params.id);
    if (!tech) {
      return res.status(404).json({ message: 'Technology not found' });
    }
    res.json({ message: 'Technology removed' });
  } catch (err) {
    console.error('Error deleting technology:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
