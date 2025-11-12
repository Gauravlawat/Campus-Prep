import dbConnect from '@/lib/mongodb';
import LearningTrack from '@/models/LearningTrack';
import UserProgress from '@/models/UserProgress';
import UserSubmission from '@/models/UserSubmission';
import { optionalAuth } from '@/middleware/auth';
import { sendError, sendSuccess } from '@/utils/apiResponse';
import { computeTrackMetrics } from '@/lib/progress';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  await dbConnect();

  try {
    const { trackId } = req.query;
    const user = req.user;
    const track = await LearningTrack.findOne({ trackId });
    if (!track) return sendError(res, 'Track not found', 404);

    let userProgress = null;
    let submissionsByProblemId = {};
    if (user) {
      userProgress = await UserProgress.findOne({ userId: user._id, trackId });
      // Pull submissions within track context to aggregate
      const subs = await UserSubmission.find({ userId: user._id, trackId });
      for (const s of subs) {
        const key = String(s.problemId);
        if (!submissionsByProblemId[key]) submissionsByProblemId[key] = [];
        submissionsByProblemId[key].push(s);
      }
    }

    const { topicMetrics, overallPct } = computeTrackMetrics({ track, userProgress, submissionsByProblemId });

    return sendSuccess(res, { topicMetrics, overallPct });
  } catch (e) {
    console.error(e);
    return sendError(res, 'Internal server error');
  }
}

export default optionalAuth(handler);
