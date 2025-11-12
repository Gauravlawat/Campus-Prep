import mongoose from 'mongoose';

const learningTrackSchema = new mongoose.Schema({
  trackId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  category: {
    type: String,
    enum: ['DSA', 'ML', 'Development', 'System_Design'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true,
  },
  targetYear: [Number],
  estimatedDuration: Number, // in days
  prerequisiteTracks: [String],
  topics: [{
    topicId: String,
    title: String,
    description: String,
    order: Number,
    estimatedTime: Number, // in hours
    difficulty: String,
    subtopics: [{
      subtopicId: String,
      title: String,
      concepts: [String],
      problems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
      }],
      resources: [{
        type: {
          type: String,
          enum: ['video', 'article', 'documentation', 'notes'],
        },
        title: String,
        url: String,
        duration: Number, // in minutes
        difficulty: String,
        isRecommended: Boolean,
      }],
    }],
    quiz: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuizQuestion',
      },
      type: String,
      difficulty: String,
    }],
    isLocked: {
      type: Boolean,
      default: false,
    },
    unlockCriteria: {
      prerequisiteTopics: [String],
      minAccuracy: Number,
      minProblems: Number,
    },
  }],
  totalProblems: Number,
  totalQuizzes: Number,
  enrollmentCount: {
    type: Number,
    default: 0,
  },
  completionRate: Number,
  averageRating: Number,
  tags: [String],
  isActive: {
    type: Boolean,
    default: true,
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
});

export default mongoose.models.LearningTrack || mongoose.model('LearningTrack', learningTrackSchema);
