import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ATTRIBUTES = [
  { key: 'strength', label: 'Strength', icon: '⚔️' },
  { key: 'endurance', label: 'Endurance', icon: '🛡️' },
  { key: 'agility', label: 'Agility', icon: '💨' },
  { key: 'vitality', label: 'Vitality', icon: '❤️' },
];

export default function Status() {
  const { user, updateUser } = useAuth();
  const [allocating, setAllocating] = useState({});
  const [pending, setPending] = useState({ strength: 0, endurance: 0, agility: 0, vitality: 0 });

  const att = user?.attributes || {};
  const available = user?.availablePoints ?? 0;
  const totalPending = Object.values(pending).reduce((a, b) => a + b, 0);
  const canAllocate = totalPending > 0 && totalPending <= available;

  const addPoint = (key) => {
    if (totalPending >= available) return;
    setPending((p) => ({ ...p, [key]: p[key] + 1 }));
  };

  const removePoint = (key) => {
    setPending((p) => ({ ...p, [key]: Math.max(0, p[key] - 1) }));
  };

  const applyAllocate = async () => {
    if (!canAllocate) return;
    setAllocating(true);
    try {
      const { data } = await api.put('/user/attributes', pending);
      updateUser(data);
      setPending({ strength: 0, endurance: 0, agility: 0, vitality: 0 });
      toast.success('Stats updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to allocate');
    } finally {
      setAllocating(false);
    }
  };

  const xpPercent = user ? Math.min(100, (user.xp / user.xpToNextLevel) * 100) : 0;

  return (
    <div className="page status-page">
      <motion.div
        className="status-panel panel status-full-window"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="status-window-glow" />
        <h1 className="page-title glowing-text">Status Window</h1>
        <p className="page-subtitle">Allocate points earned by leveling up.</p>

        <div className="status-xp-bar-wrap">
          <span className="status-xp-label">Level {user?.level ?? 1} — XP: {user?.xp ?? 0} / {user?.xpToNextLevel ?? 100}</span>
          <div className="status-xp-bar">
            <motion.div
              className="status-xp-fill"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        <div className="status-attributes-table">
          <table className="attr-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Points</th>
                <th>Allocate</th>
              </tr>
            </thead>
            <tbody>
              {ATTRIBUTES.map(({ key, label, icon }) => (
                <tr key={key}>
                  <td>
                    <span className="status-attr-icon">{icon}</span>
                    {label}
                  </td>
                  <td className="glowing-text">{att[key] ?? 0}</td>
                  <td>
                    <div className="allocate-controls">
                      <button
                        type="button"
                        className="btn btn-icon"
                        onClick={() => removePoint(key)}
                        disabled={pending[key] === 0}
                        aria-label={`Remove ${label}`}
                      >
                        −
                      </button>
                      <span className="allocate-pending">{pending[key]}</span>
                      <button
                        type="button"
                        className="btn btn-icon"
                        onClick={() => addPoint(key)}
                        disabled={totalPending >= available}
                        aria-label={`Add ${label}`}
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {available > 0 && (
          <div className="status-allocate-footer">
            <span className="points-available">Available: {available - totalPending} points</span>
            <button
              type="button"
              className="btn btn-primary"
              onClick={applyAllocate}
              disabled={!canAllocate || allocating}
            >
              {allocating ? 'Applying...' : `Apply +${totalPending} points`}
            </button>
          </div>
        )}

        {available === 0 && totalPending === 0 && (
          <p className="text-muted">Complete missions to level up and earn stat points.</p>
        )}
      </motion.div>
    </div>
  );
}
