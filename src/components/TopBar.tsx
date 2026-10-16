import React from 'react';
import { Bell, ShieldAlert } from 'lucide-react';

interface TopBarProps {
  onOpenAlerts: () => void;
  activeAlertCount: number;
  hasUnhealthyBreach: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenAlerts,
  activeAlertCount,
  hasUnhealthyBreach,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand Wordmark (Single text element wordmark, whitespace-nowrap shrink-0) */}
        <a
          href="/"
          className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2 whitespace-nowrap shrink-0 hover:text-cyan-400 transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          <span>SG AirAlert</span>
        </a>

        {/* Zone 2: Concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a
            href="#map-section"
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Live Radar Map
          </a>
          <a
            href="#regional-grid"
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Regional PSI
          </a>
          <a
            href="#trends-section"
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            24h Trends
          </a>
          <a
            href="#moh-advisory"
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            MOH Advisory
          </a>
          <a
            href="#pollutants-section"
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Air Telemetry
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action (Single line control) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenAlerts}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              hasUnhealthyBreach
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm'
            }`}
          >
            {hasUnhealthyBreach ? (
              <ShieldAlert className="w-3.5 h-3.5" />
            ) : (
              <Bell className="w-3.5 h-3.5" />
            )}
            <span>Configure Alerts</span>
            {activeAlertCount > 0 && (
              <span className="bg-slate-950/20 px-1.5 py-0.5 rounded font-mono text-[10px]">
                {activeAlertCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
