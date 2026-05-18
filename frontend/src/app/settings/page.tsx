'use client';

import { useState } from 'react';
import { Save, RotateCcw, Bell, Wifi, Palette, Shield, ChevronRight } from 'lucide-react';

interface SettingsSection {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SettingsSection = ({ title, icon, children }: SettingsSection) => (
  <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-6 space-y-6">
    <div className="flex items-center gap-3 pb-4 border-b border-[#1e1e1e]">
      <div className="text-[#00A3FF]">{icon}</div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
    {children}
  </div>
);

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Toggle = ({ label, description, checked, onChange }: ToggleProps) => (
  <div className="flex items-center justify-between">
    <div className="space-y-1">
      <p className="text-sm font-medium text-white">{label}</p>
      <p className="text-xs text-[#8A93A3]">{description}</p>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
        checked ? 'bg-[#00A3FF]' : 'bg-[#1e1e1e]'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out mt-1 ml-1 ${
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
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-[#8A93A3]">{description}</p>
      </div>
      <span className="text-sm font-mono text-[#00A3FF]">
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
      className="w-full h-1 bg-[#1e1e1e] rounded-lg appearance-none cursor-pointer accent-[#00A3FF]"
    />
    <div className="flex justify-between text-xs text-[#484848]">
      <span>
        {min}
        {unit}
      </span>
      <span>
        {max}
        {unit}
      </span>
    </div>
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
  <div className="space-y-2">
    <div>
      <p className="text-sm font-medium text-white">{label}</p>
      <p className="text-xs text-[#8A93A3]">{description}</p>
    </div>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 bg-[#0a0907] border border-[#1e1e1e] rounded-lg text-white text-sm font-mono placeholder-[#484848] focus:outline-none focus:border-[#00A3FF] transition-colors"
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