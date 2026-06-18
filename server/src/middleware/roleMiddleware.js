import ApiError from '../utils/ApiError.js';

/**
 * Middleware factory that restricts access to specified roles.
 * Must be used after the authenticate middleware.
 *
 * Usage:
 *   router.delete('/users/:id', authenticate, authorize('Admin'), handler)
 *   router.get('/reports', authenticate, authorize('Admin', 'Manager'), handler)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`
      );
    }

    next();
  };
};

export default authorize;