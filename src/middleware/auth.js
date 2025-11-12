import { verifyToken } from '@/utils/jwt';
import User from '@/models/User';
import { sendError } from '@/utils/apiResponse';

function extractAccessToken(req) {
  // Prefer Authorization header Bearer
  const authHeader = req.headers['authorization'];
  const bearer = authHeader && authHeader.split(' ')[1];
  if (bearer) return bearer;
  // Fallback to HttpOnly cookie set by server
  const cookieToken = req.cookies?.access_token;
  return cookieToken || null;
}

async function attachUserFromToken(req) {
  const token = extractAccessToken(req);
  if (!token) return null;
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    if (user && user.isVerified) {
      req.user = user;
      return user;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

// Wrapper: allows anonymous but attaches req.user when valid
export const optionalAuth = (handler) => async (req, res) => {
  await attachUserFromToken(req);
  return handler(req, res);
};

// authenticateToken can be used two ways:
// 1) as a wrapper: export default authenticateToken(handler)
// 2) as a middleware: await authenticateToken(req, res, next)
export const authenticateToken = (...args) => {
  // Wrapper usage
  if (typeof args[0] === 'function') {
    const handler = args[0];
    return async (req, res) => {
      const user = await attachUserFromToken(req);
      if (!user) return sendError(res, 'Unauthorized', 401);
      return handler(req, res);
    };
  }

  // Middleware usage
  return (async (req, res, next) => {
    const user = await attachUserFromToken(req);
    if (!user) return sendError(res, 'Unauthorized', 401);
    return next();
  })(...args);
};