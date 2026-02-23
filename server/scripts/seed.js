import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Task from '../models/Task.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sologym';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  await User.deleteMany({});
  await Task.deleteMany({});

  const demo = await User.create({
    email: 'demo@sologym.com',
    password: 'demo123',
    displayName: 'Demo Hunter',
    level: 3,
    xp: 45,
    xpToNextLevel: 225,
    attributes: { strength: 5, endurance: 4, agility: 3, vitality: 6 },
    availablePoints: 2,
    badges: ['first_quest', 'strength_5'],
  });

  await Task.insertMany([
    { userId: demo._id, name: 'Run 5km', type: 'task', difficulty: 'medium', xpReward: 50, completed: true, completedAt: new Date() },
    { userId: demo._id, name: 'Lose 10kg in 3 months', type: 'goal', difficulty: 'hard', xpReward: 500, deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
    { userId: demo._id, name: 'Drink 2L water', type: 'daily', difficulty: 'easy', xpReward: 10 },
    { userId: demo._id, name: 'Push-ups 3x12', type: 'activity', difficulty: 'medium', xpReward: 30 },
  ]);

  console.log('Seed done. Demo user: demo@sologym.com / demo123');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
