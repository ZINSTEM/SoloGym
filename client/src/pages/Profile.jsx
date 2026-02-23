import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ATTRIBUTES = [
  { key: 'strength', label: 'Strength', icon: '⚔️' },
  { key: 'endurance', label: 'Endurance', icon: '🛡️' },
  { key: 'agility', label: 'Agility', icon: '💨' },
  { key: 'vitality', label: 'Vitality', icon: '❤️' },
];

const BADGE_LABELS = {
  first_quest: 'First Quest',
  strength_5: 'Strength 5',
  level_5: 'Level 5',
  marathon: 'Marathon',
};

export default function Profile() {
  const { user } = useAuth();
  const [completed, setCompleted] = useState([]);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      api.get('/tasks?completed=true'),
      api.get('/user/attribute-history?limit=30'),
    ])
      .then(([tasksRes, historyRes]) => {
        setCompleted(tasksRes.data);
        setHistory(historyRes.data);
      })
      .catch(() => {});
  }, []);

  const chartData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }
    const labels = days.map((d) => d.toLocaleDateString('en-US', { weekday: 'short' }));
    const xpByDay = days.map((day) => {
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      return completed
        .filter((t) => t.completedAt)
        .filter((t) => {
          const tDate = new Date(t.completedAt);
          return tDate >= day && tDate < next;
        })
        .reduce((sum, t) => sum + t.xpReward, 0);
    });
    return {
      labels,
      datasets: [
        {
          label: 'XP gained',
          data: xpByDay,
          borderColor: '#00bfff',
          backgroundColor: 'rgba(0, 191, 255, 0.15)',
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }, [completed]);

  const weeklyChange = useMemo(() => {
    if (history.length < 2) return {};
    const latest = history[history.length - 1];
    const weekAgo = history.filter((h) => new Date(h.recordedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))[0] || history[0];
    return {
      strength: (latest.strength || 0) - (weekAgo.strength || 0),
      endurance: (latest.endurance || 0) - (weekAgo.endurance || 0),
      agility: (latest.agility || 0) - (weekAgo.agility || 0),
      vitality: (latest.vitality || 0) - (weekAgo.vitality || 0),
    };
  }, [history]);

  const filteredHistory = useMemo(() => {
    if (filter === 'all') return completed;
    return completed.filter((t) => t.type === filter);
  }, [completed, filter]);

  const att = user?.attributes || {};
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: { color: '#a0a0a0' },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: { color: '#a0a0a0' },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="page profile-page">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">{user?.displayName} — Level {user?.level}</p>

        <section className="profile-badges panel">
          <h2 className="section-title">Badges</h2>
          <div className="badges-list">
            {(user?.badges || []).length === 0 ? (
              <span className="text-muted">Complete missions to unlock badges.</span>
            ) : (
              (user?.badges || []).map((b) => (
                <span key={b} className="badge-item" title={BADGE_LABELS[b] || b}>
                  {b === 'strength_5' && '⚔️'}
                  {b === 'first_quest' && '🎯'}
                  {b === 'level_5' && '⭐'}
                  {!['strength_5', 'first_quest', 'level_5'].includes(b) && '🏅'}
                  <span className="badge-label">{BADGE_LABELS[b] || b}</span>
                </span>
              ))
            )}
          </div>
        </section>

        <section className="profile-chart panel">
          <h2 className="section-title">Weekly XP</h2>
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </section>

        <section className="profile-attributes panel">
          <h2 className="section-title">Attributes</h2>
          <table className="data-table attr-summary-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Points</th>
                <th>Weekly change</th>
                <th>Goal</th>
              </tr>
            </thead>
            <tbody>
              {ATTRIBUTES.map(({ key, label, icon }) => (
                <tr key={key}>
                  <td><span className="status-attr-icon">{icon}</span> {label}</td>
                  <td className="glowing-text">{att[key] ?? 0}</td>
                  <td className={weeklyChange[key] > 0 ? 'positive' : ''}>
                    {weeklyChange[key] > 0 ? `+${weeklyChange[key]}` : (weeklyChange[key] || 0)}
                  </td>
                  <td>—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="profile-history panel">
          <h2 className="section-title">History</h2>
          <div className="history-filters">
            {['all', 'task', 'goal', 'activity', 'daily'].map((f) => (
              <button
                key={f}
                type="button"
                className={`btn btn-small ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Mission</th>
                <th>Type</th>
                <th>XP</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-muted">No completed missions yet.</td>
                </tr>
              ) : (
                filteredHistory.slice(0, 50).map((t) => (
                  <tr key={t._id}>
                    <td>{t.name}</td>
                    <td>{t.type}</td>
                    <td className="xp-cell">+{t.xpReward}</td>
                    <td>{t.completedAt ? new Date(t.completedAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </motion.div>
    </div>
  );
}
