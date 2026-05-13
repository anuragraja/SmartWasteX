import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`premium-card ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
