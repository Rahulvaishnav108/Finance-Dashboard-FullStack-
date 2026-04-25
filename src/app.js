'use strict';

const path     = require('path');
const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');

const config       = require('./config');
const requestId    = require('./middleware/requestId');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Routes
const authRoutes      = require('./routes/auth.routes');
const userRoutes      = require('./routes/user.routes');
const recordRoutes    = require('./routes/record.routes');
const categoryRoutes  = require('./routes/category.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const auditRoutes     = require('./routes/audit.routes');
const healthRoutes    = require('./routes/health.routes');

const app = express();

// ─── Security headers ────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'self'"],
    },
  },
}));
app.use(cors({
  origin:      config.cors.origin,
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
}));

// ─── Request tracing ─────────────────────────────────────────────────────────
app.use(requestId);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));        // Prevent oversized payloads
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── HTTP request logging (skip in test) ─────────────────────────────────────
if (config.env !== 'test') {
  app.use(morgan('combined'));
}

// ─── Global rate limiting ─────────────────────────────────────────────────────
if (config.env !== 'test') {
  const globalLimiter = rateLimit({
    windowMs:          config.rateLimit.windowMs,
    max:               config.rateLimit.max,
    standardHeaders:   true,
    legacyHeaders:     false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });
  app.use('/api/', globalLimiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max:      20,
    message: { success: false, message: 'Too many authentication attempts.' },
  });
  app.use('/api/v1/auth/login',    authLimiter);
  app.use('/api/v1/auth/register', authLimiter);
  app.use('/api/v1/auth/refresh',  authLimiter);
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/health',             healthRoutes);
app.use('/api/v1/auth',        authRoutes);
app.use('/api/v1/users',       userRoutes);
app.use('/api/v1/records',     recordRoutes);
app.use('/api/v1/categories',  categoryRoutes);
app.use('/api/v1/dashboard',   dashboardRoutes);
app.use('/api/v1/audit',       auditRoutes);

// ─── API root info ────────────────────────────────────────────────────────────
app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Dashboard API',
    version: 'v1',
    docs:    '/api/v1/docs',
    endpoints: {
      auth:       '/api/v1/auth',
      users:      '/api/v1/users',
      records:    '/api/v1/records',
      categories: '/api/v1/categories',
      dashboard:  '/api/v1/dashboard',
      audit:      '/api/v1/audit',
      health:     '/health',
    },
  });
});

// ─── Serve frontend ───────────────────────────────────────────────────────────
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));
// SPA fallback — return index.html for any non-API route
app.get(/^(?!\/api|\/health).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ─── 404 + error handlers (must be last) ─────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
