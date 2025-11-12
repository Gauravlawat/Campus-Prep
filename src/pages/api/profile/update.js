import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendSuccess, sendError } from '@/utils/apiResponse';
import { authenticateToken } from '@/middleware/auth';

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const user = req.user; // This will be populated by the authenticateToken middleware
    const { profile, careerGoals, preferences } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          'profile.bio': profile.bio,
          'profile.phoneNumber': profile.phoneNumber,
          'profile.linkedinUrl': profile.linkedinUrl,
          'profile.githubUrl': profile.githubUrl,
          'profile.portfolioUrl': profile.portfolioUrl,
          'profile.targetCompanies': careerGoals.targetCompanies,
          'profile.preferredRole': careerGoals.preferredRole,
          'profile.specializations': careerGoals.specializations,
          'preferences.preferredLanguage': preferences.preferredLanguage,
          'preferences.dailyGoal': preferences.dailyGoal,
          'preferences.studyReminders': preferences.studyReminders,
          'preferences.emailNotifications': preferences.emailNotifications,
        },
      },
      { new: true }
    ).select('-password -otp -otpExpiry');

    sendSuccess(res, {
      updatedFields: Object.keys(req.body),
      updatedAt: updatedUser.updatedAt,
    }, 'Profile updated successfully');

  } catch (error) {
    console.error(error);
    sendError(res, 'Internal server error');
  }
}

export default authenticateToken(handler);
