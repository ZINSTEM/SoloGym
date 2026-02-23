import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const user = await User.create({ email, password, displayName: displayName || 'Hunter' });
    const token = generateToken(user._id);
    res.status(201).json({
      _id: user._id,
      email: user.email,
      displayName: user.displayName,
      level: user.level,
      xp: user.xp,
      xpToNextLevel: user.xpToNextLevel,
      attributes: user.attributes,
      availablePoints: user.availablePoints,
      badges: user.badges,
      token,
    });
  } catch (err) {
    const isDbError = err.name === 'MongoServerError' || err.message?.includes('buffering') || err.message?.includes('timeout');
    const message = isDbError
      ? 'Database unavailable. Check if MongoDB is running (e.g. mongodb://localhost:27017).'
      : (err.message || 'Registration failed');
    res.status(500).json({ message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(user._id);
    const u = await User.findById(user._id).select('-password');
    res.json({
      ...u.toObject(),
      token,
    });
  } catch (err) {
    const isDbError = err.name === 'MongoServerError' || err.message?.includes('buffering') || err.message?.includes('timeout');
    const message = isDbError
      ? 'Database unavailable. Check if MongoDB is running.'
      : (err.message || 'Login failed');
    res.status(500).json({ message });
  }
});

// GET /api/auth/me (protected)
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

export default router;
