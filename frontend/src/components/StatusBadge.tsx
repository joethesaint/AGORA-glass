import React from 'react';
import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: 'safe' | 'warning' | 'critical';
  text: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  const styles = {
    safe: 'bg-[#00D98F]/10 text-[#00D98F] border-[#00D98F]/20',
    warning: 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20',
    critical: 'bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]/20 animate-pulse',
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
