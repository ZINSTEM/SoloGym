import { motion, AnimatePresence } from 'framer-motion';

export default function LevelUpModal({ show, level, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="levelup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="levelup-modal panel"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="levelup-glow" />
            <h2 className="levelup-title glowing-text">Level Up!</h2>
            <p className="levelup-level">Level {level}</p>
            <p className="levelup-msg">You have gained 3 stat points. Allocate them in Status.</p>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
