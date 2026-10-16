import React from 'react';
import { MapPin } from 'lucide-react';
import { FormattedPsiData } from '../services/neaPsiService';
import { RegionKey } from '../types/psi';
import { SINGAPORE_REGIONS, getHealthBand } from '../utils/constants';

interface RegionalGridProps {
  data: FormattedPsiData;
  selectedRegion: RegionKey;
  onSelectRegion: (reg: RegionKey) => void;
}

export const RegionalGrid: React.FC<RegionalGridProps> = ({
  data,
  selectedRegion,
  onSelectRegion,
}) => {
  const regions: RegionKey[] = ['south', 'central', 'north', 'east', 'west'];

  return (
    <div id="regional-grid" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Regional Air Quality Observations
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any regional sector to inspect micro-climate estates and sync interactive map radar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {regions.map(regKey => {
          const regInfo = SINGAPORE_REGIONS[regKey];
          const psi = data.psi[regKey] || 0;
          const pm25 = data.pm25OneHourly[regKey] || 0;
          const healthBand = getHealthBand(psi);
          const isSelected = selectedRegion === regKey;

          return (
            <button
              key={regKey}
              type="button"
              onClick={() => onSelectRegion(regKey)}
              className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? 'border-cyan-400 bg-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              {/* Top ambient colored accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1 transition-opacity"
                style={{ backgroundColor: healthBand.colorHex }}
              />

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {regInfo.name.replace(' Region', '')}
                  </span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded border"
                    style={{
                      backgroundColor: `${healthBand.colorHex}18`,
                      borderColor: `${healthBand.colorHex}44`,
                      color: healthBand.colorHex,
                    }}
                  >
                    {healthBand.label}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-mono font-bold tabular-nums text-slate-100">
                    {psi}
                  </span>
                  <span className="text-xs font-mono text-slate-400 uppercase">PSI</span>
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                  <span>1-hr PM2.5:</span>
                  <span className="font-mono font-medium text-slate-200 tabular-nums">
                    {pm25} µg/m³
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-800/80">
                <div className="text-[11px] text-slate-400 line-clamp-1">
                  {regInfo.prominentEstates.slice(0, 3).join(', ')}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
