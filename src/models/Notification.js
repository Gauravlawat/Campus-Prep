import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['contest', 'session', 'hackathon', 'achievement', 'reminder'],
    required: true,
  },
  category: {
    type: String,
    enum: ['event', 'social', 'learning', 'system'],
  },
  title: String,
  message: String,
  eventDetails: {
    eventType: String,
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    startDate: Date,
    endDate: Date,
    topics: [String],
    difficulty: String,
    registrationRequired: Boolean,
    maxParticipants: Number,
    currentParticipants: Number,
    mentorName: String,
    mentorRole: String,
    sessionType: String,
    creditsRequired: Number,
    theme: String,
    teamSize: Number,
    prizes: [String],
    sponsors: [String],
  },
  actionRequired: Boolean,
  actionUrl: String,
  isRead: {
    type: Boolean,
    default: false,
  },
  isImportant: Boolean,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  scheduledFor: Date,
  expiresAt: Date,
  metadata: {
    source: String,
    relatedEntity: String,
    relatedEntityId: mongoose.Schema.Types.ObjectId,
  },
});

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
