import mongoose from 'mongoose';

const AllQuestionSchema = new mongoose.Schema({
    problemId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, required: true },
    topics: { type: [String], required: true },
    subtopics: { type: [String] },
    companies: { type: [String] },
    frequency: { type: Number },
    likes: { type: Number },
    dislikes: { type: Number },
    constraints: {
        timeLimit: { type: Number },
        memoryLimit: { type: Number },
        inputConstraints: { type: [String] },
    },
    examples: [{
        input: { type: String },
        output: { type: String },
        explanation: { type: String },
    }],
    hints: { type: [String] },
    solutions: { type: [mongoose.Schema.Types.Mixed] },
    testCases: [{
        input: { type: String },
        expectedOutput: { type: String },
        isHidden: { type: Boolean },
        explanation: { type: String },
    }],
    editorialContent: {
        intuition: { type: String },
        approach: { type: String },
        complexity: { type: String },
        followUp: { type: [String] },
    },
    relatedProblems: { type: [String] },
    aiLearningContent: {
        conceptsRequired: { type: [String] },
        commonMistakes: { type: [String] },
        teachingPoints: { type: [String] },
        analogies: { type: [String] },
    },
    statistics: {
        totalAttempts: { type: Number },
        totalSolutions: { type: Number },
        accuracyRate: { type: Number },
        averageTimeToSolve: { type: Number },
        languageDistribution: {
            cpp: { type: Number },
            java: { type: Number },
            python: { type: Number },
            javascript: { type: Number },
        },
    },
    isActive: { type: Boolean },
    isPremium: { type: Boolean },
    unlockCriteria: {
        prerequisiteProblems: { type: [String] },
        minUserLevel: { type: String },
        creditsRequired: { type: Number },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
});

export default mongoose.models.allquestions || mongoose.model('allquestions', AllQuestionSchema);
