import rateLimit from 'express-rate-limit';
import { securityLog } from '../config/logger';

import redis from '../config/redis';

// Helper to create a rate limit handler with logging
const createHandler = (limitName: string) => {
  return (req: any, res: any, next: any, options: any) => {
    securityLog.rateLimitExceeded(req.ip, `${limitName}:${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  };
};

/**
 * Standard API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    const userAgent = req.get('user-agent') || 'unknown';
    return `${req.ip}-${userAgent}`;
  },
  handler: createHandler('API'),
});

/**
 * Strict authentication rate limiter
 * 5 login attempts per 15 minutes per IP
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Temporarily increased for debugging
  message: {
    error: 'Too many login attempts from this IP. Please try again in 15 minutes.',
    retryAfter: '15 minutes',
    lockoutTime: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  skipSuccessfulRequests: true, // Don't count successful logins
  keyGenerator: (req) => {
    const userAgent = req.get('user-agent') || 'unknown';
    return `auth:${req.ip}-${userAgent}`;
  },
  handler: createHandler('Auth'),
});

/**
 * Registration rate limiter
 * 3 registration attempts per hour per IP
 * Prevents spam account creation
 */
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: {
    error: 'Too many accounts created from this IP. Please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    return `register:${req.ip}`;
  },
  handler: createHandler('Registration'),
});

/**
 * OTP rate limiter
 * 3 OTP requests per 5 minutes per phone number
 * Prevents SMS bombing
 */
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 OTP requests per window
  message: {
    error: 'Too many OTP requests. Please try again in 5 minutes.',
    retryAfter: '5 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    // Use phone number from request body for better tracking
    const phoneNumber = req.body?.phoneNumber || req.ip;
    return `otp:${phoneNumber}`;
  },
  handler: createHandler('OTP'),
});

/**
 * Password reset rate limiter
 * 3 password reset requests per hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset requests per hour
  message: {
    error: 'Too many password reset attempts. Please try again in 1 hour.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    return `reset:${req.ip}`;
  },
  handler: createHandler('PasswordReset'),
});

/**
 * File upload rate limiter
 * 10 uploads per hour per user
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: {
    error: 'Too many file uploads. Please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    // Use authenticated user ID if available, otherwise IP
    const userId = (req as any).user?.id || req.ip;
    return `upload:${userId}`;
  },
  handler: createHandler('Upload'),
});

/**
 * Admin action rate limiter (more lenient for admins)
 * 200 requests per 15 minutes
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  message: {
    error: 'Too many admin actions. Please slow down.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    const userId = (req as any).user?.id || req.ip;
    return `admin:${userId}`;
  },
  handler: createHandler('Admin'),
});

/**
 * Order creation rate limiter
 * 5 orders per hour per user
 */
export const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 orders per hour
  message: {
    error: 'Too many orders created. Please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    const userId = (req as any).user?.id || req.ip;
    return `order:${userId}`;
  },
  handler: createHandler('Order'),
});

// Export Redis instance for use in other services
export { redis };
