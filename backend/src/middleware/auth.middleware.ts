import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { TokenBlacklistService } from '../services/tokenBlacklist.service';

/**
 * Authenticate user via JWT token
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const isBlacklisted = await TokenBlacklistService.isBlacklisted(token);
    if (isBlacklisted) {
      res.status(401).json({
        success: false,
        message: 'Token revoked',
      });
      return;
    }

    const decoded = authService.verifyAccessToken(token);

    // Attach user info to request
    (req as any).user = decoded;

    next();
  } catch (error: any) {
    console.error('Auth Error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token',
    });
    return;
  }
}

/**
 * Check if user has required role
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userRole = user.role.toLowerCase();
    const requiredRoles = roles.map(r => r.toLowerCase());

    if (!requiredRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
}

/**
 * Optional authentication (doesn't fail if no token)
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = authService.verifyAccessToken(token);
      (req as any).user = decoded;
    }
  } catch (error) {
    // Ignore errors for optional auth
  }

  next();
}
