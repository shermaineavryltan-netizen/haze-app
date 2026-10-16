import React, { useState } from 'react';
import { AlertTriangle, Bell, Check, Copy, Info, Radio, Server, Volume2, X } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { AlertRule, RegionKey } from '../types/psi';

interface AlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: AlertRule[];
  onSaveRules: (rules: AlertRule[]) => void;
  onTriggerTestAlert: () => void;
}

export const AlertSettingsModal: React.FC<AlertSettingsModalProps> = ({
  isOpen,
  onClose,
  rules,
  onSaveRules,
  onTriggerTestAlert,
}) => {
  const [localRules, setLocalRules] = useState<AlertRule[]>(rules);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'serverless'>('rules');
  const [permState, setPermState] = useState<NotificationPermission>(notificationService.getPermission());

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const perm = await notificationService.requestPermission();
    setPermState(perm);
    if (perm === 'granted') {
      notificationService.sendBrowserNotification(
        '🔔 SG AirAlert Connected',
        'Push notifications are now enabled. You will receive real-time alerts when Singapore PSI exceeds your chosen threshold.'
      );
    }
  };

  const handleToggleRule = (id: string) => {
    const updated = localRules.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    setLocalRules(updated);
    onSaveRules(updated);
  };

  const handleUpdateThreshold = (id: string, threshold: number) => {
    const updated = localRules.map(r => (r.id === id ? { ...r, threshold } : r));
    setLocalRules(updated);
    onSaveRules(updated);
  };

  const handleUpdateRegion = (id: string, region: RegionKey | 'all') => {
    const updated = localRules.map(r => (r.id === id ? { ...r, region } : r));
    setLocalRules(updated);
    onSaveRules(updated);
  };

  const handleTogglePush = (id: string) => {
    const updated = localRules.map(r => (r.id === id ? { ...r, pushEnabled: !r.pushEnabled } : r));
    setLocalRules(updated);
    onSaveRules(updated);
  };

  const handleToggleSound = (id: string) => {
    const updated = localRules.map(r => (r.id === id ? { ...r, soundEnabled: !r.soundEnabled } : r));
    setLocalRules(updated);
    onSaveRules(updated);
  };

  const serverlessSnippet = `// Singapore NEA PSI Monitor - Serverless Handler (AWS Lambda / Google Cloud Functions)
// Runs every 15 minutes via Cloud Scheduler or EventBridge
const https = require('https');

exports.handler = async (event) => {
  const NEA_URL = 'https://api.data.gov.sg/v1/environment/psi';

  const data = await new Promise((resolve, reject) => {
    https.get(NEA_URL, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    }).on('error', reject);
  });

  const readings = data.items[0].readings.psi_twenty_four_hourly;
  const THRESHOLD = 100; // Singapore Unhealthy Threshold
  const alerts = [];

  for (const [region, psi] of Object.entries(readings)) {
    if (psi >= THRESHOLD) {
      alerts.push({ region, psi, status: 'UNHEALTHY' });
    }
  }

  if (alerts.length > 0) {
    console.log('[ALERT BREACH]', JSON.stringify(alerts));
    // Dispatch to WebPush / Firebase Cloud Messaging / Telegram Webhook:
    // await sendWebPushNotification({ title: 'Unhealthy PSI in Singapore', alerts });
  }

  return { statusCode: 200, breached: alerts.length > 0, alerts };
};`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(serverlessSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Air Quality Alert Engine & Push Rules
              </h2>
              <p className="text-xs text-slate-400">
                Configure immediate browser push notifications and unhealthy threshold triggers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/30">
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Alert Rules & Permissions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('serverless')}
            className={`px-4 py-2 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'serverless'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Serverless Backend Bridge (Next Step)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'rules' ? (
            <>
              {/* Web Push Notification Permission Card */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-semibold text-slate-200">
                      Browser Push Notifications
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                        permState === 'granted'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : permState === 'denied'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {permState.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-md">
                    Receive instant system notifications on desktop or mobile when air quality reaches hazardous or unhealthy bands.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {permState !== 'granted' ? (
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      className="px-3.5 py-1.5 text-xs font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg shadow-sm transition-colors"
                    >
                      Grant Permission
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                      <Check className="w-3.5 h-3.5" />
                      Active & Receiving
                    </div>
                  )}
                </div>
              </div>

              {/* Alert Rules List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Threshold Trigger Rules
                  </h3>
                  <button
                    type="button"
                    onClick={() => notificationService.playAlertSound('test')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Preview Audio Chime
                  </button>
                </div>

                {localRules.map(rule => (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-xl border transition-all ${
                      rule.enabled
                        ? 'border-slate-750 bg-slate-950/70'
                        : 'border-slate-800/60 bg-slate-950/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`rule-enable-${rule.id}`}
                          checked={rule.enabled}
                          onChange={() => handleToggleRule(rule.id)}
                          className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-slate-900 bg-slate-800 cursor-pointer"
                        />
                        <label
                          htmlFor={`rule-enable-${rule.id}`}
                          className="text-sm font-medium text-slate-200 cursor-pointer"
                        >
                          {rule.name}
                        </label>
                      </div>

                      {/* Push & Sound Toggles */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePush(rule.id)}
                          className={`p-1.5 rounded-md border text-xs flex items-center gap-1 transition-colors ${
                            rule.pushEnabled
                              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}
                          title="Toggle Web Push"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Push</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleSound(rule.id)}
                          className={`p-1.5 rounded-md border text-xs flex items-center gap-1 transition-colors ${
                            rule.soundEnabled
                              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}
                          title="Toggle Sound"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Sound</span>
                        </button>
                      </div>
                    </div>

                    {/* Rule Parameter Controls */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Trigger Threshold ({rule.metric === 'psi' ? 'PSI value' : 'PM2.5 µg/m³'}):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={rule.metric === 'psi' ? 50 : 15}
                            max={rule.metric === 'psi' ? 300 : 200}
                            step={5}
                            value={rule.threshold}
                            onChange={e => handleUpdateThreshold(rule.id, Number(e.target.value))}
                            className="w-full accent-cyan-400 cursor-pointer"
                          />
                          <span className="text-xs font-mono font-bold text-slate-200 tabular-nums min-w-[36px]">
                            ≥ {rule.threshold}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Monitored Geographic Sector:
                        </label>
                        <select
                          value={rule.region}
                          onChange={e => handleUpdateRegion(rule.id, e.target.value as RegionKey | 'all')}
                          className="w-full bg-slate-900 border border-slate-750 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="all">Island-wide (Any Sector)</option>
                          <option value="south">South Region (Sentosa, Marina Bay, CBD)</option>
                          <option value="central">Central Region (Bishan, Orchard)</option>
                          <option value="north">North Region (Woodlands, Yishun)</option>
                          <option value="east">East Region (Changi, Tampines)</option>
                          <option value="west">West Region (Jurong, Tuas)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Immediate Test Trigger Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div className="text-xs text-slate-400">
                  Want to verify alerts right now? Dispatch a live simulated unhealthy surge notification.
                </div>
                <button
                  type="button"
                  onClick={onTriggerTestAlert}
                  className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-sm flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Dispatch Test Push Alert
                </button>
              </div>
            </>
          ) : (
            /* Serverless Integration Blueprint */
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-xs text-cyan-200">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  As requested, this front-end is fully equipped with live client-side NEA API polling and Web Push triggers. When you are ready to deploy a 24/7 serverless cron backend (AWS Lambda, Cloudflare Worker, or Cloud Run), use the production template below.
                </p>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-t-lg">
                  <span className="text-[11px] font-mono text-slate-400">lambda_psi_cron.js</span>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedCode ? 'Copied' : 'Copy Code'}
                  </button>
                </div>
                <pre className="p-4 bg-slate-950/90 border-x border-b border-slate-800 rounded-b-lg text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[280px]">
                  {serverlessSnippet}
                </pre>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Backend Integration Schema:</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li>Direct NEA Public API Endpoint: <code className="text-cyan-400 font-mono">https://api.data.gov.sg/v1/environment/psi</code></li>
                  <li>Polling Cadence: Recommended every 10–15 minutes (NEA updates on the hour).</li>
                  <li>Delivery targets: WebPush (VAPID keys), Telegram Bot API, or Firebase Cloud Messaging.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
