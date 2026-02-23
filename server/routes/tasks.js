import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import AttributeHistory from '../models/AttributeHistory.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// GET /api/tasks - list tasks (optional ?completed=true|false, ?type=daily)
router.get('/', async (req, res) => {
  try {
    const { completed, type } = req.query;
    const filter = { userId: req.user._id };
    if (completed !== undefined) filter.completed = completed === 'true';
    if (type) filter.type = type;
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks - create task
router.post('/', async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, userId: req.user._id });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/tasks/:id
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/tasks/:id/complete - mark complete, add XP, handle level up
router.post('/:id/complete', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.completed) return res.status(400).json({ message: 'Already completed' });

    task.completed = true;
    task.completedAt = new Date();
    await task.save();

    const user = await User.findById(req.user._id);
    let newXp = user.xp + task.xpReward;
    let newLevel = user.level;
    let xpToNextLevel = user.xpToNextLevel;
    let leveledUp = false;
    let availablePoints = user.availablePoints;

    while (newXp >= xpToNextLevel) {
      newXp -= xpToNextLevel;
      newLevel += 1;
      availablePoints += 3; // 3 points per level
      xpToNextLevel = User.xpForLevel(newLevel + 1);
      leveledUp = true;
    }

    const completedCount = await Task.countDocuments({ userId: req.user._id, completed: true });
    const updatedDoc = await User.findByIdAndUpdate(
      req.user._id,
      {
        xp: newXp,
        level: newLevel,
        xpToNextLevel,
        availablePoints,
      },
      { new: true }
    ).select('-password');
    const badges = [...(updatedDoc.badges || [])];
    if (completedCount === 1 && !badges.includes('first_quest')) badges.push('first_quest');
    if (updatedDoc.level >= 5 && !badges.includes('level_5')) badges.push('level_5');
    if ((updatedDoc.attributes?.strength || 0) >= 5 && !badges.includes('strength_5')) badges.push('strength_5');
    if (badges.length > (updatedDoc.badges || []).length) {
      await User.findByIdAndUpdate(req.user._id, { badges });
    }
    const updatedUser = await User.findById(req.user._id).select('-password').lean();
    if (badges.length > (updatedDoc.badges || []).length) {
      updatedUser.badges = badges;
    }
    res.json({
      task,
      user: updatedUser,
      leveledUp,
      xpGained: task.xpReward,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
