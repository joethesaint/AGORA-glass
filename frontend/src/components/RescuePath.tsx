'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Lock, ArrowRight } from 'lucide-react';

interface RescuePathProps {
  stage: 'idle' | 'pinning' | 'releasing' | 'bridging' | 'complete';
}

const steps = [
  { id: 'pinning', label: 'Arc Pinning', icon: Shield },
  { id: 'releasing', label: 'Vault Release', icon: Lock },
  { id: 'bridging', label: 'Gateway Transfer', icon: Zap },
];

export const RescuePath = ({ stage }: RescuePathProps) => {
  return (
    <div className="agora-card p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Rescue Pipeline</h3>
        <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-[#8A93A3] font-mono">
          E2E LATENCY: DYNAMIC
        </div>
      </div>
      
      <div className="flex items-center justify-between relative px-2 pt-2">
        {/* Connecting Line removed due to artifacts */}
        
        {steps.map((step, index) => {
          const isActive = stage === step.id || stage === 'complete';
          const isCurrent = stage === step.id;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-3 relative z-10">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isActive ? 'rgba(0, 217, 143, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    borderColor: isActive ? '#00D98F' : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#00D98F' : '#484848',
                    scale: isCurrent ? 1.15 : 1,
                    boxShadow: isActive ? '0 0 15px rgba(0, 217, 143, 0.2)' : 'none'
                  }}
                  className="p-3 rounded-xl border transition-colors flex items-center justify-center"
                >
                  <step.icon className="w-5 h-5" />
                  {isCurrent && (
                    <motion.div 
                      layoutId="active-glow"
                      className="absolute inset-0 rounded-xl bg-[#00D98F]/20 blur-md -z-10"
                    />
                  )}
                </motion.div>
                <div className="flex flex-col items-center">
                  <span className={`text-[9px] font-bold uppercase tracking-tighter transition-colors ${isActive ? 'text-white' : 'text-[#484848]'}`}>
                    {step.label}
                  </span>
                  {isActive && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[8px] text-[#00D98F] font-mono mt-0.5"
                    >
                      VERIFIED
                    </motion.span>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 px-4 pb-8 flex items-center justify-center">
                  <motion.div 
                    animate={{ 
                      opacity: stage === 'complete' || (isActive && stage !== step.id) ? 1 : 0.2,
                      backgroundColor: stage === 'complete' || (isActive && stage !== step.id) ? '#00D98F' : 'rgba(255, 255, 255, 0.05)'
                    }}
                    className="h-[1px] w-full"
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
