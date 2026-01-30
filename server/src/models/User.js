import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    userType: {
      type: String,
      enum: ['student', 'admin'],
      required: true
    },
    studentId: {
      type: String,
      required: function () {
        return this.userType === 'student';
      }
    },
    // Optional display name
    name: {
      type: String
    },
    // DSA practice profile URL or handle (e.g. LeetCode / GFG / HackerRank)
    dsaProfile: {
      type: String
    },
    // Last login timestamp, used to infer active / inactive
    lastLogin: {
      type: Date
    },
    // Track if student is placed
    isPlaced: {
      type: Boolean,
      default: false
    },
    // Whether the student is considered active (updated based on lastLogin)
    isActive: {
      type: Boolean,
      default: true
    },
    // Company name where placed
    placedAt: {
      type: String
    },
    // Messages from admin to student
    messages: [
      {
        message: {
          type: String,
          required: true
        },
        sender: {
          type: String,
          enum: ['admin', 'student'],
          required: true
        },
        delivered: {
          type: Boolean,
          default: false
        },
        read: {
          type: Boolean,
          default: false
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    // Meeting requests from admin
    meetingRequests: [
      {
        date: {
          type: String,
          required: true
        },
        time: {
          type: String,
          required: true
        },
        topic: {
          type: String,
          required: true
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending'
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
    ,
    // Admin-controlled inactive status. When inactive, student is restricted from all activities.
    isInactive: {
      type: Boolean,
      default: false
    },
    inactiveReason: {
      type: String
    },
    inactiveAt: {
      type: Date
    },
    inactiveBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
    ,
    // Admin-controlled block status. When blocked, student is restricted from all activities.
    isBlocked: {
      type: Boolean,
      default: false
    },
    blockedReason: {
      type: String
    },
    blockedAt: {
      type: Date
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;


