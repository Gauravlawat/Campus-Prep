import { verifyToken, generateAccessToken } from '@/utils/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendError, sendSuccess } from '@/utils/apiResponse';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  await dbConnect();
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return sendError(res, 'Missing refresh token', 401);
    const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId).select('_id');
    if (!user) return sendError(res, 'Invalid refresh token', 401);

    const access = generateAccessToken(user._id);
    const isProd = process.env.NODE_ENV === 'production';
    const accessCookie = `access_token=${access}; HttpOnly; Path=/; SameSite=Lax; Max-Age=900${isProd?'; Secure':''}`; // 15m
    res.setHeader('Set-Cookie', accessCookie);
    return sendSuccess(res, { ok: true });
  } catch (e) {
    return sendError(res, 'Invalid refresh token', 401);
  }
}
