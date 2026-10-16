import React from 'react';
import { AlertOctagon, ExternalLink, X } from 'lucide-react';
import { AlertNotificationLog } from '../types/psi';

interface ActiveAlertBannerProps {
  alerts: AlertNotificationLog[];
  onDismiss: (id: string) => void;
  onOpenSettings: () => void;
}

export const ActiveAlertBanner: React.FC<ActiveAlertBannerProps> = ({
  alerts,
  onDismiss,
  onOpenSettings,
}) => {
  if (alerts.length === 0) return null;

  const primaryAlert = alerts[0];
  const isCritical = primaryAlert.value >= 200;

  return (
    <div
      className={`border-b transition-all ${
        isCritical
          ? 'bg-rose-950/70 border-rose-600/50 text-rose-200'
          : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-1.5 rounded-lg shrink-0 ${
              isCritical
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-xs tracking-wide uppercase text-slate-100">
                {primaryAlert.title}
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="font-mono text-xs tabular-nums font-bold text-white">
                {primaryAlert.metric === 'psi' ? 'PSI' : 'PM2.5'} {primaryAlert.value}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
              {primaryAlert.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <a
            href="#moh-advisory"
            className="text-xs underline hover:text-white transition-colors flex items-center gap-1"
          >
            View MOH Health Guidelines
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            type="button"
            onClick={onOpenSettings}
            className="px-2.5 py-1 text-xs bg-slate-900/80 border border-slate-750 hover:bg-slate-800 rounded-md transition-colors"
          >
            Alert Settings
          </button>
          <button
            type="button"
            onClick={() => onDismiss(primaryAlert.id)}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Dismiss Alert Banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
