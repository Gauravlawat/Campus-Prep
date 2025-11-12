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

    const user = await User.findById(userId).select('-password -otp -otpExpiry');

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // For now, I will return mock data for some fields
    const profileData = {
        profile: {
            userId: user._id,
            basicInfo: user.profile,
            socialLinks: {
                linkedinUrl: user.profile.linkedinUrl,
                githubUrl: user.profile.githubUrl,
                portfolioUrl: user.profile.portfolioUrl,
            },
            careerGoals: {
                targetCompanies: user.profile.targetCompanies,
                preferredRole: user.profile.preferredRole,
                specializations: ["Backend Development", "System Design", "Machine Learning"],
            },
            gamificationStats: user.gamification,
            streakInfo: {
                currentStreak: 15,
                longestStreak: 28,
                streakStartDate: "2024-08-10T00:00:00Z",
                lastActiveDate: "2024-08-25T11:30:00Z",
            },
            credits: {
                totalEarned: 2150,
                totalSpent: 350,
                currentBalance: 1800,
                tier: "Gold",
                nextTier: "Platinum",
                creditsToNextTier: 1200,
            },
            rankings: {
                globalRank: 1247,
                globalPercentile: 2.1,
                collegeRank: 12,
                collegePercentile: 5.2,
                yearRank: 3,
                branchRank: 2,
            },
            problemSolvingStats: {
                totalProblems: { attempted: 312, solved: 245, accuracyRate: 78.5 },
                difficultyBreakdown: { easy: { attempted: 145, solved: 120, accuracy: 82.8 }, medium: { attempted: 132, solved: 95, accuracy: 72.0 }, hard: { attempted: 35, solved: 30, accuracy: 85.7 } },
                topicWiseStats: [
                    { topic: "Arrays", problemsAttempted: 45, problemsSolved: 42, accuracy: 93.3, averageTime: 18, rank: "Expert" },
                    { topic: "Dynamic Programming", problemsAttempted: 32, problemsSolved: 21, accuracy: 65.6, averageTime: 42, rank: "Intermediate" },
                    { topic: "Graphs", problemsAttempted: 28, problemsSolved: 25, accuracy: 89.3, averageTime: 35, rank: "Advanced" },
                ],
                languageStats: { mostUsed: "Python", distribution: { python: 45, cpp: 35, java: 15, javascript: 5 }, averageTimeByLanguage: { python: 22, cpp: 28, java: 31, javascript: 25 } },
                contestPerformance: { contestsParticipated: 12, averageRank: 145, bestRank: 23, ratingHistory: [{ date: "2024-07-01", rating: 1200, rank: 234 }, { date: "2024-07-15", rating: 1285, rank: 187 }, { date: "2024-08-01", rating: 1342, rank: 156 }, { date: "2024-08-15", rating: 1398, rank: 145 }, { date: "2024-08-25", rating: 1445, rank: 123 }] },
            },
            studyPatterns: {
                totalStudyHours: 284,
                averageSessionDuration: 47,
                mostProductiveTime: "14:00-16:00",
                studyStreakData: [
                    { date: "2024-08-19", problems: 2, hours: 1.5 }, { date: "2024-08-20", problems: 1, hours: 0.8 }, { date: "2024-08-21", problems: 3, hours: 2.2 }, { date: "2024-08-22", problems: 2, hours: 1.3 }, { date: "2024-08-23", problems: 2, hours: 1.7 }, { date: "2024-08-24", problems: 1, hours: 1.0 }, { date: "2024-08-25", problems: 1, hours: 0.5 }
                ],
                weeklyGoals: { currentWeek: { problemsGoal: 15, problemsSolved: 12, studyHoursGoal: 12, studyHoursCompleted: 8.0, weekProgress: 80 } }
            },
            achievements: [], // This will be fetched from another endpoint
            learningJourney: {
                tracksEnrolled: [
                    { trackId: "dsa_intermediate", title: "DSA - Intermediate", enrollmentDate: "2024-08-01T00:00:00Z", progress: 65, status: "in_progress", estimatedCompletion: "2024-09-15T00:00:00Z" },
                    { trackId: "system_design_basics", title: "System Design Basics", enrollmentDate: "2024-08-10T00:00:00Z", progress: 25, status: "in_progress", estimatedCompletion: "2024-10-01T00:00:00Z" }
                ],
                tracksCompleted: [
                    { trackId: "dsa_beginner", title: "DSA - Beginner", completionDate: "2024-07-30T00:00:00Z", finalScore: 92, certificateUrl: "https://example.com/certificates/john-doe-dsa-beginner.pdf", creditsEarned: 200 }
                ],
                milestones: [
                    { milestoneId: "first_100_problems", title: "Century Club", description: "Solved first 100 problems", achievedAt: "2024-08-15T00:00:00Z", creditsEarned: 100 },
                    { milestoneId: "first_contest_participation", title: "Contest Debut", description: "Participated in first coding contest", achievedAt: "2024-07-20T00:00:00Z", creditsEarned: 50 }
                ]
            },
            recentActivity: [], // This will be fetched from another endpoint
            socialStats: { followersCount: 23, followingCount: 18, postsCount: 12, likesReceived: 145, commentsGiven: 67 },
            mentorshipStats: { juniorsHelped: 8, sessionsCompleted: 3, averageRating: 4.8, totalHoursSpent: 12 }
        }
    };

    sendSuccess(res, profileData);

  } catch (error) {
    console.error(error);
    sendError(res, 'Internal server error');
  }
}

export default authenticateToken(handler);
