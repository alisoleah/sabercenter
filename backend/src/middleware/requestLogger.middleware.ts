import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

// Fields to exclude from logging (sensitive data)
const EXCLUDED_BODY_FIELDS = ['password', 'token', 'refreshToken', 'nationalId', 'cvv', 'cardNumber'];

/**
 * Sanitize request body for logging
 */
function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    if (!body || typeof body !== 'object') return {};

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
        if (EXCLUDED_BODY_FIELDS.includes(key.toLowerCase())) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeBody(value as Record<string, unknown>);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

/**
 * Get masked IP address
 */
function getMaskedIp(req: Request): string {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const cleanIp = ip.replace('::ffff:', '');
    const parts = cleanIp.split('.');
    if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
    return cleanIp.substring(0, 10) + '...';
}

/**
 * Request logging middleware
 * Logs all incoming HTTP requests with timing and response status
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    // Get user ID if authenticated
    const userId = (req as any).user?.userId || 'anonymous';

    // Log request info after response is finished
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: getMaskedIp(req),
            userId,
            userAgent: req.get('user-agent')?.substring(0, 100) || 'unknown',
        };

        // Add sanitized body for non-GET requests (if small enough)
        if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
            const sanitizedBody = sanitizeBody(req.body);
            if (JSON.stringify(sanitizedBody).length < 500) {
                (logData as any).body = sanitizedBody;
            }
        }

        // Choose log level based on status code
        if (res.statusCode >= 500) {
            logger.error('Request completed', logData);
        } else if (res.statusCode >= 400) {
            logger.warn('Request completed', logData);
        } else {
            logger.http('Request completed', logData);
        }
    });

    next();
};

export default requestLogger;
