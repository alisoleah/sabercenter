import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { TokenBlacklistService } from '../services/tokenBlacklist.service';
import { securityLog } from '../config/logger';
import config from '../config/config';

export class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(req: Request, res: Response) {
    try {
      const { fullName, phoneNumber, email, password, governorate } = req.body;

      // Validate required fields
      if (!fullName || !phoneNumber || !password) {
        return res.status(400).json({
          success: false,
          message: 'Full name, phone number, and password are required',
        });
      }

      const result = await authService.register({
        fullName,
        phoneNumber,
        email,
        password,
        governorate,
      });

      // Set Refresh Token in HttpOnly Cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/auth/refresh' // Only send to refresh endpoint
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          // Do not send refreshToken in body
        },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req: Request, res: Response) {
    try {
      const { phoneNumber, password } = req.body;
      const clientIp = req.ip || 'unknown';

      // Validate required fields
      if (!phoneNumber || !password) {
        return res.status(400).json({
          success: false,
          message: 'Phone number and password are required',
        });
      }

      const result = await authService.login({
        phoneNumber,
        password,
      });

      // Log successful login
      securityLog.successfulLogin(result.user.id, clientIp);

      // Set Refresh Token in HttpOnly Cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/auth/refresh'
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error: any) {
      // Log failed login
      securityLog.failedLogin(req.ip || 'unknown', req.body?.phoneNumber || 'unknown', error.message);

      return res.status(401).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      const tokens = await authService.refreshToken(refreshToken);

      // Rotate Refresh Token
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/auth/refresh'
      });


      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Token refresh failed',
      });
    }
  }

  /**
   * Get current user
   * GET /api/auth/me
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const user = await authService.getUserById(userId);

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || 'User not found',
      });
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      const userId = (req as any).user?.userId || 'unknown';
      const clientIp = req.ip || 'unknown';

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const expiresInSeconds = 3600;
          await TokenBlacklistService.addToBlacklist(token, expiresInSeconds);
        } catch (e) {
          // If token invalid, no need to blacklist
        }
      }

      // Log logout
      securityLog.logout(userId, clientIp);

      return res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }
}

export default new AuthController();
