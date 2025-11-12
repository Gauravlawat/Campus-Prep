import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword } from '@/utils/password';
import { sendSuccess, sendError } from '@/utils/apiResponse';
import { generateAccessToken, generateRefreshToken } from '@/utils/jwt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const isProd = process.env.NODE_ENV === 'production';
    const accessCookie = `access_token=${accessToken}; HttpOnly; Path=/; SameSite=Lax; Max-Age=900${isProd?'; Secure':''}`; // 15m default
    const refreshCookie = `refresh_token=${refreshToken}; HttpOnly; Path=/api/auth; SameSite=Lax; Max-Age=${7*24*60*60}${isProd?'; Secure':''}`; // 7d scoped to auth path

    res.setHeader('Set-Cookie', [accessCookie, refreshCookie]);

    sendSuccess(res, {
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        gamification: user.gamification,
      },
    }, 'Login successful');

  } catch (error) {
    console.error(error);
    sendError(res, 'Internal server error');
  }
}
