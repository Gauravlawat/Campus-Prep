import dbConnect from '@/lib/mongodb';
import LearningTrack from '@/models/LearningTrack';
import UserProgress from '@/models/UserProgress';
import UserSubmission from '@/models/UserSubmission';
import Problem from '@/models/Problem';
import { authenticateToken } from '@/middleware/auth';
import { sendSuccess, sendError } from '@/utils/apiResponse';
import crypto from 'crypto';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { trackId, topicId } = req.query;
    const user = req.user;
    const {
      problemId, // can be Problem._id or problem.problemId string
      status, // 'Accepted' | 'Wrong Answer' | ...
      language, // 'cpp'|'java'|'python'|'javascript'
      code,
      timeTaken, // minutes for this attempt
      executionStats, // { totalTime, maxMemory, testCasesPassed, totalTestCases }
      testCasesResults, // []
      subtopicId, // optional for granular tracking
    } = req.body;

    if (!problemId || !status || !language || !code) {
      return sendError(res, 'Missing required fields', 400);
    }

    const track = await LearningTrack.findOne({ trackId });
    if (!track) return sendError(res, 'Track not found', 404);
    const topic = track.topics.find(t => t.topicId === topicId);
    if (!topic) return sendError(res, 'Topic not found', 404);

    // Normalize problem ObjectId
    let problemDoc = null;
    if (typeof problemId === 'string' && problemId.length !== 24) {
      problemDoc = await Problem.findOne({ problemId });
    } else {
      problemDoc = await Problem.findById(problemId);
    }
    if (!problemDoc) return sendError(res, 'Problem not found', 404);

    // Create submission record
    const submission = new UserSubmission({
      submissionId: crypto.randomUUID(),
      userId: user._id,
      problemId: problemDoc._id,
      trackId,
      topicId,
      subtopicId: subtopicId || null,
      code,
      language,
      status,
      testCasesResults: testCasesResults || [],
      executionStats: executionStats || {},
      timeTaken: Number(timeTaken) || 0,
      attempts: 1,
      isFirstAccepted: false,
      accuracy: (executionStats && executionStats.totalTestCases > 0)
        ? (executionStats.testCasesPassed / executionStats.totalTestCases)
        : (status === 'Accepted' ? 1 : 0),
    });
    await submission.save();

    // Update progress aggregates
    let up = await UserProgress.findOne({ userId: user._id, trackId });
    if (!up) {
      up = new UserProgress({ userId: user._id, trackId, overallProgress: 0, topicProgress: [], studyStreak: {}, weeklyGoals: {} });
    }

    // Ensure topicProgress entry exists
    let tp = up.topicProgress.find(t => t.topicId === topicId);
    if (!tp) {
      tp = { topicId, subtopicProgress: [], isCompleted: false, completionDate: null, totalTimeSpent: 0, quizScore: 0, quizAttempts: 0 };
      up.topicProgress.push(tp);
    }

    // If we can infer subtopic from track schema by problem membership, do it
    let effectiveSubtopicId = subtopicId || null;
    if (!effectiveSubtopicId) {
      for (const st of (topic.subtopics || [])) {
        if ((st.problems || []).some(p => String(p) === String(problemDoc._id))) {
          effectiveSubtopicId = st.subtopicId;
          break;
        }
      }
    }

    if (effectiveSubtopicId) {
      let sp = tp.subtopicProgress.find(s => s.subtopicId === effectiveSubtopicId);
      if (!sp) {
        sp = { subtopicId: effectiveSubtopicId, isCompleted: false, completionDate: null, timeSpent: 0, problemsAttempted: 0, problemsSolved: 0, averageAccuracy: 0, lastProblemSolved: null, notes: '' };
        tp.subtopicProgress.push(sp);
      }
      sp.timeSpent += Number(timeTaken) || 0;
      sp.problemsAttempted += 1;
      if (status === 'Accepted') {
        sp.problemsSolved += 1;
        sp.lastProblemSolved = String(problemDoc._id);
      }
      // update rolling accuracy
      const totalAttempts = Math.max(sp.problemsAttempted, 1);
      sp.averageAccuracy = sp.problemsSolved / totalAttempts;

      // Mark subtopic complete if all problems in it are solved at least once
      const subDef = (topic.subtopics || []).find(s => s.subtopicId === effectiveSubtopicId);
      const totalProblems = subDef ? (subDef.problems?.length || 0) : 0;
      if (totalProblems > 0 && sp.problemsSolved >= totalProblems) {
        sp.isCompleted = true;
        if (!sp.completionDate) sp.completionDate = new Date();
      }
    }

    // Update topic totals
    tp.totalTimeSpent = (tp.totalTimeSpent || 0) + (Number(timeTaken) || 0);
    // topic completion if all its subtopics are completed (when defined)
    const totalSub = (topic.subtopics || []).length;
    const doneSub = tp.subtopicProgress.filter(s => s.isCompleted).length;
    if (totalSub > 0 && doneSub >= totalSub) {
      tp.isCompleted = true;
      if (!tp.completionDate) tp.completionDate = new Date();
    }

    // Update study streak
    const today = new Date();
    const last = up.studyStreak?.lastStudyDate ? new Date(up.studyStreak.lastStudyDate) : null;
    const isYesterday = last && (new Date(today.toDateString()).getTime() - new Date(last.toDateString()).getTime() === 86400000);
    up.studyStreak = up.studyStreak || {};
    if (!up.studyStreak.currentStreak) up.studyStreak.currentStreak = 0;
    if (!up.studyStreak.longestStreak) up.studyStreak.longestStreak = 0;
    if (!last || isYesterday) up.studyStreak.currentStreak += 1; else up.studyStreak.currentStreak = 1;
    if (up.studyStreak.currentStreak > up.studyStreak.longestStreak) up.studyStreak.longestStreak = up.studyStreak.currentStreak;
    up.studyStreak.lastStudyDate = today;

    // Weekly goals
    up.weeklyGoals = up.weeklyGoals || {};
    up.weeklyGoals.problemsSolved = (up.weeklyGoals.problemsSolved || 0) + (status === 'Accepted' ? 1 : 0);
    up.weeklyGoals.studyHoursCompleted = (up.weeklyGoals.studyHoursCompleted || 0) + ((Number(timeTaken) || 0) / 60);

    // overall progress from completed subtopics across the track
    const totalSubtopicsAcrossTrack = track.topics.reduce((acc, tt)=> acc + (tt.subtopics?.length || 0), 0);
    const completedAcrossTrack = up.topicProgress.reduce((acc, tpp)=> acc + (tpp.subtopicProgress?.filter(s => s.isCompleted).length || 0), 0);
    up.overallProgress = totalSubtopicsAcrossTrack > 0 ? Math.round((completedAcrossTrack/totalSubtopicsAcrossTrack)*100) : (up.overallProgress || 0);

    await up.save();

    return sendSuccess(res, { submissionId: submission.submissionId, updatedProgress: { overallProgress: up.overallProgress } }, 'Submission recorded');
  } catch (error) {
    console.error(error);
    return sendError(res, 'Internal server error');
  }
}

export default authenticateToken(handler);
