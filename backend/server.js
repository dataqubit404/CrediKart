require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const { generalLimiter } = require('./middleware/middleware');
const routes = require('./routes/index');
const sequelize = require('./config/database');

// Load models
require('./models');

app.set('trust proxy', 1); // Trust first proxy (Render, Vercel, Nginx)

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.status(200).json({ status: 'OK', timestamp: new Date() }));

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(generalLimiter);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static Files (uploads) ────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 CrediKart API running at http://localhost:${PORT}`);
      // Start cron jobs
      require('./cron/interestAccrual');
    });
  } catch (err) {
    console.error('❌ Startup failed:', err);
    process.exit(1);
  }
}

start();
