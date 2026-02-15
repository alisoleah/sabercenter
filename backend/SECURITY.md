# Security Best Practices

> **Critical**: This document outlines the security measures implemented in the SaberStore API. All developers must adhere to these practices.

## 1. Authentication & Session Management
- **JWT**: Access tokens are short-lived (15m).
- **Refresh Tokens**: Stored in **Secure, HttpOnly, SameSite=Strict** cookies.
- **Revocation**: Logout invalidates refresh tokens using a Redis blacklist.
- **Passwords**: Minimum 12 characters, requiring uppercase, lowercase, numbers, and symbols.

## 2. Infrastructure Security
- **HTTPS**: Enforced in production; HTTP requests are automatically redirected.
- **Security Headers**: Helmet.js configures CSP, HSTS, X-Frame-Options, etc.
- **Rate Limiting**:
  - Login: 5 attempts / 15 mins
  - API: 100 requests / 15 mins
  - Registration: 3 / hour

## 3. Data Protection
- **PII Encryption**: National IDs are encrypted (AES-256-CBC) before storage.
- **Input Sanitization**: All inputs are sanitized against XSS and NoSQL injection.
- **Validation**: Zod schemas validate strict types on all endpoints.

## 4. Amazon Integration (Phase 7)
- **Secrets**: Store `AMAZON_CLIENT_ID`, `AMAZON_CLIENT_SECRET`, and `REFRESH_TOKEN` in `.env`.
- **Never commit keys**: Ensure `.env` is gitignored.
- **PII Access**: Amazon customer data is restricted PII. Handle with care and do not log PII.

## 5. Vulnerability Management
- Run `npm audit` weekly.
- Monitor logs for "Security Alert" events (failed logins, privilege escalation).
- Rotate secrets (JWT_SECRET, DB password) every 90 days.

## Reporting
If you find a security vulnerability, please report it to the engineering lead immediately.
