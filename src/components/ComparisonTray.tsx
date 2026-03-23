import { motion, AnimatePresence } from 'framer-motion'
import { Scale, X, ArrowRight } from 'lucide-react'

interface ComparisonTrayProps {
  compareCount: number
  onCompareClick: () => void
  onClear: () => void
}

export default function ComparisonTray({ compareCount, onCompareClick, onClear }: ComparisonTrayProps) {
  if (compareCount === 0) return null

  return (
    <AnimatePresence>
      {compareCount > 0 && (
        <motion.div
          className="comparison-tray"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="tray-content">
            <div className="tray-info">
              <Scale size={20} className="tray-icon" aria-hidden="true" />
              <div className="tray-text">
                <span className="tray-count">{compareCount} model{compareCount !== 1 ? 's' : ''} selected</span>
                <span className="tray-hint">Ready to compare side-by-side</span>
              </div>
            </div>

            <div className="tray-actions">
              <button className="tray-btn-clear" onClick={onClear} aria-label="Clear comparison selection">
                <X size={18} aria-hidden="true" />
              </button>
              <motion.button
                className="tray-btn-compare"
                onClick={onCompareClick}
                disabled={compareCount < 2}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Compare ${compareCount} models`}
              >
                Compare <ArrowRight size={16} aria-hidden="true" />
              </motion.button>
            </div>
          </div>

          <motion.div
            className="tray-progress"
            initial={{ width: 0 }}
            animate={{ width: compareCount === 1 ? '50%' : '100%' }}
            transition={{ duration: 0.4 }}
            aria-hidden="true"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
