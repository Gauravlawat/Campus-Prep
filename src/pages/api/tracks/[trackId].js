import dbConnect from '@/lib/mongodb';
import LearningTrack from '@/models/LearningTrack';
import UserProgress from '@/models/UserProgress';
import { sendSuccess, sendError } from '@/utils/apiResponse';
import { optionalAuth } from '@/middleware/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { trackId } = req.query;
    const user = req.user; // This will be populated by the optionalAuth middleware

    const track = await LearningTrack.findOne({ trackId });

    if (!track) {
      return sendError(res, 'Track not found', 404);
    }

    let userProgress = null;
    if (user) {
      userProgress = await UserProgress.findOne({ userId: user._id, trackId });
    }

    sendSuccess(res, {
      track,
      userProgress,
    });

  } catch (error) {
    console.error(error);
    sendError(res, 'Internal server error');
  }
}

export default optionalAuth(handler);
