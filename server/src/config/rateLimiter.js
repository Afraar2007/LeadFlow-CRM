import rateLimit from 'express-rate-limit';

const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
    },
  });
};

export const apiLimiter = createRateLimiter();

export const authLimiter = createRateLimiter(15 * 60 * 1000, 10);

export default createRateLimiter;