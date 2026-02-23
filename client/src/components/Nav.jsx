import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/status', label: 'Status' },
  { to: '/missions', label: 'Missions' },
  { to: '/profile', label: 'Profile' },
];

export default function Nav() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <motion.nav
      className="nav"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="nav-inner">
        <Link to="/dashboard" className="nav-brand glowing-text">
          SoloGym
        </Link>
        <div className="nav-links">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${location.pathname === to ? 'active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="nav-user">
          <span className="nav-level">Lv.{user?.level ?? 1}</span>
          <button type="button" className="btn btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
