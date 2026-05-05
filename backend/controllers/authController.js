const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { User, CrediPayLedger } = require('../models');
const { sendVerificationEmail } = require('../services/mailer');

const generateTokens = (user) => {
  const payload = { id: user.id, role: user.role, email: user.email };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Only allow certain roles on public registration
    const allowedRoles = ['CUSTOMER', 'SHOPKEEPER', 'DELIVERY'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 12);
    const email_verify_token = uuidv4();
    const referral_code = `CK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const user = await User.create({
      name, email, phone, password_hash, role,
      email_verify_token: null, // No token needed if auto-verified
      is_email_verified: true, // Auto-verify for development
      credit_limit: parseFloat(process.env.CREDIPAY_DEFAULT_CREDIT_LIMIT) || 5000,
      referral_code,
    });

    // Create CrediPay ledger for customers
    if (role === 'CUSTOMER') {
      await CrediPayLedger.create({
        customer_id: user.id,
        credit_limit: user.credit_limit,
      });
    }

    // Send verification email
    try {
      await sendVerificationEmail(email, name, email_verify_token);
    } catch (mailErr) {
      console.warn('Email sending failed:', mailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      user_id: user.id,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.is_blocked) return res.status(403).json({ error: 'Account blocked. Contact support.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user);
    await user.update({ refresh_token: refreshToken });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        is_email_verified: user.is_email_verified,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ where: { email_verify_token: token } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    await user.update({ is_email_verified: true, email_verify_token: null });
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user);
    await user.update({ refresh_token: tokens.refreshToken });
    res.json(tokens);
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};

exports.logout = async (req, res) => {
  try {
    await req.user.update({ refresh_token: null });
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
};
