import Redis from 'ioredis';
import config from '../config/config';
import logger from '../config/logger';

// Create a dedicated Redis client for the blacklist to avoid conflicts
const redis = new Redis(config.redis.url);

redis.on('error', (err) => {
    logger.error('Redis Client Error (Blacklist)', err);
});

redis.on('connect', () => {
    logger.info('Connected to Redis for Token Blacklist');
});

export class TokenBlacklistService {
    private static readonly PREFIX = 'bl:';

    /**
     * Add token to blacklist
     * @param token JWT token string
     * @param expiresInSeconds Time until token expires
     */
    static async addToBlacklist(token: string, expiresInSeconds: number): Promise<void> {
        if (!token) return;

        try {
            const key = this.PREFIX + token;
            await redis.set(key, '1', 'EX', expiresInSeconds);
            logger.info(`Token blacklisted for ${expiresInSeconds}s`);
        } catch (error) {
            logger.error('Failed to blacklist token', error);
        }
    }

    /**
     * Check if token is blacklisted
     * @param token JWT token string
     */
    static async isBlacklisted(token: string): Promise<boolean> {
        if (!token) return false;

        try {
            const key = this.PREFIX + token;
            const result = await redis.get(key);
            return result === '1';
        } catch (error) {
            logger.error('Failed to check blacklist', error);
            return false; // Fail open
        }
    }
}
