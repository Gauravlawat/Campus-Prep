import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  profile: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    rollNumber: {
      type: String,
      unique: true,
      required: true,
    },
    year: {
      type: Number,
      enum: [1, 2, 3, 4],
    },
    branch: {
      type: String,
      enum: ['CSE', 'ECE', 'IT', 'EEE', 'MECH', 'CIVIL'],
    },
    college: {
      type: String,
      default: 'Your College Name',
    },
    phoneNumber: String,
    avatar: String,
    bio: String,
    linkedinUrl: String,
    githubUrl: String,
    portfolioUrl: String,
    targetCompanies: [String],
    preferredRole: {
      type: String,
      enum: ['SDE', 'Data Scientist', 'Product Manager'],
    },
  },
  gamification: {
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: Date,
    totalCredits: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner',
    },
    globalRank: Number,
    collegeRank: Number,
    badges: [{
      badgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge',
      },
      awardedAt: Date,
    }],
    progress: Number,
    achievements: [{
      achievementId: String,
      title: String,
      description: String,
      unlockedAt: Date,
      creditsEarned: Number,
    }],
  },
  learningStats: {
    totalProblemsAttempted: {
      type: Number,
      default: 0,
    },
    totalProblemsSolved: {
      type: Number,
      default: 0,
    },
    easyProblemsSolved: {
      type: Number,
      default: 0,
    },
    mediumProblemsSolved: {
      type: Number,
      default: 0,
    },
    hardProblemsSolved: {
      type: Number,
      default: 0,
    },
    averageAccuracy: Number,
    totalStudyHours: Number,
    favoriteTopics: [String],
    weakTopics: [String],
    learningVelocity: Number,
    lastStudySession: Date,
  },
  preferences: {
    preferredLanguage: {
      type: String,
      enum: ['cpp', 'java', 'python'],
    },
    learningStyle: {
      type: String,
      enum: ['visual', 'hands-on', 'reading'],
    },
    dailyGoal: Number,
    studyReminders: {
      type: Boolean,
      default: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
  },
  subscription: {
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze',
    },
    creditsSpent: {
      type: Number,
      default: 0,
    },
    mentorSessionsUsed: {
      type: Number,
      default: 0,
    },
    mentorSessionsAllowed: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
  lastLogin: Date,
});

export default mongoose.models.User || mongoose.model('User', userSchema);
