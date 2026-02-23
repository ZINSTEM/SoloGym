import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusWindow from '../components/StatusWindow';
import LevelUpModal from '../components/LevelUpModal';

const DAILY_PLACEHOLDERS = [
  { name: 'Drink 2L water', xp: 10, id: 'daily-water' },
  { name: 'Complete 1 workout', xp: 25, id: 'daily-workout' },
  { name: 'Sleep 7+ hours', xp: 15, id: 'daily-sleep' },
];

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [levelUpShow, setLevelUpShow] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const [allRes, dailyRes] = await Promise.all([
        api.get('/tasks?completed=false'),
        api.get('/tasks?type=daily&completed=false'),
      ]);
      setTasks(allRes.data);
      setDailyTasks(dailyRes.data);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleComplete = async (taskId) => {
    try {
      const { data } = await api.post(`/tasks/${taskId}/complete`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      setDailyTasks((prev) => prev.filter((t) => t._id !== taskId));
      updateUser(data.user);
      toast.success(`+${data.xpGained} XP`);
      if (data.leveledUp) {
        setLevelUpLevel(data.user.level);
        setLevelUpShow(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete');
    }
  };

  const displayDaily = dailyTasks.length > 0 ? dailyTasks : DAILY_PLACEHOLDERS.map((d) => ({ ...d, _id: d.id, completed: false }));

  return (
    <div className="page dashboard-page">
      <motion.div
        className="dashboard-layout"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <header className="dashboard-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.displayName || 'Hunter'}.</p>
        </header>

        <div className="dashboard-grid">
          <section className="dashboard-status">
            <StatusWindow user={user} />
          </section>

          <section className="dashboard-missions panel">
            <div className="missions-header">
              <h2 className="glowing-text">Daily missions</h2>
              <Link to="/missions" className="btn">View all</Link>
            </div>
            {loading ? (
              <p className="text-muted">Loading...</p>
            ) : (
              <ul className="missions-list">
                {displayDaily.slice(0, 5).map((t) => (
                  <li key={t._id} className="mission-item">
                    <span className="mission-name">{t.name}</span>
                    <span className="mission-xp">+{t.xpReward ?? t.xp} XP</span>
                    {t.userId && (
                      <button
                        type="button"
                        className="btn btn-small"
                        onClick={() => handleComplete(t._id)}
                      >
                        Complete
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <Link to="/missions?add=1" className="btn btn-primary quick-add-btn">
              + Quick add task
            </Link>
          </section>
        </div>
      </motion.div>

      <LevelUpModal
        show={levelUpShow}
        level={levelUpLevel}
        onClose={() => setLevelUpShow(false)}
      />
    </div>
  );
}
