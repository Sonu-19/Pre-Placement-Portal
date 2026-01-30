import mongoose from "mongoose";

const mcqResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false // optional for now
    },
    testId: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    timeTaken: {
      type: Number // seconds
    }
  },
  { timestamps: true }
);

export default mongoose.model("McqResult", mcqResultSchema);
