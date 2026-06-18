import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Middleware that authenticates requests using JWT.
 * Extracts the token from the Authorization header (Bearer scheme).
 * Verifies the token, loads the user, and attaches them to req.user.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw ApiError.unauthorized('Access denied. No token provided.');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token expired. Please refresh your token.');
    }
    throw ApiError.unauthorized('Invalid token. Authentication failed.');
  }

  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    throw ApiError.unauthorized('User not found. Authentication failed.');
  }

  if (!user.isActive) {
    throw ApiError.forbidden(
      'Your account has been deactivated. Please contact support.'
    );
  }

  req.user = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  next();
});

export default authenticate;