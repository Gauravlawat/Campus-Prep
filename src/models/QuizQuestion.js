import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [String],
  correctAnswer: String,
  type: {
    type: String,
    enum: ['mcq', 'coding', 'theory'],
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
  },
  topic: String,
  subtopic: String,
});

export default mongoose.models.QuizQuestion || mongoose.model('QuizQuestion', quizQuestionSchema);
