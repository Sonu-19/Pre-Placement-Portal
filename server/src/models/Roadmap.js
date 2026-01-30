import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema({
  type: { type: String, default: 'link' },
  title: { type: String, default: '' },
  src: { type: String, default: '' },
  link: { type: String, default: '' },
  duration: { type: String },
  // allow arbitrary payload for MCQ and other rich resource types
  payload: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

const StepSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, default: '' },
  duration: { type: String, default: '' },
  whatYouWillLearn: { type: [String], default: [] },
  practiceTasks: { type: [String], default: [] },
  resources: { type: [ResourceSchema], default: [] }
}, { _id: false });

const RoadmapSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  totalSteps: { type: Number, default: 0 },
  steps: { type: [StepSchema], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Roadmap = mongoose.model('Roadmap', RoadmapSchema);

export default Roadmap;
