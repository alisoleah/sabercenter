import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter, registrationLimiter } from '../middleware/rateLimiter.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { fullName, phoneNumber, email?, password, governorate? }
 * Rate limit: 3 registrations per hour per IP
 */
router.post('/register', registrationLimiter, validate(registerSchema), authController.register);

/**
 * POST /api/auth/login
 * Login with phone and password
 * Body: { phoneNumber, password }
 * Rate limit: 5 login attempts per 15 minutes per IP
 */
router.post('/login', authLimiter, validate(loginSchema), authController.login);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 * Body: { refreshToken }
 */
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Headers: Authorization: Bearer <access_token>
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * POST /api/auth/logout
 * Logout (client-side token removal, placeholder for future token blacklist)
 * Headers: Authorization: Bearer <access_token>
 */
router.post('/logout', authenticate, authController.logout);

export default router;
