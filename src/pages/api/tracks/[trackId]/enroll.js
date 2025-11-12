import dbConnect from '@/lib/mongodb';
import LearningTrack from '@/models/LearningTrack';
import UserProgress from '@/models/UserProgress';
import { sendSuccess, sendError } from '@/utils/apiResponse';
import { authenticateToken } from '@/middleware/auth';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { trackId } = req.query;
    const user = req.user; // This will be populated by the authenticateToken middleware

    const track = await LearningTrack.findOne({ trackId });

    if (!track) {
      return sendError(res, 'Track not found', 404);
    }

    const existingProgress = await UserProgress.findOne({ userId: user._id, trackId });

    if (existingProgress) {
      return sendError(res, 'Already enrolled in this track', 400);
    }

    const { studySchedule, goals } = req.body;

    const newUserProgress = new UserProgress({
      userId: user._id,
      trackId,
      studyStreak: {
        currentStreak: 0,
        longestStreak: 0,
      },
      weeklyGoals: {
        problemsGoal: studySchedule.problemsPerDay * 7,
        studyHoursGoal: studySchedule.dailyTime * 7 / 60,
      },
      goals,
    });

    await newUserProgress.save();

    sendSuccess(res, {
      enrollmentId: newUserProgress._id,
      trackId,
      enrollmentDate: newUserProgress.enrollmentDate,
      estimatedCompletionDate: newUserProgress.estimatedCompletionDate,
      firstTopic: track.topics[0].topicId,
      creditsRequired: 0,
      creditsDeducted: 0,
    }, 'Successfully enrolled in the track');

  } catch (error) {
    console.error(error);
    sendError(res, 'Internal server error');
  }
}

export default authenticateToken(handler);
