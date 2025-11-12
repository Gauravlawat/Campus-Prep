import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  trackId: {
    type: String,
    required: true,
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
  lastAccessDate: Date,
  currentTopic: String,
  currentSubtopic: String,
  overallProgress: Number,
  topicProgress: [{
    topicId: String,
    subtopicProgress: [{
      subtopicId: String,
      isCompleted: Boolean,
      completionDate: Date,
      timeSpent: Number, // in minutes
      problemsAttempted: Number,
      problemsSolved: Number,
      averageAccuracy: Number,
      lastProblemSolved: String,
      notes: String,
    }],
    isCompleted: Boolean,
    completionDate: Date,
    totalTimeSpent: Number,
    quizScore: Number,
    quizAttempts: Number,
  }],
  studyStreak: {
    currentStreak: Number,
    longestStreak: Number,
    lastStudyDate: Date,
    streakStartDate: Date,
  },
  weeklyGoals: {
    problemsGoal: Number,
    problemsSolved: Number,
    studyHoursGoal: Number,
    studyHoursCompleted: Number,
    weekStartDate: Date,
  },
  milestones: [{
    milestoneId: String,
    achievedAt: Date,
    creditsEarned: Number,
    badgeEarned: String,
  }],
  strugglingAreas: [String],
  strongAreas: [String],
  estimatedCompletionDate: Date,
  isCompleted: Boolean,
  completionDate: Date,
  finalScore: Number,
  certificate: {
    issued: Boolean,
    issueDate: Date,
    certificateUrl: String,
  },
});

export default mongoose.models.UserProgress || mongoose.model('UserProgress', userProgressSchema);
