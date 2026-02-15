import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const logDir = process.env.LOG_DIR || path.join(__dirname, '../../logs');
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Custom format for console output
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
    })
);

// JSON format for file logging
const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

// Daily rotating file transport
const fileTransport = new DailyRotateFile({
    dirname: logDir,
    filename: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormat,
});

// Security events log (separate file)
const securityTransport = new DailyRotateFile({
    dirname: logDir,
    filename: 'security-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    format: fileFormat,
    level: 'warn',
});

// Create logger
const logger = winston.createLogger({
    level: logLevel,
    defaultMeta: { service: 'saberstore-api' },
    transports: [
        new winston.transports.Console({ format: consoleFormat }),
    ],
});

// Add file transports in production
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_FILE_LOGGING === 'true') {
    logger.add(fileTransport);
    logger.add(securityTransport);
}

// Security event logger helper
export const securityLog = {
    failedLogin: (ip: string, phoneNumber: string, reason: string) => {
        logger.warn('Failed login attempt', {
            event: 'FAILED_LOGIN',
            ip: maskIp(ip),
            phoneNumber: maskPhone(phoneNumber),
            reason,
        });
    },

    successfulLogin: (userId: string, ip: string) => {
        logger.info('Successful login', {
            event: 'LOGIN_SUCCESS',
            userId,
            ip: maskIp(ip),
        });
    },

    tokenRefresh: (userId: string, ip: string) => {
        logger.info('Token refresh', {
            event: 'TOKEN_REFRESH',
            userId,
            ip: maskIp(ip),
        });
    },

    logout: (userId: string, ip: string) => {
        logger.info('User logout', {
            event: 'LOGOUT',
            userId,
            ip: maskIp(ip),
        });
    },

    kycApproved: (userId: string, adminId: string, creditLimit: number) => {
        logger.info('KYC approved', {
            event: 'KYC_APPROVED',
            userId,
            adminId,
            creditLimit,
        });
    },

    kycRejected: (userId: string, adminId: string, reason: string) => {
        logger.warn('KYC rejected', {
            event: 'KYC_REJECTED',
            userId,
            adminId,
            reason,
        });
    },

    rateLimitExceeded: (ip: string, endpoint: string) => {
        logger.warn('Rate limit exceeded', {
            event: 'RATE_LIMIT_EXCEEDED',
            ip: maskIp(ip),
            endpoint,
        });
    },

    unauthorizedAccess: (ip: string, endpoint: string, userId?: string) => {
        logger.warn('Unauthorized access attempt', {
            event: 'UNAUTHORIZED_ACCESS',
            ip: maskIp(ip),
            endpoint,
            userId,
        });
    },
};

// Helper to mask IP for privacy (show first 2 octets only)
function maskIp(ip: string): string {
    if (!ip) return 'unknown';
    const parts = ip.replace('::ffff:', '').split('.');
    if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
    return ip.substring(0, 10) + '...';
}

// Helper to mask phone number
function maskPhone(phone: string): string {
    if (!phone || phone.length < 6) return '***';
    return phone.substring(0, 3) + '****' + phone.substring(phone.length - 3);
}

export default logger;
