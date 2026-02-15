import logger from './logger';

/**
 * Critical environment variables that must be set in production
 */
const REQUIRED_IN_PRODUCTION = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
];

/**
 * Environment variables that should not use default values in production
 */
const INSECURE_DEFAULTS = [
    { key: 'JWT_SECRET', unsafeValue: 'dev-secret-change-in-production' },
    { key: 'JWT_REFRESH_SECRET', unsafeValue: 'dev-refresh-secret' },
];

/**
 * Validate environment variables on startup
 * Fails fast in production if critical variables are missing
 */
export function validateEnvironment(): void {
    const isProduction = process.env.NODE_ENV === 'production';
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required variables in production
    if (isProduction) {
        for (const key of REQUIRED_IN_PRODUCTION) {
            if (!process.env[key]) {
                errors.push(`Missing required environment variable: ${key}`);
            }
        }

        // Check for insecure defaults in production
        for (const { key, unsafeValue } of INSECURE_DEFAULTS) {
            if (process.env[key] === unsafeValue || !process.env[key]) {
                errors.push(`${key} is using insecure default value. Set a secure value in production.`);
            }
        }
    } else {
        // Warnings for development
        for (const { key } of INSECURE_DEFAULTS) {
            if (!process.env[key]) {
                warnings.push(`${key} not set, using default value (OK for development)`);
            }
        }

        if (!process.env.DATABASE_URL) {
            warnings.push('DATABASE_URL not set - database features will not work');
        }
    }

    // Log warnings
    for (const warning of warnings) {
        logger.warn(`⚠️  ${warning}`);
    }

    // Fail fast on errors in production
    if (errors.length > 0) {
        for (const error of errors) {
            logger.error(`❌ ${error}`);
        }

        if (isProduction) {
            logger.error('Environment validation failed. Refusing to start.');
            process.exit(1);
        }
    }

    if (errors.length === 0 && warnings.length === 0) {
        logger.info('✅ Environment validation passed');
    }
}

export default validateEnvironment;
