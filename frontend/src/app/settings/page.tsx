'use client';

import { useState } from 'react';
import { Save, RotateCcw, Bell, Wifi, Palette, Shield, ChevronRight, Info } from 'lucide-react';

interface SettingsSection {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SettingsSection = ({ title, icon, children }: SettingsSection) => (
  <div className="agora-card p-5 space-y-4">
    <div className="flex items-center gap-3 pb-3 border-b border-white/5">
      <div className="text-[#00A3FF]">{icon}</div>
      <h2 className="text-base font-bold text-white uppercase tracking-wider">{title}</h2>
    </div>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Toggle = ({ label, description, checked, onChange }: ToggleProps) => (
  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5 group">
    <div className="space-y-0.5">
      <p className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{label}</p>
      <p className="text-[11px] text-[#8A93A3]">{description}</p>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-all duration-300 ease-in-out ${
        checked ? 'bg-[#00A3FF] shadow-[0_0_10px_rgba(0,163,255,0.4)]' : 'bg-white/10'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-3 h-3 transform bg-white rounded-full transition-all duration-300 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

interface SliderProps {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

const Slider = ({ label, description, value, min, max, step, unit, onChange }: SliderProps) => (
  <div className="p-3 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5 group space-y-3">
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{label}</p>
        <p className="text-[11px] text-[#8A93A3]">{description}</p>
      </div>
      <span className="text-sm font-mono font-bold text-[#00A3FF] bg-[#00A3FF]/10 px-2 py-0.5 rounded">
        {value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00A3FF]"
    />
  </div>
);

interface InputProps {
  label: string;
  description: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (value: string) => void;
}

const Input = ({ label, description, value, placeholder, type = 'text', onChange }: InputProps) => (
  <div className="p-3 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5 group space-y-2">
    <div className="space-y-0.5">
      <p className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{label}</p>
      <p className="text-[11px] text-[#8A93A3]">{description}</p>
    </div>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs font-mono placeholder-white/20 focus:outline-none focus:border-[#00A3FF]/50 transition-all"
    />
  </div>
);

interface SelectProps {
  label: string;
  description: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

const Select = ({ label, description, value, options, onChange }: SelectProps) => (
  <div className="space-y-2">
    <div>
      <p className="text-sm font-medium text-white">{label}</p>
      <p className="text-xs text-[#8A93A3]">{description}</p>
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 bg-[#0a0907] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#00A3FF] transition-colors appearance-none cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const colorOptions = [
  { value: '#00A3FF', label: 'Blue' },
  { value: '#00D98F', label: 'Green' },
  { value: '#d4ff3e', label: 'Neon' },
  { value: '#FF6B35', label: 'Orange' },
  { value: '#FF3B3B', label: 'Red' },
  { value: '#A855F7', label: 'Purple' },
];

export default function SettingsPage() {
  // Connection Settings
  const [wsUrl, setWsUrl] = useState('ws://localhost:8765');
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [reconnectInterval, setReconnectInterval] = useState(3);

  // Notification Settings
  const [marginAlerts, setMarginAlerts] = useState(true);
  const [rescueAlerts, setRescueAlerts] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastEnabled, setToastEnabled] = useState(true);

  // Risk Settings
  const [marginThreshold, setMarginThreshold] = useState(0.15);
  const [criticalMargin, setCriticalMargin] = useState(0.08);
  const [maxLeverage, setMaxLeverage] = useState(5);
  const [autoDeleverage, setAutoDeleverage] = useState(false);

  // Appearance Settings
  const [accentColor, setAccentColor] = useState('#00A3FF');
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const handleSave = () => {
    // Save settings to localStorage
    const settings = {
      connection: { wsUrl, autoReconnect, reconnectInterval },
      notifications: { marginAlerts, rescueAlerts, priceAlerts, soundEnabled, toastEnabled },
      risk: { marginThreshold, criticalMargin, maxLeverage, autoDeleverage },
      appearance: { accentColor, compactMode, animationsEnabled },
    };
    localStorage.setItem('agora-settings', JSON.stringify(settings));
    // Update CSS variable for accent color
    document.documentElement.style.setProperty('--accent', accentColor);
  };

  const handleReset = () => {
    if (confirm('Reset all settings to defaults?')) {
      localStorage.removeItem('agora-settings');
      window.location.reload();
    }
  };

  return (
    <main className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-[#8A93A3] mt-1">Configure your Sentinel terminal preferences</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#8A93A3] border border-[#1e1e1e] rounded-lg hover:border-[#FF3B3B] hover:text-[#FF3B3B] transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[#00A3FF] text-white rounded-lg hover:bg-[#0088CC] transition-colors"
          >
            <Save size={14} />
            Save Changes
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* About GLASS Section */}
        <div className="lg:col-span-2">
          <SettingsSection
            title="About AGORA-glass"
            icon={<Info size={20} />}
          >
            <div className="p-4 space-y-6">
              <div className="space-y-2">
                <h3 className="text-[#00A3FF] font-bold text-sm uppercase tracking-wider">The Mission</h3>
                <p className="text-sm text-[#8A93A3] leading-relaxed">
                  AGORA-glass is an autonomous, ultra-low-latency risk management agent designed to protect perpetual futures traders from liquidations. In high-volatility markets, human reaction times are often too slow. GLASS acts as your automated "financial bodyguard," detecting risk and injecting margin in under 500ms.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="text-white font-semibold text-sm">1. Fund the Vault</h3>
                  <p className="text-xs text-[#8A93A3]">
                    Deposit USDC into the AGORA smart contract on the Arc blockchain. This reserve is only used for emergency rescues.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-white font-semibold text-sm">2. Configure Risk</h3>
                  <p className="text-xs text-[#8A93A3]">
                    Set your desired margin thresholds and max leverage. The sentinel uses these parameters to monitor your health 24/7.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-white font-semibold text-sm">3. Connect & Protect</h3>
                  <p className="text-xs text-[#8A93A3]">
                    Once connected to the Sentinel bridge, the agent takes over. If a liquidation is imminent, it executes a rescue in ~250ms.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                    <Shield size={14} className="text-[#00A3FF]" />
                    "Glass-Box" Transparency
                  </h3>
                  <p className="text-xs text-[#8A93A3]">
                    Every decision generates a cryptographic reasoning trace pinned to the Arc blockchain. Unlike "black-box" bots, GLASS proves exactly why it moved funds, ensuring total accountability.
                  </p>
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-white font-semibold text-sm">Future Roadmap</h3>
                  <p className="text-xs text-[#8A93A3]">
                    While starting as a single high-performance sentinel, our architecture is built for a decentralized network. Multi-agent consensus will ensure 100% uptime and eliminate single points of failure.
                  </p>
                </div>
              </div>
            </div>
          </SettingsSection>
        </div>

        {/* Connection Settings */}
        <SettingsSection
          title="Connection"
          icon={<Wifi size={20} />}
        >
          <Input
            label="WebSocket URL"
            description="Sentinel bridge connection endpoint"
            value={wsUrl}
            onChange={setWsUrl}
            placeholder="ws://localhost:8765"
          />
          <Toggle
            label="Auto-Reconnect"
            description="Automatically reconnect on connection loss"
            checked={autoReconnect}
            onChange={setAutoReconnect}
          />
          <Slider
            label="Reconnect Interval"
            description="Time between reconnection attempts"
            value={reconnectInterval}
            min={1}
            max={30}
            step={1}
            unit="s"
            onChange={setReconnectInterval}
          />
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection
          title="Notifications"
          icon={<Bell size={20} />}
        >
          <Toggle
            label="Margin Alerts"
            description="Notify when margin ratio approaches threshold"
            checked={marginAlerts}
            onChange={setMarginAlerts}
          />
          <Toggle
            label="Rescue Alerts"
            description="Notify on rescue operations"
            checked={rescueAlerts}
            onChange={setRescueAlerts}
          />
          <Toggle
            label="Price Alerts"
            description="Notify on significant price movements"
            checked={priceAlerts}
            onChange={setPriceAlerts}
          />
          <Toggle
            label="Sound Notifications"
            description="Play sound for critical alerts"
            checked={soundEnabled}
            onChange={setSoundEnabled}
          />
          <Toggle
            label="Toast Notifications"
            description="Show desktop toast notifications"
            checked={toastEnabled}
            onChange={setToastEnabled}
          />
        </SettingsSection>

        {/* Risk Settings */}
        <SettingsSection
          title="Risk Management"
          icon={<Shield size={20} />}
        >
          <Slider
            label="Margin Warning Threshold"
            description="Alert when margin ratio falls below"
            value={marginThreshold}
            min={0.05}
            max={0.5}
            step={0.01}
            unit=""
            onChange={setMarginThreshold}
          />
          <Slider
            label="Critical Margin Level"
            description="Trigger emergency actions below this"
            value={criticalMargin}
            min={0.02}
            max={0.15}
            step={0.01}
            unit=""
            onChange={setCriticalMargin}
          />
          <Slider
            label="Maximum Leverage"
            description="Alert when position leverage exceeds"
            value={maxLeverage}
            min={1}
            max={20}
            step={0.5}
            unit="x"
            onChange={setMaxLeverage}
          />
          <Toggle
            label="Auto-Deleverage"
            description="Automatically reduce leverage when threshold breached"
            checked={autoDeleverage}
            onChange={setAutoDeleverage}
          />
        </SettingsSection>

        {/* Appearance Settings */}
        <SettingsSection
          title="Appearance"
          icon={<Palette size={20} />}
        >
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-white">Accent Color</p>
              <p className="text-xs text-[#8A93A3]">Primary UI color theme</p>
            </div>
            <div className="flex gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setAccentColor(color.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    accentColor === color.value ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>
          <Toggle
            label="Compact Mode"
            description="Reduce spacing for more data density"
            checked={compactMode}
            onChange={setCompactMode}
          />
          <Toggle
            label="Animations"
            description="Enable smooth transitions and animations"
            checked={animationsEnabled}
            onChange={setAnimationsEnabled}
          />
        </SettingsSection>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#111111] border border-[#FF3B3B]/30 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-[#FF3B3B] mb-4 flex items-center gap-2">
          <Shield size={18} />
          Danger Zone
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#FF3B3B]/5 border border-[#FF3B3B]/10 rounded-lg">
            <div>
              <p className="text-sm font-medium text-white">Clear All Data</p>
              <p className="text-xs text-[#8A93A3]">Remove all local data, settings, and cached signals</p>
            </div>
            <button
              onClick={() => {
                if (confirm('This will permanently delete all local data. Continue?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="px-4 py-2 text-sm text-[#FF3B3B] border border-[#FF3B3B] rounded-lg hover:bg-[#FF3B3B] hover:text-white transition-colors"
            >
              Clear Data
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}