import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import config from '../config/config';
import { validateEgyptianPhone, validateEmail, validatePassword } from '../utils/validators';

interface RegisterData {
  fullName: string;
  phoneNumber: string;
  email?: string;
  password: string;
  governorate?: string;
}

interface LoginData {
  phoneNumber: string;
  password: string;
}

export class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterData) {
    const { fullName, phoneNumber, email, password, governorate } = data;

    // Validate phone number
    if (!validateEgyptianPhone(phoneNumber)) {
      throw new Error('Invalid Egyptian phone number. Format: 01XXXXXXXXX');
    }

    // Validate email if provided
    if (email && !validateEmail(email)) {
      throw new Error('Invalid email address');
    }

    // Validate password
    if (!validatePassword(password)) {
      throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingUser) {
      throw new Error('User with this phone number already exists');
    }

    // Check email uniqueness
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        throw new Error('User with this email already exists');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        phoneNumber,
        email,
        passwordHash,
        governorate,
        role: 'customer',
        isVerified: false,
      },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        email: true,
        governorate: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.role);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginData) {
    const { phoneNumber, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      throw new Error('Invalid phone number or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Invalid phone number or password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.role);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        governorate: user.governorate,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign(
      { userId, role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const refreshToken = jwt.sign(
      { userId, role },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiresIn }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwtExpiresIn,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as {
        userId: string;
        role: string;
      };

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      return this.generateTokens(user.id, user.role);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as {
        userId: string;
        role: string;
      };

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error(`Invalid token: ${error.message}`);
      }
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        email: true,
        governorate: true,
        role: true,
        isVerified: true,
        createdAt: true,
        profile: true,
        creditLimit: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

export default new AuthService();
