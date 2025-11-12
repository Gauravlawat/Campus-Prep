import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendSuccess, sendError } from '@/utils/apiResponse';
import { authenticateToken } from '@/middleware/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { userId } = req.query;

    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // For now, I will return mock data for achievements
    const achievements = {
        achievements: [
            { achievementId: "array_master", title: "Array Master", description: "Solved 50 array problems with 90%+ accuracy", badgeIcon: "https://example.com/badges/array-master.svg", category: "Problem Solving", rarity: "Rare", rarityColor: "#9333ea", unlockedAt: "2024-08-20T10:30:00Z", creditsEarned: 100, progress: 100, isDisplayed: true, requirements: { description: "Solve 50 array problems with minimum 90% accuracy", criteria: [{ type: "problems_solved", topic: "Arrays", target: 50, current: 50 }, { type: "accuracy", topic: "Arrays", target: 90, current: 93.3 }] } },
            { achievementId: "dp_master", title: "Dynamic Programming Master", description: "Solve 30 DP problems with 85%+ accuracy", badgeIcon: "https://example.com/badges/dp-master.svg", category: "Problem Solving", rarity: "Epic", rarityColor: "#dc2626", isUnlocked: false, progress: 70, requirements: { description: "Solve 30 DP problems with minimum 85% accuracy", criteria: [{ type: "problems_solved", topic: "Dynamic Programming", target: 30, current: 21 }, { type: "accuracy", topic: "Dynamic Programming", target: 85, current: 65.6 }] } }
        ],
        categoryStats: {
            "Problem Solving": { unlocked: 3, total: 8 },
            "Consistency": { unlocked: 2, total: 5 },
            "Competition": { unlocked: 1, total: 6 },
            "Community": { unlocked: 1, total: 4 },
            "Learning": { unlocked: 2, total: 7 }
        },
        totalCreditsEarned: 685,
        rarityBreakdown: { "Common": 3, "Rare": 2, "Epic": 2, "Legendary": 1 }
    };

    sendSuccess(res, achievements);

  } catch (error) {
    console.error(error);
    sendError(res, 'Internal server error');
  }
}

export default authenticateToken(handler);
