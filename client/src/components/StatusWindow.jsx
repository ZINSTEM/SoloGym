import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ATTRIBUTES = [
  { key: 'strength', label: 'Strength', icon: '⚔️' },
  { key: 'endurance', label: 'Endurance', icon: '🛡️' },
  { key: 'agility', label: 'Agility', icon: '💨' },
  { key: 'vitality', label: 'Vitality', icon: '❤️' },
];

export default function StatusWindow({ user }) {
  const att = user?.attributes || {};
  const xpPercent = user ? Math.min(100, (user.xp / user.xpToNextLevel) * 100) : 0;

  return (
    <motion.div
      className="status-window panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="status-window-glow" />
      <div className="status-header">
        <h2 className="status-window-title glowing-text">Status</h2>
        <div className="status-level">
          <span className="status-level-label">Level</span>
          <span className="status-level-value">{user?.level ?? 1}</span>
        </div>
      </div>
      <div className="status-xp-bar-wrap">
        <span className="status-xp-label">XP: {user?.xp ?? 0} / {user?.xpToNextLevel ?? 100}</span>
        <div className="status-xp-bar">
          <motion.div
            className="status-xp-fill"
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
      <div className="status-attributes">
        {ATTRIBUTES.map(({ key, label, icon }) => (
          <div key={key} className="status-attr-row">
            <span className="status-attr-icon">{icon}</span>
            <span className="status-attr-name">{label}</span>
            <span className="status-attr-value glowing-text">{att[key] ?? 0}</span>
          </div>
        ))}
      </div>
      {user?.availablePoints > 0 && (
        <p className="status-points-msg">
          You have <strong>{user.availablePoints}</strong> points to allocate.
        </p>
      )}
      <Link to="/status" className="btn btn-primary status-window-btn">Open full status</Link>
    </motion.div>
  );
}
