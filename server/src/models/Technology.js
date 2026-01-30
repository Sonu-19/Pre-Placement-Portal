import mongoose from 'mongoose';

const technologySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  courseName: {
    type: String,
    enum: ['mern', 'python', 'java', 'dsA', 'javascript', 'aws', 'ml', 'uiux', 'devops', 'security', 'mobile', 'blockchain', 'tcs', 'infosys', 'wipro', 'accenture', 'reasoning', 'verbal', 'web'],
    default: null
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Web Development', 'Mobile Development', 'Data Science', 'Programming Languages', 'Other']
  },
  resources: {
    videos: [{
      title: String,
      url: String
    }],
    courses: [{
      name: String,
      platform: String,
      url: String
    }],
    certifications: [{
      name: String,
      url: String
    }],
    practice: [{
      platform: String,
      url: String
    }]
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

// Update the updatedAt field before saving
technologySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Technology = mongoose.model('Technology', technologySchema);

export default Technology;
