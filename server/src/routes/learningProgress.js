import express from 'express';
import auth from '../middleware/auth.js';
import LearningProgress from '../models/LearningProgress.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Certificate from '../models/Certificate.js';

// Configure multer storage for certificate uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'certificates');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

const router = express.Router();

// GET statistics for user
// Must be before /:userId/:courseName to prevent "stats" from being treated as userId
router.get('/stats/:userId', auth, async (req, res) => {
  try {
    // Use authenticated user ID instead of URL parameter for security
    const userId = req.user._id;

    const allProgress = await LearningProgress.find({ userId });

    // Also fetch any Certificate documents for this user so we can expose their IDs
    const certificates = await Certificate.find({ userId }).select('filename courseName uploadedAt');
    const certsByCourse = {};
    certificates.forEach(c => {
      certsByCourse[c.courseName] = certsByCourse[c.courseName] || [];
      certsByCourse[c.courseName].push(c);
    });

    // Count uploaded certificates across all progress documents
    const certificateUploadsCount = allProgress.reduce((sum, p) => sum + (Array.isArray(p.uploadedCertificates) ? p.uploadedCertificates.length : 0), 0);

    const stats = {
      totalCourses: allProgress.length,
      completedCourses: allProgress.filter(p => p.certificateEarned).length,
      inProgressCourses: allProgress.filter(p => !p.certificateEarned && p.completedSteps > 0).length,
      notStartedCourses: allProgress.filter(p => p.completedSteps === 0).length,
      certificateUploads: certificateUploadsCount,
      courses: allProgress.map(p => ({
        name: p.courseName,
        progress: p.overallProgress,
        completedSteps: p.completedSteps,
        totalSteps: p.totalSteps,
        certificateEarned: p.certificateEarned,
        certificateDate: p.certificateDate,
        startedDate: p.startedDate,
        lastAccessedDate: p.lastAccessedDate,
        uploadedCertificates: (certsByCourse[p.courseName] || []).map(c => ({
          filename: c.filename,
          certificateId: c._id,
          uploadedAt: c.uploadedAt
        })).concat(p.uploadedCertificates || [])
      }))
    };

    res.json(stats);
  } catch (err) {
    console.error('Error fetching statistics:', err);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// NOTE: The route that returns progress for a single course was previously
// declared here. It has been moved below the more specific routes (like
// `/certificate/:id`) to avoid Express route conflicts where the generic
// `/:userId/:courseName` would accidentally match other endpoints.

// POST start a learning step
router.post('/start', auth, async (req, res) => {
  try {
    const { courseName, stepId, title, totalSteps } = req.body;
    const userId = req.user._id;
    console.log(`[START] User: ${userId}, Course: ${courseName}, Step: ${stepId}, TotalSteps: ${totalSteps}`);

    let progress = await LearningProgress.findOne({ userId, courseName });

    if (!progress) {
      console.log(`[CREATE] New progress for ${courseName}`);
      progress = new LearningProgress({
        userId,
        courseName,
        steps: [],
        currentStep: stepId,
        overallProgress: 0,
        totalSteps: totalSteps || 0,
        completedSteps: 0,
        startedDate: new Date(),
        lastAccessedDate: new Date()
      });
    }

    // Find or create step
    let step = progress.steps.find(s => s.stepId === stepId);
    if (!step) {
      console.log(`[CREATE-STEP] Step ${stepId}`);
      step = {
        stepId,
        title: title || `Step ${stepId}`,
        status: 'in-progress',
        startedAt: new Date(),
        progress: 0,
        completedTasks: [],
        notes: ''
      };
      progress.steps.push(step);
    } else {
      console.log(`[UPDATE-STEP] Step ${stepId} to in-progress`);
      step.status = 'in-progress';
      step.startedAt = new Date();
    }

    // Set totalSteps if provided and not already set
    if (totalSteps && totalSteps > 0 && progress.totalSteps === 0) {
      progress.totalSteps = totalSteps;
      console.log(`[SET-TOTAL] Total: ${totalSteps}`);
    }
    
    progress.currentStep = stepId;
    progress.lastAccessedDate = new Date();
    
    // Calculate overall progress
    const completedCount = progress.steps.filter(s => s.status === 'completed').length;
    const totalCount = progress.totalSteps > 0 ? progress.totalSteps : progress.steps.length;
    
    if (totalCount > 0) {
      progress.overallProgress = Math.round((completedCount / totalCount) * 100);
    } else {
      progress.overallProgress = 0;
    }
    
    console.log(`[PROGRESS] ${completedCount}/${totalCount} = ${progress.overallProgress}%`);
    
    await progress.save();

    console.log(`[SUCCESS] Course: ${courseName}, Total: ${progress.totalSteps}, Progress: ${progress.overallProgress}%`);
    res.json(progress);
  } catch (err) {
    console.error('Error starting step:', err);
    res.status(500).json({ message: 'Error starting step' });
  }
});

// POST complete a learning step
router.post('/complete', auth, async (req, res) => {
  try {
    const { courseName, stepId } = req.body;
    const userId = req.user._id;
    console.log(`[COMPLETE] User: ${userId}, Course: ${courseName}, Step: ${stepId}`);

    let progress = await LearningProgress.findOne({ userId, courseName });

    if (!progress) {
      console.error(`[ERROR] Progress not found for ${courseName}`);
      return res.status(404).json({ message: 'Progress not found' });
    }

    let step = progress.steps.find(s => s.stepId === stepId);
    if (!step) {
      console.error(`[ERROR] Step ${stepId} not found`);
      return res.status(404).json({ message: 'Step not found' });
    }

    console.log(`[BEFORE] Total: ${progress.totalSteps}, Completed: ${progress.completedSteps}`);

    step.status = 'completed';
    step.completedAt = new Date();
    step.progress = 100;

    // Calculate completed steps
    const completedStepsCount = progress.steps.filter(s => s.status === 'completed').length;
    const totalStepsCount = progress.totalSteps > 0 ? progress.totalSteps : progress.steps.length;
    
    progress.completedSteps = completedStepsCount;

    // Calculate overall progress percentage
    if (totalStepsCount > 0) {
      progress.overallProgress = Math.round((completedStepsCount / totalStepsCount) * 100);
    } else {
      progress.overallProgress = 0;
    }

    console.log(`[PROGRESS] ${completedStepsCount}/${totalStepsCount} = ${progress.overallProgress}%`);

    // Check if all steps are completed
    if (completedStepsCount === totalStepsCount) {
      progress.certificateEarned = true;
      progress.certificateDate = new Date();
      progress.overallProgress = 100;
      console.log(`[CERTIFICATE] Earned for ${courseName}`);
    } else {
      // Move to next incomplete step
      const nextIncompleteStep = progress.steps.find(s => s.status !== 'completed');
      if (nextIncompleteStep) {
        progress.currentStep = nextIncompleteStep.stepId;
      }
    }

    progress.lastAccessedDate = new Date();
    await progress.save();

    console.log(`[SUCCESS] Course: ${courseName}, Total: ${progress.totalSteps}, Completed: ${completedStepsCount}, Progress: ${progress.overallProgress}%`);
    res.json(progress);
  } catch (err) {
    console.error('Error completing step:', err);
    res.status(500).json({ message: 'Error completing step' });
  }
});

// POST update progress percentage
router.post('/update-progress', auth, async (req, res) => {
  try {
    const { userId, courseName, stepId, progress: progressValue } = req.body;

    let progress = await LearningProgress.findOne({ userId, courseName });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    let step = progress.steps.find(s => s.stepId === stepId);
    if (!step) {
      return res.status(404).json({ message: 'Step not found' });
    }

    // Cap progress at 99 until completed
    step.progress = Math.min(progressValue, 99);
    progress.lastAccessedDate = new Date();
    await progress.save();

    res.json(progress);
  } catch (err) {
    console.error('Error updating progress:', err);
    res.status(500).json({ message: 'Error updating progress' });
  }
});

// POST add note for a step
router.post('/add-note', auth, async (req, res) => {
  try {
    const { userId, courseName, stepId, notes } = req.body;

    let progress = await LearningProgress.findOne({ userId, courseName });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    let step = progress.steps.find(s => s.stepId === stepId);
    if (!step) {
      return res.status(404).json({ message: 'Step not found' });
    }

    step.notes = notes;
    progress.lastAccessedDate = new Date();
    await progress.save();

    res.json(progress);
  } catch (err) {
    console.error('Error adding note:', err);
    res.status(500).json({ message: 'Error adding note' });
  }
});

// POST upload certificate file for a course - save binary to DB and record reference
router.post('/upload-certificate', auth, upload.single('certificate'), async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseName } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const contentType = req.file.mimetype || 'application/octet-stream';
    const filename = req.file.originalname || req.file.filename;

    // Read file into buffer
    const buffer = await fs.promises.readFile(filePath);

    // Create Certificate document
    const certDoc = new Certificate({
      userId,
      courseName,
      filename,
      data: buffer,
      contentType
    });
    await certDoc.save();

    // Remove temp file
    try {
      await fs.promises.unlink(filePath);
    } catch (e) {
      console.warn('Failed to remove temp upload file:', filePath, e.message);
    }

    // Attach to learning progress
    let progress = await LearningProgress.findOne({ userId, courseName });
    if (!progress) {
      progress = new LearningProgress({
        userId,
        courseName,
        steps: [],
        currentStep: 1,
        overallProgress: 0,
        totalSteps: 0,
        completedSteps: 0,
        startedDate: new Date(),
        lastAccessedDate: new Date(),
        uploadedCertificates: []
      });
    }

    const fileRecord = {
      filename: certDoc.filename,
      certificateId: certDoc._id,
      uploadedAt: certDoc.uploadedAt
    };

    progress.uploadedCertificates = progress.uploadedCertificates || [];
    progress.uploadedCertificates.push(fileRecord);
    progress.lastAccessedDate = new Date();
    await progress.save();

    return res.json({ message: 'Certificate uploaded', progress, certificate: { id: certDoc._id, filename: certDoc.filename } });
  } catch (err) {
    console.error('Error uploading certificate:', err);
    return res.status(500).json({ message: 'Error uploading certificate' });
  }
});

