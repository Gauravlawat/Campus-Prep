import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/utils/jwt';
import { sendError, sendSuccess } from '@/utils/apiResponse';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  await dbConnect();
  try {
    const token = req.cookies?.access_token;
    if (!token) return sendError(res, 'Not authenticated', 401);
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, { user: { id: user._id, email: user.email, profile: user.profile, gamification: user.gamification } });
  } catch (e) {
    return sendError(res, 'Invalid or expired token', 401);
  }
}
