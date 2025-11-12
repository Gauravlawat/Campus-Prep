import mongoose from 'mongoose';

const userSubmissionSchema = new mongoose.Schema({
  submissionId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  },
  // Optional linkage to track context (when solving within a track)
  trackId: {
    type: String,
  },
  topicId: {
    type: String,
  },
  subtopicId: {
    type: String,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    enum: ['cpp', 'java', 'python', 'javascript'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error'],
    required: true,
  },
  testCasesResults: [{
    testCaseIndex: Number,
    status: String,
    executionTime: Number, // in ms
    memoryUsed: Number, // in KB
    input: String,
    expectedOutput: String,
    actualOutput: String,
    errorMessage: String,
  }],
  executionStats: {
    totalTime: Number, // in ms
    maxMemory: Number, // in KB
    testCasesPassed: Number,
    totalTestCases: Number,
  },
  submissionTime: {
    type: Date,
    default: Date.now,
  },
  timeTaken: Number, // in minutes
  attempts: Number,
  isFirstAccepted: Boolean,
  accuracy: Number, // 0..1 for this submission session if applicable
  codeMetrics: {
    linesOfCode: Number,
    cyclomaticComplexity: Number,
    codeQualityScore: Number,
  },
  feedback: {
    aiGeneratedFeedback: String,
    performanceAnalysis: String,
    alternativeApproaches: [String],
  },
});

export default mongoose.models.UserSubmission || mongoose.model('UserSubmission', userSubmissionSchema);
