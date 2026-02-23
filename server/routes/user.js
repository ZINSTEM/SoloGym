import express from 'express';
import User from '../models/User.js';
import AttributeHistory from '../models/AttributeHistory.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// GET /api/user/profile
router.get('/profile', async (req, res) => {
  res.json(req.user);
});

// PUT /api/user/profile - update displayName etc
router.put('/profile', async (req, res) => {
  try {
    const { displayName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...(displayName !== undefined && { displayName }) },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/user/attributes - allocate points (e.g. { strength: 1, vitality: 2 })
router.put('/attributes', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { strength = 0, endurance = 0, agility = 0, vitality = 0 } = req.body;
    const total = [strength, endurance, agility, vitality].reduce((a, b) => a + b, 0);
    if (total > user.availablePoints) {
      return res.status(400).json({ message: 'Not enough points' });
    }
    user.attributes.strength += strength;
    user.attributes.endurance += endurance;
    user.attributes.agility += agility;
    user.attributes.vitality += vitality;
    user.availablePoints -= total;
    await user.save();

    await AttributeHistory.create({
      userId: user._id,
      ...user.attributes.toObject(),
    });

    const updated = await User.findById(req.user._id).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/user/attribute-history - for charts/weekly change
router.get('/attribute-history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 30;
    const history = await AttributeHistory.find({ userId: req.user._id })
      .sort({ recordedAt: -1 })
      .limit(limit)
      .lean();
    res.json(history.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
