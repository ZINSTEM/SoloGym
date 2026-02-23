import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <motion.div
      className="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="home-content">
        <h1 className="home-title glowing-text">SoloGym Tracker</h1>
        <p className="home-subtitle">
          Level up through real-life training. Complete missions, earn XP, and become the strongest hunter.
        </p>
        <div className="home-actions">
          <Link to="/login">
            <motion.button
              type="button"
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Login
            </motion.button>
          </Link>
          <Link to="/register">
            <motion.button
              type="button"
              className="btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Register
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
