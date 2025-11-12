import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import UserProgress from '@/models/UserProgress';
import Notification from '@/models/Notification';
import Leaderboard from '@/models/Leaderboard';
import { sendSuccess, sendError } from '@/utils/apiResponse';
import { authenticateToken } from '@/middleware/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    await authenticateToken(req, res, async () => {
      const user = req.user;

      const userProgress = await UserProgress.findOne({ userId: user._id });
      const notifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5);
      const leaderboard = await Leaderboard.findOne({ type: 'weekly', category: 'overall' });

      const quickActions = [
        { title: 'Continue Learning', description: 'Resume Sliding Window Technique', actionUrl: '/tracks/dsa_intermediate/learn/sliding_window', icon: 'play-circle', priority: 1 },
        { title: 'Take Mock Test', description: 'Arrays & Strings Assessment', actionUrl: '/assessments/arrays-strings-mock', icon: 'clipboard-check', priority: 2 },
        { title: 'Join Study Group', description: 'Advanced DP Masters (4/6 members)', actionUrl: '/community/study-groups/advanced-dp', icon: 'users', priority: 3 },
        { title: 'Ask Mentor', description: '1 session remaining this month', actionUrl: '/mentorship/book-session', icon: 'message-circle', priority: 4 },
      ];

      const recentActivity = [
          { type: 'problem_solved', title: "Solved 'Longest Palindromic Substring'", timestamp: '2024-08-25T11:30:00Z', metadata: { difficulty: 'Medium', timeTaken: 45, accuracy: 'First Try' } },
          { type: 'session_attended', title: "Attended 'System Design Basics' session", timestamp: '2024-08-24T16:00:00Z', metadata: { duration: 90, rating: 5 } },
          { type: 'helped_junior', title: "Helped junior with 'Binary Trees' concept", timestamp: '2024-08-24T14:20:00Z', metadata: { creditsEarned: 5 } },
      ];

      sendSuccess(res, {
        userProgress,
        notifications,
        leaderboard,
        quickActions,
        recentActivity,
      });
    });
  } catch (error) {
    console.error(error);
    sendError(res, 'Internal server error');
  }
}
