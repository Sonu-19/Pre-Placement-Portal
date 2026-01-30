import mongoose from 'mongoose';

const learningProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseName: {
    type: String,
    required: true,
    enum: ['mern', 'python', 'java', 'dsA', 'javascript', 'aws', 'ml', 'uiux', 'devops', 'security', 'mobile', 'blockchain', 'tcs', 'infosys', 'wipro', 'accenture', 'reasoning', 'verbal', 'web']
  },
  steps: [
    {
      stepId: {
        type: Number,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed'],
        default: 'not-started'
      },
      startedAt: {
        type: Date,
        default: null
      },
      completedAt: {
        type: Date,
        default: null
      },
      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      completedTasks: {
        type: [String],
        default: []
      },
      notes: {
        type: String,
        default: ''
      }
    }
  ],
  currentStep: {
    type: Number,
    default: 1
  },
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalSteps: {
    type: Number,
    default: 0
  },
  completedSteps: {
    type: Number,
    default: 0
  },
  startedDate: {
    type: Date,
    default: Date.now
  },
  lastAccessedDate: {
    type: Date,
    default: Date.now
  },
  certificateEarned: {
    type: Boolean,
    default: false
  },
  certificateDate: {
    type: Date,
    default: null
  },
  uploadedCertificates: {
    type: [
      {
        filename: String,
        path: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update lastAccessedDate before saving
learningProgressSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.lastAccessedDate = new Date();
  next();
});

// Compound index for user + course
learningProgressSchema.index({ userId: 1, courseName: 1 }, { unique: true });

const LearningProgress = mongoose.model('LearningProgress', learningProgressSchema);

export default LearningProgress;
