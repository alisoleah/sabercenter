import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
// import { doubleCsrf } from 'csrf-csrf'; // Removed unused import
import { csrfProtection, generateCsrfToken } from './middleware/csrf.middleware';
import path from 'path';
import { connectDatabase } from './config/database';
import config from './config/config';
import logger from './config/logger';
import authRoutes from './routes/auth.routes';
import productsRoutes from './routes/products.routes';
import ordersRoutes from './routes/orders.routes';
import installmentsRoutes from './routes/installments.routes';
import kycRoutes from './routes/kyc.routes';
import adminRoutes from './routes/admin.routes';
import inventoryRoutes from './routes/inventory.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import uploadRoutes from './routes/upload.routes';
import bannersRoutes from './routes/banners.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import { sanitizeAll } from './middleware/sanitize.middleware';
import requestLogger from './middleware/requestLogger.middleware';
import validateEnvironment from './config/validateEnv';
// import { startAllMarketplaceJobs } from './jobs/marketplace-sync.job';

const app: Express = express();

// Trust proxy for secure cookies and IP rate limiting behind load balancers (Heroku, Railway, Vercel)
app.set('trust proxy', 1);

// Enforce HTTPS in production
app.use((req, res, next) => {
  if (config.nodeEnv === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.get('host')}${req.url}`);
  }
  next();
});

// Security Headers - Helmet.js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      connectSrc: ["'self'", config.frontendUrl],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  hidePoweredBy: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
}));

// CORS
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));



// CSRF Configuration


// Old CSRF config removed

// Body Parsers - must come before CSRF protection
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global Input Sanitization
app.use(sanitizeAll);

// Request Logging - log all HTTP requests
app.use(requestLogger);

// Global Rate Limiting
app.use('/api', apiLimiter);

// CSRF Token Endpoint
app.get('/api/csrf-token', (req, res) => {
  const csrfToken = generateCsrfToken(req, res);
  res.json({ csrfToken });
});

// Apply CSRF protection to all mutation routes (POST, PUT, DELETE, PATCH)
// Exclude specific paths if necessary (e.g. webhooks)
app.use(csrfProtection);

// Serve static files (uploaded images) with CORS headers
app.use('/uploads', (_req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for static files
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SaberStore API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/installments', installmentsRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/inventory', inventoryRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/banners', bannersRoutes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

async function startServer() {
  try {
    // Validate environment variables
    validateEnvironment();

    // Connect to database
    await connectDatabase();

    // Start marketplace sync jobs (only in production or if explicitly enabled)
    if (config.nodeEnv === 'production' || process.env.ENABLE_MARKETPLACE_JOBS === 'true') {
      // startAllMarketplaceJobs();
    } else {
      logger.info('Marketplace sync jobs disabled (set ENABLE_MARKETPLACE_JOBS=true to enable)');
    }

    // Start listening
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Frontend URL: ${config.frontendUrl}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;

