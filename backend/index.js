// add middlewarwe of .env
require('dotenv').config();
const express = require('express');

const cors = require('cors');
const connectDB = require('./utilities/db');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const IS_VERCEL = Boolean(
  process.env.VERCEL ||
  process.env.VERCEL_ENV ||
  process.env.VERCEL_URL
);

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const defaultDevOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const configuredOrigins = (process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : []
);

const allowedOrigins = [
  ...configuredOrigins,
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.trim()] : []),
  ...defaultDevOrigins,
].filter(Boolean);

const parseOriginHost = (origin) => {
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
};

const matchesAllowedOrigin = (origin) => {
  if (!origin) return true;

  // Escape hatch for debugging (prefer configuring CORS_ORIGINS instead).
  if (parseBoolean(process.env.CORS_ALLOW_ALL, false)) return true;

  if (allowedOrigins.includes(origin)) return true;

  const originHost = parseOriginHost(origin);
  if (!originHost) return false;

  // Support wildcard entries like "*.vercel.app" (host matching only).
  for (const entry of allowedOrigins) {
    if (!entry) continue;
    if (entry.startsWith('*.')) {
      const suffix = entry.slice(2);
      if (originHost === suffix) continue;
      if (originHost.endsWith(`.${suffix}`)) return true;
    }
  }

  // If deploying on Vercel and no explicit origins are configured,
  // allow Vercel-hosted frontends by default to avoid refresh/CORS issues.
  if (IS_VERCEL && configuredOrigins.length === 0 && !process.env.FRONTEND_URL) {
    if (originHost.endsWith('.vercel.app')) return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser tools (curl/Postman) with no Origin header.
    if (!origin) return callback(null, true);

    if (matchesAllowedOrigin(origin)) return callback(null, true);

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: parseBoolean(process.env.CORS_ALLOW_CREDENTIALS, false),
  maxAge: 86400,
  optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
connectDB().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('MongoDB connection failed:', err);

  // In local dev, fail fast so it's obvious.
  if (!IS_VERCEL) {
    process.exit(1);
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// TODO: Add routes for users, teams, attendance
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/attendance', attendanceRoutes);

// Handle CORS rejections explicitly
app.use((err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      message: 'CORS blocked this request',
      origin: req.headers.origin || null,
    });
  }
  return next(err);
});

// Fallback error handler
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// On Vercel, export the app (serverless) and don't bind a port.
if (!IS_VERCEL && require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;