import React from 'react';
import { Activity, HeartPulse, Home, Shield, Users } from 'lucide-react';
import { getHealthBand, getMohAdvisoriesForPsi } from '../utils/constants';

interface MohHealthAdvisoriesProps {
  currentPsi: number;
}

export const MohHealthAdvisories: React.FC<MohHealthAdvisoriesProps> = ({ currentPsi }) => {
  const band = getHealthBand(currentPsi);
  const advisories = getMohAdvisoriesForPsi(currentPsi);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'healthy':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'vulnerable':
        return <Users className="w-4 h-4 text-amber-400" />;
      case 'chronic':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      default:
        return <Shield className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div id="moh-advisory" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Singapore MOH Health Advisory & Action Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrated against Singapore Ministry of Health (MOH) clinical haze guidelines
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Current Health Band:</span>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-md border"
            style={{
              backgroundColor: `${band.colorHex}22`,
              borderColor: `${band.colorHex}55`,
              color: band.colorHex,
            }}
          >
            {band.label} (PSI {currentPsi})
          </span>
        </div>
      </div>

      {/* Demographic Advisory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {advisories.map(adv => (
          <div
            key={adv.category}
            className="rounded-xl border border-slate-800 bg-slate-900/80 p-4.5 backdrop-blur-sm flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    {getCategoryIcon(adv.category)}
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">
                    {adv.groupLabel}
                  </h4>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Recommended Action
                </div>
                <div className="text-sm font-medium text-slate-100 mt-0.5">
                  {adv.shortAdvice}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {adv.activityGuide}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                <span className="text-slate-300 font-semibold">Respirator / Mask:</span>
                <span className="text-cyan-300">{adv.maskRecommendation}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Practical Protection Insights (N95 vs Surgical Mask + Indoor HEPA) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>N95 Respirators vs. Surgical Masks During Haze</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Surgical masks and cloth coverings are designed to catch large saliva droplets, <strong>not</strong> microscopic fine particulate (PM2.5). When PSI enters the unhealthy range (&ge; 101), only certified N95 respirators with a sealed facial perimeter effectively filter 95% of fine particulate. Vulnerable individuals should prioritize staying indoors rather than strenuous outdoor exertion while wearing masks.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Home className="w-4 h-4 text-cyan-400" />
            <span>Indoor Air Quality & Ventilation Protocol</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            During haze episodes, close all exterior windows and doors facing prevailing wind directions. Switch air conditioning to internal recirculate mode. Operate air purifiers rated with True HEPA filters (CADR matched to room volume) continuously in living rooms and bedrooms to keep indoor PM2.5 levels strictly below 12 µg/m³.
          </p>
        </div>
      </div>
    </div>
  );
};
