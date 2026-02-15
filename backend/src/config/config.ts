import dotenv from 'dotenv';

dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  frontendUrl: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  databaseUrl: string;
  redis: {
    url: string;
  };
  amazon: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    marketplaceId: string;
    region: string;
  };
  noon: {
    partnerId: string;
    apiKey: string;
    secretKey: string;
  };
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    s3BucketName: string;
  };
  paymob: {
    apiKey: string;
    secretKey: string;
  };
  inventory: {
    saberstorePercentage: number;
    amazonPercentage: number;
    noonPercentage: number;
  };
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  databaseUrl: process.env.DATABASE_URL || '',
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  amazon: {
    clientId: process.env.AMAZON_CLIENT_ID || '',
    clientSecret: process.env.AMAZON_CLIENT_SECRET || '',
    refreshToken: process.env.AMAZON_REFRESH_TOKEN || '',
    marketplaceId: process.env.AMAZON_MARKETPLACE_ID || 'A2VIGQ35RCS4UG',
    region: process.env.AMAZON_REGION || 'eu',
  },
  noon: {
    partnerId: process.env.NOON_PARTNER_ID || '',
    apiKey: process.env.NOON_API_KEY || '',
    secretKey: process.env.NOON_SECRET_KEY || '',
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3BucketName: process.env.S3_BUCKET_NAME || 'saberstore-kyc',
  },
  paymob: {
    apiKey: process.env.PAYMOB_API_KEY || '',
    secretKey: process.env.PAYMOB_SECRET_KEY || '',
  },
  inventory: {
    saberstorePercentage: parseInt(process.env.SABERSTORE_STOCK_PERCENTAGE || '30', 10),
    amazonPercentage: parseInt(process.env.AMAZON_STOCK_PERCENTAGE || '35', 10),
    noonPercentage: parseInt(process.env.NOON_STOCK_PERCENTAGE || '35', 10),
  },
};

export default config;
