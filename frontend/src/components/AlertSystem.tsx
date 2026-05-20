'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Bell, AlertTriangle, TrendingDown, Shield, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Alert {
  id: string;
  type: 'margin' | 'rescue' | 'price' | 'system' | 'success';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  positionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AlertSystemProps {
  settings?: {
    marginAlerts: boolean;
    rescueAlerts: boolean;
    priceAlerts: boolean;
    soundEnabled: boolean;
    toastEnabled: boolean;
  };
}

const alertIcons = {
  margin: AlertTriangle,
  rescue: Shield,
  price: TrendingDown,
  system: AlertCircle,
  success: Check,
};

const severityColors = {
  low: 'border-[#8A93A3] text-[#8A93A3]',
  medium: 'border-[#FFB800] text-[#FFB800]',
  high: 'border-[#FF6B35] text-[#FF6B35]',
  critical: 'border-[#FF3B3B] text-[#FF3B3B]',
};

const bgColors = {
  low: 'bg-[#8A93A3]/10',
  medium: 'bg-[#FFB800]/10',
  high: 'bg-[#FF6B35]/10',
  critical: 'bg-[#FF3B3B]/10',
};

export const AlertSystem = ({ settings }: AlertSystemProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState<Alert[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const unreadCount = alerts.filter((a) => !a.read).length;

  // Initialize audio for notifications
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    audioRef.current = null;
  }, []);

  const playSound = useCallback(() => {
    if (settings?.soundEnabled) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;

        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
          audioContext.close();
        }, 200);
      } catch (e) {
        console.error('Failed to play notification sound', e);
      }
    }
  }, [settings?.soundEnabled]);

  const showToast = useCallback((alert: Alert) => {
    if (settings?.toastEnabled) {
      setToasts((prev) => [...prev, alert]);
      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((a) => a.id !== alert.id));
      }, 5000);
    }
  }, [settings?.toastEnabled]);

  const addAlert = useCallback((alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => {
    const newAlert: Alert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
    };

    setAlerts((prev) => [newAlert, ...prev].slice(0, 50)); // Keep last 50 alerts
    playSound();
    showToast(newAlert);

    return newAlert.id;
  }, [playSound, showToast]);

  const markAsRead = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    setToasts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setAlerts([]);
    setToasts([]);
  }, []);

  // Expose addAlert globally for other components to use
  useEffect(() => {
    (window as any).__AGORA_ALERTS__ = { addAlert };
    
    // Process queued alerts
    while (alertQueue.length > 0) {
      const queuedAlert = alertQueue.shift();
      addAlert(queuedAlert);
    }
    
    return () => {
      delete (window as any).__AGORA_ALERTS__;
    };
  }, [addAlert]);

  // Monitor positions for margin alerts
  const checkMarginAlerts = useCallback((positions: any[], threshold: number, criticalThreshold: number) => {
    if (!settings?.marginAlerts) return;

    positions.forEach((position) => {
      if (position.marginRatio < criticalThreshold) {
        addAlert({
          type: 'margin',
          title: `Critical: ${position.symbol}`,
          message: `Margin ratio ${formatPercent(position.marginRatio)} is below critical threshold`,
          severity: 'critical',
          positionId: position.id,
        });
      } else if (position.marginRatio < threshold) {
        addAlert({
          type: 'margin',
          title: `Warning: ${position.symbol}`,
          message: `Margin ratio ${formatPercent(position.marginRatio)} is below warning threshold`,
          severity: 'high',
          positionId: position.id,
        });
      }
    });
  }, [settings?.marginAlerts, addAlert]);

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  return (
    <>
      {/* Alert Bell Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 hover:bg-[#1E2532] rounded-lg transition-colors"
        >
          <Bell size={18} className="text-[#8A93A3]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF3B3B] rounded-full text-[10px] text-white flex items-center justify-center font-mono">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Alert Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-12 w-80 lg:w-96 bg-[#0B0E14] border border-[#1E2532] rounded-xl shadow-2xl z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#1E2532]">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Bell size={16} className="text-[#00A3FF]" />
                  Alerts
                  {unreadCount > 0 && (
                    <span className="text-xs text-[#FF3B3B]">({unreadCount})</span>
                  )}
                </h3>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[#8A93A3] hover:text-white transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  {alerts.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-xs text-[#FF3B3B] hover:text-white transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* Alert List */}
              <div className="max-h-80 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell size={32} className="text-[#484848] mx-auto mb-3" />
                    <p className="text-sm text-[#484848]">No alerts</p>
                  </div>
                ) : (
                  alerts.map((alert) => {
                    const Icon = alertIcons[alert.type];
                    return (
                      <div
                        key={alert.id}
                        className={`p-4 border-b border-[#1E2532] hover:bg-[#1E2532]/30 transition-colors ${
                          !alert.read ? 'bg-[#00A3FF]/5' : ''
                        }`}
                        onClick={() => markAsRead(alert.id)}
                      >
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-lg border ${severityColors[alert.severity]} ${bgColors[alert.severity]}`}>
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-white truncate">
                                {alert.title}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissAlert(alert.id);
                                }}
                                className="text-[#484848] hover:text-white flex-shrink-0"
                              >
                                <X size={12} />
                              </button>
                            </div>
                            <p className="text-xs text-[#8A93A3] mt-1 line-clamp-2">
                              {alert.message}
                            </p>
                            <p className="text-[10px] text-[#484848] mt-2">
                              {formatTime(alert.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = alertIcons[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                className={`flex items-center gap-3 p-4 bg-[#0B0E14] border border-[#1E2532] rounded-xl shadow-2xl max-w-sm ${bgColors[toast.severity]}`}
              >
                <div className={`p-2 rounded-lg border ${severityColors[toast.severity]}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{toast.title}</p>
                  <p className="text-xs text-[#8A93A3] truncate">{toast.message}</p>
                </div>
                <button
                  onClick={() => dismissAlert(toast.id)}
                  className="text-[#484848] hover:text-white flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
};

// Alert queue for early calls
const alertQueue: any[] = [];

// Export a hook-like function for other components to trigger alerts
export const triggerAlert = (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => {
  if ((window as any).__AGORA_ALERTS__?.addAlert) {
    return (window as any).__AGORA_ALERTS__.addAlert(alert);
  }
  // If not ready, queue it
  alertQueue.push(alert);
  return null;
};