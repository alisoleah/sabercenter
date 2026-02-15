import { Request, Response, NextFunction } from 'express';

/**
 * Sanitize all string inputs to prevent XSS attacks
 * Recursively sanitizes all string values in req.body, req.query, and req.params
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize function for strings
  const sanitize = (value: any): any => {
    if (typeof value === 'string') {
      // Remove dangerous HTML tags and scripts
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
        .replace(/<embed\b[^<]*>/gi, '')
        .replace(/<object\b[^<]*>/gi, '')
        .trim();
    } else if (Array.isArray(value)) {
      return value.map(sanitize);
    } else if (value && typeof value === 'object') {
      const sanitized: any = {};
      for (const key in value) {
        sanitized[key] = sanitize(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitize(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitize(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
}

/**
 * Prevent NoSQL injection by sanitizing MongoDB operators
 */
export function sanitizeNoSQL(req: Request, res: Response, next: NextFunction) {
  const clean = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(clean);
    }

    const cleaned: any = {};
    for (const key in obj) {
      // Remove keys starting with $ or containing .
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      cleaned[key] = clean(obj[key]);
    }
    return cleaned;
  };

  if (req.body) {
    req.body = clean(req.body);
  }

  if (req.query) {
    req.query = clean(req.query);
  }

  if (req.params) {
    req.params = clean(req.params);
  }

  next();
}

/**
 * Combined sanitization middleware
 * Apply both XSS and NoSQL injection prevention
 */
export function sanitizeAll(req: Request, res: Response, next: NextFunction) {
  sanitizeInput(req, res, () => {
    sanitizeNoSQL(req, res, next);
  });
}
