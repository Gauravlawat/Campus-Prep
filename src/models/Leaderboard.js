import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['global', 'college', 'weekly', 'monthly', 'track_specific'],
    required: true,
  },
  category: {
    type: String,
    enum: ['overall', 'dsa', 'ml', 'development'],
  },
  timeframe: {
    type: String,
    enum: ['all_time', 'weekly', 'monthly'],
  },
  rankings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rank: Number,
    score: Number,
    problemsSolved: Number,
    averageAccuracy: Number,
    streak: Number,
    level: String,
  }],
  recentActivity: String,
  lastActiveTime: Date,
  preferredLanguage: String,
  solvingSpeed: Number, // average time per problem
  trackProgress: Number,
  trackCompletions: Number,
  lastUpdated: Date,
  isActive: Boolean,
  totalParticipants: Number,
  averageScore: Number,
  topScorers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  periodStart: Date,
  periodEnd: Date,
});

export default mongoose.models.Leaderboard || mongoose.model('Leaderboard', leaderboardSchema);
