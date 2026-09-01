'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Lock, Eye, Terminal, Globe, ArrowRight, ExternalLink } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="p-8 max-w-7xl mx-auto space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest"
        >
          <Shield className="w-3 h-3" /> The Antigravity Protocol
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl lg:text-6xl font-black tracking-tighter glass-text"
        >
          GLASS
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted max-w-2xl mx-auto leading-relaxed"
        >
          An autonomous, ultra-low-latency risk management agent designed to protect perpetual futures traders from liquidations in under 500ms.
        </motion.p>
      </section>

      {/* The Core Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Zap className="w-6 h-6 text-accent" />}
          title="Sub-500ms Rescue"
          description="In high-volatility markets, human reaction times are too slow. GLASS acts as your automated financial bodyguard, detecting risk and injecting margin instantly."
        />
        <FeatureCard 
          icon={<Eye className="w-6 h-6 text-pos" />}
          title="Glass-Box Transparency"
          description="Every decision generates a cryptographic reasoning trace pinned to the Arc blockchain. Unlike 'black-box' bots, GLASS proves exactly why it moved funds."
        />
        <FeatureCard 
          icon={<Lock className="w-6 h-6 text-purple-500" />}
          title="Agentic Security"
          description="Leveraging Circle's Agent Stack and MPC wallets, GLASS operates under strict user-defined policies, ensuring funds are only accessed for emergency rescues."
        />
      </section>

      {/* How it Works */}
      <section className="agora-card p-12 space-y-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">The Rescue Protocol</h2>
          <p className="text-muted max-w-xl mx-auto">A seamless integration between the Arc and Circle stacks.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
          <Step 
            number="01" 
            title="Fund the Vault" 
            desc="Deposit USDC into the AGORA smart contract. This reserve is isolated and only used for emergency margin injection."
          />
          <Step 
            number="02" 
            title="Sentinel Monitoring" 
            desc="The Python-based sentinel monitors your perp positions 24/7 with direct WebSocket feeds from the exchange."
          />
          <Step 
            number="03" 
            title="Reasoning Proof" 
            desc="If a risk threshold is breached, the agent generates a reasoning trace and pins the hash to the Arc Network."
          />
          <Step
            number="04"
            title="Instant Transfer"
            desc="USDC is moved via Circle's Developer-Controlled Wallets and injected as margin into your position, targeting sub-500ms end-to-end."
          />
        </div>
      </section>

      {/* Technical Stack */}
      <section className="space-y-8">
        <h3 className="text-sm font-bold text-[#484848] uppercase tracking-[0.3em] text-center">Engineered with</h3>
        <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
          <TechBadge name="Arc Network" />
          <TechBadge name="Circle SDK" />
          <TechBadge name="Next.js" />
          <TechBadge name="Python asyncio" />
          <TechBadge name="Solidity" />
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center pb-12">
        <a 
          href="https://github.com/joethesaint/AGORA-glass" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all group"
        >
          View Technical Docs <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </section>
    </main>
  );
}

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="agora-card p-8 space-y-4"
  >
    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white">{title}</h3>
    <p className="text-sm text-muted leading-relaxed">{description}</p>
  </motion.div>
);

const Step = ({ number, title, desc }: { number: string, title: string, desc: string }) => (
  <div className="space-y-4">
    <div className="text-4xl font-black text-white/10 tracking-tighter">{number}</div>
    <h4 className="text-lg font-bold text-white">{title}</h4>
    <p className="text-xs text-muted leading-relaxed">{desc}</p>
  </div>
);

const TechBadge = ({ name }: { name: string }) => (
  <span className="text-xs font-mono font-bold tracking-widest text-muted">{name}</span>
);
