import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, decodeToken } from '../utils/jwt.js';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
});

describe('JWT Utilities', () => {
  const testUserId = '507f1f77bcf86cd799439011';
  const testRole = 'admin';

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(testUserId, testRole);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should generate a token with correct payload', () => {
      const token = generateAccessToken(testUserId, testRole);
      const decoded = decodeToken(token);
      expect(decoded.id).toBe(testUserId);
      expect(decoded.role).toBe(testRole);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(testUserId);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should generate a token with correct user id', () => {
      const token = generateRefreshToken(testUserId);
      const decoded = decodeToken(token);
      expect(decoded.id).toBe(testUserId);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(testUserId, testRole);
      const decoded = verifyAccessToken(token);
      expect(decoded.id).toBe(testUserId);
      expect(decoded.role).toBe(testRole);
    });

    it('should throw for invalid token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(testUserId);
      const decoded = verifyRefreshToken(token);
      expect(decoded.id).toBe(testUserId);
    });

    it('should throw for invalid token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });
  });
});


