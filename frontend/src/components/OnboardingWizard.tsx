import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Lock, ArrowRight, CheckCircle2, Info, LayoutGrid, BarChart3, Radio } from 'lucide-react';
import { useWalletStore } from '@/stores/walletStore';

interface OnboardingWizardProps {
  onComplete: (data: { account: string; vaultAmount: string; isMock: boolean }) => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0); // 0: Landing/About, 1: HL Config, 2: Wallet, 3: Review
  const { isConnected, connect, isConnecting, address } = useWalletStore();
  
  const [hlAccount, setHlAccount] = useState('');
  const [vaultAmount, setVaultAmount] = useState('500');
  const [isMock, setIsMock] = useState(false);

  // Check for mock_user trigger
  useEffect(() => {
    if (hlAccount.toLowerCase() === 'mock_user' || vaultAmount.toLowerCase() === 'mock_user') {
      setIsMock(true);
    } else {
      setIsMock(false);
    }
  }, [hlAccount, vaultAmount]);

  // Skip landing step if wallet is already connected but onboarding isn't finished
  useEffect(() => {
    if (isConnected && step === 0) {
      setStep(1);
    }
  }, [isConnected, step]);

  const handleNext = () => {
    if (step === 1 && !hlAccount && !isMock) {
      alert('Please enter your Hyperliquid account or "mock_user" to continue.');
      return;
    }
    if (step === 3) {
      onComplete({ 
        account: isMock ? '0xMOCK_SENTINEL_TARGET' : hlAccount, 
        vaultAmount: isMock ? '5000' : vaultAmount,
        isMock 
      });
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const containerVariants = {
    initial: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.1 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-6 overflow-hidden relative text-white">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00A3FF]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div 
            key="about"
            variants={containerVariants}
            initial="initial"
            animate="visible"
            exit="exit"
            className="max-w-4xl w-full space-y-12 z-10"
          >
            <div className="text-center space-y-4 group">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00A3FF]/10 border border-[#00A3FF]/20 text-[#00A3FF] text-[10px] font-bold uppercase tracking-widest mb-4 hover:bg-[#00A3FF]/20 transition-all cursor-default">
                <Radio className="w-3 h-3 animate-pulse" />
                Live Network Protocol
              </div>
              <h1 className="text-6xl lg:text-9xl font-black tracking-tighter text-white transition-all duration-700 group-hover:drop-shadow-[0_0_35px_rgba(255,255,255,0.4)] uppercase">
                <span className="glass-text group-hover:text-white group-hover:drop-shadow-[0_0_40px_rgba(255,255,255,0.9)] transition-all duration-500">GLASS</span>
              </h1>
              <p className="text-xl text-[#8A93A3] max-w-2xl mx-auto leading-relaxed font-mono font-bold transition-all duration-500 group-hover:text-white/80">
                The original autonomous machine. Protecting retail traders from liquidation cascades with verifiable, sub-second rescue logic.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  icon: Shield, 
                  title: "Safety First", 
                  desc: "Maintains a 12% margin ratio safety band automatically via Circle Gateway." 
                },
                { 
                  icon: LayoutGrid, 
                  title: "Glass-Box Trace", 
                  desc: "Every rescue decision is pinned to the Arc blockchain for verifiable accountability." 
                },
                { 
                  icon: Zap, 
                  title: "Sub-500ms Rescue", 
                  desc: "Optimized for speed using Circle's cross-chain transfers and Arc's fast finality." 
                }
              ].map((feature, i) => (
                <div key={i} className="agora-card p-6 space-y-3 border-white/5 hover:border-[#00A3FF]/40 transition-all group cursor-default">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#00A3FF]/20 transition-all">
                    <feature.icon className="w-5 h-5 text-[#00A3FF]" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight text-white group-hover:text-[#00A3FF] transition-colors uppercase">{feature.title}</h3>
                  <p className="text-sm font-mono text-[#8A93A3] leading-relaxed group-hover:text-white/70 transition-colors">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-8">
              <button 
                onClick={handleNext}
                className="group relative flex items-center gap-3 px-12 py-6 bg-[#00A3FF] text-white rounded-2xl font-black text-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,163,255,0.4)] uppercase tracking-tighter"
              >
                PROTECT MY POSITIONS
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {step > 0 && (
          <motion.div 
            key="wizard"
            variants={containerVariants}
            initial="initial"
            animate="visible"
            exit="exit"
            className="max-w-md w-full agora-card p-8 space-y-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
              <div 
                className="h-full bg-[#00A3FF] transition-all duration-500" 
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {step === 1 && "Configure Monitoring"}
                {step === 2 && "Connect Rescue Vault"}
                {step === 3 && "Review & Deploy"}
              </h2>
              <p className="text-sm text-[#8A93A3]">
                Step {step} of 3
              </p>
            </div>

            <div className="space-y-6 text-left">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8A93A3] uppercase tracking-widest">
                      Hyperliquid Account Address
                    </label>
                    <input 
                      type="text"
                      placeholder="0x... (or type 'mock_user')"
                      value={hlAccount}
                      onChange={(e) => setHlAccount(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00A3FF] transition-colors font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8A93A3] uppercase tracking-widest">
                      Vault Deposit (USDC)
                    </label>
                    <input 
                      type="text"
                      placeholder="500"
                      value={vaultAmount}
                      onChange={(e) => setVaultAmount(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00A3FF] transition-colors font-mono"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-[#8A93A3] leading-relaxed">
                    The Sentinel requires a Circle Wallet to manage the rescue funds and sign Arc transactions.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => !isMock && connect('web2')}
                      disabled={isConnecting}
                      className={`flex flex-col items-start p-4 rounded-xl border transition-all ${
                        address?.includes('Circle') || (isMock && address)
                        ? 'bg-[#00A3FF]/10 border-[#00A3FF] text-white' 
                        : 'bg-white/5 border-white/10 text-[#8A93A3] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-sm text-white">Modular Wallet (Circle)</span>
                        {address?.includes('Circle') && <CheckCircle2 className="w-4 h-4 text-[#00A3FF]" />}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-mono">Web2 Flow • Passkeys / PIN</span>
                    </button>

                    <button 
                      onClick={() => !isMock && connect('web3')}
                      disabled={isConnecting}
                      className={`flex flex-col items-start p-4 rounded-xl border transition-all ${
                        address?.includes('Web3')
                        ? 'bg-[#00A3FF]/10 border-[#00A3FF] text-white' 
                        : 'bg-white/5 border-white/10 text-[#8A93A3] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-sm text-white">External Wallet</span>
                        {address?.includes('Web3') && <CheckCircle2 className="w-4 h-4 text-[#00A3FF]" />}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-mono">Web3 Flow • Metamask / Coinbase</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-[#8A93A3] uppercase font-bold">Target Account</span>
                      <span className="text-white">{isMock ? 'MOCK_SENTINEL_TARGET' : hlAccount.slice(0, 8) + '...'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-[#8A93A3] uppercase font-bold">Vault Allocation</span>
                      <span className="text-[#00A3FF] font-bold">${vaultAmount} USDC</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-[#8A93A3] uppercase font-bold">Deployment Mode</span>
                      <span className={`font-bold px-2 py-0.5 rounded ${isMock ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                        {isMock ? 'SIMULATION' : 'LIVE PROTOCOL'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button 
                onClick={handleBack}
                className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors uppercase tracking-widest"
              >
                Back
              </button>
              <button 
                onClick={handleNext}
                disabled={step === 2 && !address && !isMock}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#00A3FF] disabled:opacity-50 disabled:grayscale text-white rounded-xl font-bold text-sm hover:bg-[#008BDB] transition-all shadow-[0_0_20px_rgba(0,163,255,0.3)] uppercase tracking-widest"
              >
                {step === 3 ? "Start Sentinel" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="absolute bottom-8 left-0 w-full pointer-events-none">
        <div className="container mx-auto px-6 text-center text-[10px] text-[#484848]">
          <p className="font-bold text-[#8A93A3] mb-1 tracking-widest uppercase">GLASS</p>
          <p>Gateway Liquidation Autonomous Safety Sentinel</p>
        </div>
      </footer>
    </div>
  );
}
