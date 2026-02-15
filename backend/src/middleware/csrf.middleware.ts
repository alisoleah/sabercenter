import { Request } from 'express';
import { doubleCsrf } from 'csrf-csrf';
import config from '../config/config';

const csrfUtilities = doubleCsrf({
    getSecret: () => config.jwtSecret,
    cookieName: 'x-csrf-token',
    cookieOptions: {
        sameSite: 'lax',
        secure: config.nodeEnv === 'production',
        path: '/',
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getCsrfTokenFromRequest: (req: Request) => req.headers['x-csrf-token'],
    getSessionIdentifier: (_req: Request) => "stateless-session",
});

const {
    doubleCsrfProtection,
    generateCsrfToken
} = csrfUtilities as any;

export const csrfProtection = doubleCsrfProtection;
export { generateCsrfToken };
