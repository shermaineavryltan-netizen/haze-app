import React from 'react';
import { RefreshCw, RotateCcw, Sliders } from 'lucide-react';
import { RegionKey } from '../types/psi';

interface SimulationControlsProps {
  isSimulating: boolean;
  simulationPreset: string | null;
  onApplyPreset: (
    name: string,
    psiValues: Record<RegionKey, number>,
    pm25Values: Record<RegionKey, number>
  ) => void;
  onResetToLive: () => void;
  onRefreshLive: () => void;
  isLoadingLive: boolean;
  lastUpdated: string;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isSimulating,
  simulationPreset,
  onApplyPreset,
  onResetToLive,
  onRefreshLive,
  isLoadingLive,
  lastUpdated,
}) => {
  const handleClearDay = () => {
    onApplyPreset(
      'Clear & Good (PSI 38)',
      { national: 38, south: 42, central: 36, north: 34, east: 35, west: 40 },
      { national: 9, south: 11, central: 8, north: 7, east: 8, west: 10 }
    );
  };

  const handleModerateDay = () => {
    onApplyPreset(
      'Moderate Singapore (PSI 72)',
      { national: 72, south: 78, central: 69, north: 65, east: 68, west: 79 },
      { national: 24, south: 28, central: 22, north: 20, east: 21, west: 29 }
    );
  };

  const handleUnhealthySurge = () => {
    // Triggers Unhealthy Alert (PSI >= 101 threshold breach in South / Sentosa!)
    onApplyPreset(
      'Unhealthy Surge - South / Sentosa (PSI 148)',
      { national: 112, south: 148, central: 108, north: 85, east: 95, west: 128 },
      { national: 68, south: 84, central: 64, north: 48, east: 54, west: 76 }
    );
  };

  const handleSevereHaze = () => {
    // Triggers Very Unhealthy Emergency (PSI >= 201)
    onApplyPreset(
      'Severe Transboundary Haze (PSI 225)',
      { national: 225, south: 242, central: 218, north: 198, east: 210, west: 236 },
      { national: 165, south: 182, central: 158, north: 142, east: 152, west: 174 }
    );
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Live Status & Refresh */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRefreshLive}
            disabled={isLoadingLive}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Fetch latest readings from data.gov.sg"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLive ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Sync NEA API</span>
          </button>
          <div className="text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Data Source:</span>
              <span className="font-mono text-cyan-300 font-medium">
                {isSimulating ? 'Threshold Simulation Mode' : 'Live NEA (data.gov.sg)'}
              </span>
            </div>
            <div className="text-slate-500 text-[11px] font-mono">
              Observed: {new Date(lastUpdated).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Right: Simulation Scenarios & Testing Suite */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Test Unhealthy Alerts:
          </span>

          <button
            type="button"
            onClick={handleClearDay}
            className={`px-2.5 py-1 text-xs rounded-md border transition-all cursor-pointer ${
              simulationPreset === 'Clear & Good (PSI 38)'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Good (PSI 38)
          </button>

          <button
            type="button"
            onClick={handleModerateDay}
            className={`px-2.5 py-1 text-xs rounded-md border transition-all cursor-pointer ${
              simulationPreset === 'Moderate Singapore (PSI 72)'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Moderate (PSI 72)
          </button>

          <button
            type="button"
            onClick={handleUnhealthySurge}
            className={`px-2.5 py-1 text-xs rounded-md border transition-all shadow-sm cursor-pointer ${
              simulationPreset?.includes('Unhealthy Surge')
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
            }`}
          >
            🚨 Breach Alert: South (PSI 148)
          </button>

          <button
            type="button"
            onClick={handleSevereHaze}
            className={`px-2.5 py-1 text-xs rounded-md border transition-all shadow-sm cursor-pointer ${
              simulationPreset?.includes('Severe Transboundary')
                ? 'bg-rose-600 text-white border-rose-400 font-bold'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
            }`}
          >
            ⚠️ Severe Haze (PSI 225)
          </button>

          {isSimulating && (
            <button
              type="button"
              onClick={onResetToLive}
              className="px-2.5 py-1 text-xs rounded-md border border-slate-700 bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to Live
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
