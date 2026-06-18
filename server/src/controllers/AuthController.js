import AuthService from '../services/AuthService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_TOKEN_COOKIE_NAME,
} from '../utils/cookies.js';

class AuthController {
  register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const result = await AuthService.register({ name, email, password });

    setRefreshTokenCookie(res, result.refreshToken);

    ApiResponse.created(
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      'Registration successful'
    ).send(res);
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await AuthService.login({ email, password });

    setRefreshTokenCookie(res, result.refreshToken);

    ApiResponse.success(
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      'Login successful'
    ).send(res);
  });

  logout = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    await AuthService.logout(userId);

    clearRefreshTokenCookie(res);

    ApiResponse.success(null, 'Logout successful').send(res);
  });

  refreshToken = asyncHandler(async (req, res) => {
    const refreshToken =
      req.cookies[REFRESH_TOKEN_COOKIE_NAME] || req.body.refreshToken;

    const result = await AuthService.refreshAccessToken(refreshToken);

    setRefreshTokenCookie(res, result.refreshToken);

    ApiResponse.success(
      {
        accessToken: result.accessToken,
      },
      'Token refreshed successfully'
    ).send(res);
  });

  getMe = asyncHandler(async (req, res) => {
    const user = await AuthService.getCurrentUser(req.user.id);

    ApiResponse.success(user).send(res);
  });
}

export default new AuthController();