const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Rate Limiters ────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts. Try again in 15 minutes.' },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Upload limit reached. Try again later.' },
});

// ── Multer File Upload (v2 compatible) ───────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.env.UPLOAD_PATH || './uploads', file.fieldname);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

// multer v2: fileFilter uses a synchronous return value OR callback
const fileFilter = (req, file, cb) => {
  const allowedExts = /\.(jpeg|jpg|png|pdf)$/i;
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  const extOk = allowedExts.test(path.extname(file.originalname));
  const mimeOk = allowedMimes.includes(file.mimetype);
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
});

module.exports = { generalLimiter, authLimiter, uploadLimiter, upload };
