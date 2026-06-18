import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import authenticate from '../middleware/authMiddleware.js';
import validate from '../middleware/validation.js';
import { registerValidator, loginValidator } from '../validators/authValidator.js';
import { authLimiter } from '../config/rateLimiter.js';

const router = Router();

/*
 * POST /api/v1/auth/register
 * Register a new admin user.
 * Rate limited: 10 requests per 15 minutes.
 */
router.post(
  '/register',
  authLimiter,
  validate(registerValidator),
  AuthController.register
);

/*
 * POST /api/v1/auth/login
 * Authenticate with email and password.
 * Rate limited: 10 requests per 15 minutes.
 */
router.post(
  '/login',
  authLimiter,
  validate(loginValidator),
  AuthController.login
);

/*
 * POST /api/v1/auth/logout
 * Logout the current user by clearing refresh token.
 * Requires authentication.
 */
router.post('/logout', authenticate, AuthController.logout);

/*
 * POST /api/v1/auth/refresh
 * Refresh the access token using a valid refresh token.
 */
router.post('/refresh', AuthController.refreshToken);

/*
 * GET /api/v1/auth/me
 * Get the currently authenticated user's profile.
 * Requires authentication.
 */
router.get('/me', authenticate, AuthController.getMe);

export default router;