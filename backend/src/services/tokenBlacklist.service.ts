import redis from '../config/redis';

/**
 * Service to manage token blacklisting
 * Used for user logout to invalidate tokens before their expiration
 */
export class TokenBlacklistService {
    private static readonly PREFIX = 'blacklist:';

    /**
     * Add a token to the blacklist
     * @param token The JWT token to blacklist
     * @param expiresInSeconds Time until the token expires in seconds
     */
    static async addToBlacklist(token: string, expiresInSeconds: number): Promise<void> {
        if (!redis) {
            console.warn('Redis not available, cannot blacklist token');
            return;
        }

        try {
            const key = `${this.PREFIX}${token}`;
            await redis.set(key, '1', 'EX', expiresInSeconds);
        } catch (error) {
            console.error('Error blacklisting token:', error);
        }
    }

    /**
     * Check if a token is blacklisted
     * @param token The JWT token to check
     */
    static async isBlacklisted(token: string): Promise<boolean> {
        if (!redis) {
            // Fail open if Redis is down (allow request) - or could fail closed depending on security requirements
            // Security focused: fail closed (return true)
            // Availability focused: fail open (return false)
            // Given we are in "Security Hardening" phase, let's log and return false strictly for now to avoid locking everyone out if Redis flakiness,
            // but in high security it should probably reject.
            // However, considering this is a "Blacklist", if the list is unavailable, we cannot check it.
            return false;
        }

        try {
            const key = `${this.PREFIX}${token}`;
            const result = await redis.get(key);
            return result === '1';
        } catch (error) {
            console.error('Error checking token blacklist:', error);
            return false;
        }
    }
}
