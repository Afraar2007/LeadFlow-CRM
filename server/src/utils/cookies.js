/**
 * Configuration for the refresh token cookie.
 * Uses HttpOnly for XSS protection, Secure in production for MITM protection,
 * and SameSite=Strict to prevent CSRF.
 */
const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/api/v1/auth',
    maxAge: parseCookieMaxAge(process.env.JWT_REFRESH_EXPIRES_IN || '7d'),
  };
};

/**
 * Parses a duration string (e.g. '7d', '15m', '1h') into milliseconds.
 */
const parseCookieMaxAge = (expiresIn) => {
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1), 10);

  switch (unit) {
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000; // default 7 days
  }
};

/**
 * Sets the refresh token as an HttpOnly cookie on the response.
 */
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, getCookieOptions());
};

/**
 * Clears the refresh token cookie.
 */
const clearRefreshTokenCookie = (res) => {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/api/v1/auth',
  });
};

export {
  REFRESH_TOKEN_COOKIE_NAME,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};