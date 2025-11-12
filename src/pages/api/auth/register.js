import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/utils/password';
import { sendSuccess, sendError } from '@/utils/apiResponse';

export default async function handler(req, res) {
  console.log('Received request method:', req.method);
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const { email, password, firstName, lastName, rollNumber, year, branch } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return sendError(res, 'User already exists', 400);
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      email,
      password: hashedPassword,
      profile: {
        firstName,
        lastName,
        rollNumber,
        year,
        branch,
      },
      isVerified: true,
    });

    await newUser.save();

    sendSuccess(res, {
      userId: newUser._id,
      email: newUser.email,
      isVerified: newUser.isVerified,
    }, 'Registration successful.');

  } catch (error) {
    console.error(error);
    sendError(res, 'Internal server error');
  }
}
