import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  problemId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  topics: [String],
  subtopics: [String],
  companies: [String],
  frequency: Number,
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  },
  constraints: {
    timeLimit: Number, // in ms
    memoryLimit: Number, // in MB
    inputConstraints: [String],
  },
  examples: [{
    input: String,
    output: String,
    explanation: String,
  }],
  hints: [String],
  solutions: [{
    approach: String,
    timeComplexity: String,
    spaceComplexity: String,
    description: String,
    code: {
      cpp: String,
      java: String,
      python: String,
      javascript: String,
    },
    isOptimal: Boolean,
  }],
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: Boolean,
    explanation: String,
  }],
  editorialContent: {
    intuition: String,
    approach: String,
    complexity: String,
    followUp: [String],
  },
  relatedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
  }],
  aiLearningContent: {
    conceptsRequired: [String],
    commonMistakes: [String],
    teachingPoints: [String],
    analogies: [String],
  },
  statistics: {
    totalAttempts: Number,
    totalSolutions: Number,
    accuracyRate: Number,
    averageTimeToSolve: Number, // in minutes
    languageDistribution: {
      cpp: Number,
      java: Number,
      python: Number,
      javascript: Number,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  unlockCriteria: {
    prerequisiteProblems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
    }],
    minUserLevel: String,
    creditsRequired: Number,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
  lastModified: Date,
});

export default mongoose.models.Problems || mongoose.model('Problems', problemSchema);
