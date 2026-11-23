import React from 'react';
import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: 'safe' | 'warning' | 'critical';
  text: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  const styles = {
    safe: 'bg-pos/10 text-pos border-pos/20',
    warning: 'bg-warn/10 text-warn border-warn/20',
    critical: 'bg-neg/10 text-neg border-neg/20 animate-pulse',
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`px-3 py-1 rounded-none border text-[10px] font-mono tracking-widest ${styles[status]}`}
    >
      {text.toUpperCase()}
    </motion.div>
  );
};
