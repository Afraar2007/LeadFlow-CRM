import ApiError from '../utils/ApiError.js';

describe('ApiError', () => {
  describe('constructor', () => {
    it('should create an error with correct status code and message', () => {
      const error = new ApiError(400, 'Bad request');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad request');
      expect(error.success).toBe(false);
      expect(error.isOperational).toBe(true);
    });

    it('should create an error with errors array', () => {
      const errors = [{ field: 'email', message: 'Email is required' }];
      const error = new ApiError(422, 'Validation failed', errors);
      expect(error.errors).toEqual(errors);
    });
  });

  describe('static methods', () => {
    it('should create bad request error', () => {
      const error = ApiError.badRequest('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
    });

    it('should create unauthorized error', () => {
      const error = ApiError.unauthorized();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });

    it('should create forbidden error', () => {
      const error = ApiError.forbidden();
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Forbidden');
    });

    it('should create not found error', () => {
      const error = ApiError.notFound();
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
    });

    it('should create conflict error', () => {
      const error = ApiError.conflict('Email already exists');
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Email already exists');
    });

    it('should create too many requests error', () => {
      const error = ApiError.tooManyRequests();
      expect(error.statusCode).toBe(429);
    });

    it('should create internal server error', () => {
      const error = ApiError.internal();
      expect(error.statusCode).toBe(500);
    });
  });
});