// GET certificate binary by id (stream from DB)
router.get('/certificate/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const cert = await Certificate.findById(id);
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });

    res.set('Content-Type', cert.contentType || 'application/octet-stream');
    const download = req.query.download;
    if (download) {
      res.set('Content-Disposition', `attachment; filename="${cert.filename.replace(/\"/g, '')}"`);
    } else {
      res.set('Content-Disposition', `inline; filename="${cert.filename.replace(/\"/g, '')}"`);
    }
    return res.send(cert.data);
  } catch (err) {
    console.error('Error fetching certificate:', err);
    return res.status(500).json({ message: 'Error fetching certificate' });
  }
});

// GET user progress for a specific course
router.get('/:userId/:courseName', auth, async (req, res) => {
  try {
    const { courseName } = req.params;
    const userId = req.user._id; // Use authenticated user ID
    
    console.log(`[FETCH-PROGRESS] userId: ${userId}, courseName: ${courseName}`);

    let progress = await LearningProgress.findOne({
      userId,
      courseName
    });

    // Auto-create progress if doesn't exist
    if (!progress) {
      console.log(`[CREATE-NEW-PROGRESS] Creating new progress for ${courseName}`);
      progress = new LearningProgress({
        userId,
        courseName,
        steps: [], // Will be populated when steps are started
        currentStep: 1,
        overallProgress: 0,
        totalSteps: 0,
        completedSteps: 0,
        startedDate: new Date(),
        lastAccessedDate: new Date()
      });
      await progress.save();
      console.log(`[SAVED-PROGRESS] New progress created for ${courseName}`);
    }

    console.log(`[SUCCESS-FETCH] Progress found for ${courseName}: ${progress.overallProgress}%`);
    res.json(progress);
  } catch (err) {
    console.error('Error fetching progress:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ message: 'Error fetching progress', error: err.message });
  }
});

export default router;
