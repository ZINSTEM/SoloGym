import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TYPES = ['task', 'goal', 'activity', 'daily'];
const DIFFICULTIES = ['easy', 'medium', 'hard', 'extreme'];
const XP_BY_DIFFICULTY = { easy: 10, medium: 30, hard: 75, extreme: 150 };

export default function Missions() {
  const { user, updateUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [levelUpShow, setLevelUpShow] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'task',
    difficulty: 'medium',
    xpReward: 30,
    deadline: '',
  });

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (err) {
      toast.error('Failed to load missions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    if (search.get('add') === '1') setShowForm(true);
  }, []);

  const updateForm = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (field === 'difficulty') {
      setForm((f) => ({ ...f, xpReward: XP_BY_DIFFICULTY[value] ?? 30 }));
    }
  };

  const resetForm = () => {
    setForm({ name: '', type: 'task', difficulty: 'medium', xpReward: 30, deadline: '' });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      deadline: form.deadline || undefined,
    };
    try {
      if (editing) {
        await api.put(`/tasks/${editing._id}`, payload);
        toast.success('Mission updated.');
      } else {
        await api.post('/tasks', payload);
        toast.success('Mission added.');
      }
      resetForm();
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleComplete = async (task) => {
    try {
      const { data } = await api.post(`/tasks/${task._id}/complete`);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
      updateUser(data.user);
      toast.success(`+${data.xpGained} XP`);
      if (data.leveledUp) {
        setLevelUpLevel(data.user.level);
        setLevelUpShow(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleEdit = (task) => {
    setEditing(task);
    setForm({
      name: task.name,
      type: task.type,
      difficulty: task.difficulty,
      xpReward: task.xpReward,
      deadline: task.deadline ? task.deadline.slice(0, 16) : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this mission?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success('Deleted.');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const openForm = () => {
    resetForm();
    setShowForm(true);
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

  return (
    <div className="page missions-page">
      <header className="dashboard-header">
        <h1 className="page-title">Missions</h1>
        <p className="page-subtitle">Add and complete tasks to earn XP.</p>
        <button type="button" className="btn btn-primary" onClick={openForm}>
          + Add mission
        </button>
      </header>

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="panel mission-form-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h2>{editing ? 'Edit mission' : 'New mission'}</h2>
            <form onSubmit={handleSubmit} className="mission-form">
              <label>
                <span>Name</span>
                <input
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  placeholder="e.g. Run 5km"
                  required
                />
              </label>
              <div className="form-row">
                <label>
                  <span>Type</span>
                  <select value={form.type} onChange={(e) => updateForm('type', e.target.value)}>
                    {TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Difficulty</span>
                  <select value={form.difficulty} onChange={(e) => updateForm('difficulty', e.target.value)}>
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label>
                  <span>XP reward</span>
                  <input
                    type="number"
                    min={1}
                    value={form.xpReward}
                    onChange={(e) => updateForm('xpReward', parseInt(e.target.value, 10) || 0)}
                  />
                </label>
                <label>
                  <span>Deadline (optional)</span>
                  <input
                    type="datetime-local"
                    value={form.deadline}
                    onChange={(e) => updateForm('deadline', e.target.value)}
                  />
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="missions-table-wrap panel">
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mission</th>
                <th>Type</th>
                <th>Difficulty</th>
                <th>XP</th>
                <th>Deadline</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-muted">No missions yet. Add one above.</td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t._id}>
                    <td className="mission-name-cell">{t.name}</td>
                    <td>{t.type}</td>
                    <td>{t.difficulty}</td>
                    <td className="xp-cell">+{t.xpReward}</td>
                    <td>{formatDate(t.deadline)}</td>
                    <td>{t.completed ? 'Done' : 'Active'}</td>
                    <td className="actions-cell">
                      {!t.completed && (
                        <>
                          <button type="button" className="btn btn-small" onClick={() => handleComplete(t)}>Complete</button>
                          <button type="button" className="btn btn-small" onClick={() => handleEdit(t)}>Edit</button>
                        </>
                      )}
                      <button type="button" className="btn btn-small btn-danger" onClick={() => handleDelete(t._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {levelUpShow && (
          <motion.div
            className="levelup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLevelUpShow(false)}
          >
            <motion.div
              className="levelup-modal panel"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="levelup-title glowing-text">Level Up!</h2>
              <p className="levelup-level">Level {levelUpLevel}</p>
              <button type="button" className="btn btn-primary" onClick={() => setLevelUpShow(false)}>Continue</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
