/**
 * Web Notification & Audio Alert Service for SG AirAlert
 * Handles browser push notifications, Web Audio synthesized warning chimes,
 * and rule threshold evaluations.
 */

import { AlertNotificationLog, AlertRule, HealthBand, RegionKey } from '../types/psi';
import { SINGAPORE_REGIONS, getHealthBand } from '../utils/constants';

class NotificationService {
  private audioContext: AudioContext | null = null;
  private lastAlertTimestamp: Record<string, number> = {};

  /**
   * Check if the browser supports standard Web Notifications
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Current notification permission state
   */
  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Request permission from the user
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  }

  /**
   * Initialize or resume Web Audio context on user gesture
   */
  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioContext && AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      return this.audioContext;
    } catch {
      return null;
    }
  }

  /**
   * Synthesize audio chime for air quality alerts using pure Web Audio API
   */
  public playAlertSound(type: 'warning' | 'critical' | 'test' = 'warning'): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.25, now);
      masterGain.connect(ctx.destination);

      if (type === 'test') {
        // High dual-tone bell
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(659.25, now); // E5
        osc2.frequency.setValueAtTime(880.00, now + 0.1); // A5
        const gain1 = ctx.createGain();
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc1.connect(gain1);
        osc2.connect(gain1);
        gain1.connect(masterGain);
        osc1.start(now);
        osc2.start(now + 0.08);
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
      } else if (type === 'critical') {
        // Urgent 3-pulse alert
        const freqs = [880, 740, 880];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + idx * 0.18;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.2, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(start);
          osc.stop(start + 0.16);
        });
      } else {
        // Standard gentle warning chime
        const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5 chord
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + idx * 0.12;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.25, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(start);
          osc.stop(start + 0.4);
        });
      }
    } catch {
      // Audio playback suppressed or unsupported
    }
  }

  /**
   * Dispatch a browser notification if permitted
   */
  public sendBrowserNotification(title: string, body: string, tag = 'psi-alert'): void {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return;
    }
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag,
      });
    } catch {
      // Browser notification failed or background restricted
    }
  }

  /**
   * Evaluate whether current regional readings violate user-configured rules
   */
  public evaluateRules(
    readings: {
      psi: Record<RegionKey, number>;
      pm25: Record<RegionKey, number>;
    },
    rules: AlertRule[],
    options: { forceTrigger?: boolean; cooldownMs?: number } = {}
  ): AlertNotificationLog[] {
    const cooldownMs = options.cooldownMs ?? 15 * 60 * 1000; // 15 mins default cooldown per rule-region
    const nowMs = Date.now();
    const triggeredAlerts: AlertNotificationLog[] = [];
    const activeRules = rules.filter(r => r.enabled);

    if (activeRules.length === 0) return [];

    const regionKeys: RegionKey[] = ['north', 'south', 'east', 'west', 'central', 'national'];

    for (const rule of activeRules) {
      const targetRegions = rule.region === 'all' ? regionKeys : [rule.region];

      for (const regKey of targetRegions) {
        const val = rule.metric === 'psi' ? readings.psi[regKey] : readings.pm25[regKey];
        if (typeof val !== 'number') continue;

        if (val >= rule.threshold) {
          const dedupeKey = `${rule.id}_${regKey}`;
          const lastFired = this.lastAlertTimestamp[dedupeKey] || 0;

          if (options.forceTrigger || (nowMs - lastFired) > cooldownMs) {
            this.lastAlertTimestamp[dedupeKey] = nowMs;
            const bandConfig = getHealthBand(rule.metric === 'psi' ? val : Math.round(val * 1.5));
            const regName = SINGAPORE_REGIONS[regKey].name;
            const metricLabel = rule.metric === 'psi' ? '24-hr PSI' : '1-hr PM2.5';
            const unit = rule.metric === 'psi' ? '' : ' µg/m³';

            const title = `🚨 ${bandConfig.label} Air Quality Alert: ${regName}`;
            const message = `${metricLabel} has breached threshold (${val}${unit} ≥ ${rule.threshold}${unit}). ${bandConfig.summary}`;

            const alertLog: AlertNotificationLog = {
              id: `alert-${nowMs}-${Math.random().toString(36).slice(2, 7)}`,
              timestamp: new Date().toLocaleTimeString('en-SG', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }),
              region: regKey,
              regionName: regName,
              metric: rule.metric,
              value: val,
              threshold: rule.threshold,
              healthBand: bandConfig.band as HealthBand,
              title,
              message,
              read: false,
            };

            triggeredAlerts.push(alertLog);

            // Trigger push notification if enabled
            if (rule.pushEnabled) {
              this.sendBrowserNotification(title, message, `psi-${regKey}`);
            }

            // Trigger sound if enabled
            if (rule.soundEnabled) {
              this.playAlertSound(val >= 200 ? 'critical' : 'warning');
            }
          }
        }
      }
    }

    return triggeredAlerts;
  }
}

export const notificationService = new NotificationService();
