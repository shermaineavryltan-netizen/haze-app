import React from 'react';
import { Flame, Gauge } from 'lucide-react';
import { FormattedPsiData } from '../services/neaPsiService';
import { RegionKey } from '../types/psi';

interface PollutantBreakdownProps {
  data: FormattedPsiData;
  selectedRegion: RegionKey;
  onSelectRegion: (reg: RegionKey) => void;
}

export const PollutantBreakdown: React.FC<PollutantBreakdownProps> = ({
  data,
  selectedRegion,
}) => {
  const regions: RegionKey[] = ['national', 'south', 'central', 'north', 'east', 'west'];

  const pollutants = [
    {
      code: 'PM2.5 (1-hr)',
      name: 'Fine Particulate Matter (≤ 2.5 µm)',
      unit: 'µg/m³',
      safeThreshold: 12,
      dangerThreshold: 55,
      description: 'Microscopic soot, nitrates and combustion aerosols penetrating deep into pulmonary alveoli.',
      values: data.pm25OneHourly,
    },
    {
      code: 'PM10 (24-hr)',
      name: 'Respirable Particulate Matter (≤ 10 µm)',
      unit: 'µg/m³',
      safeThreshold: 50,
      dangerThreshold: 150,
      description: 'Coarse airborne dust, soil, industrial ash and vegetative burning remnants.',
      values: data.pm10,
    },
    {
      code: 'O3 (8-hr Max)',
      name: 'Ground-level Ozone',
      unit: 'µg/m³',
      safeThreshold: 100,
      dangerThreshold: 160,
      description: 'Secondary photochemical oxidant generated under intense tropical sunlight.',
      values: data.o3,
    },
    {
      code: 'NO2 (1-hr Max)',
      name: 'Nitrogen Dioxide',
      unit: 'µg/m³',
      safeThreshold: 200,
      dangerThreshold: 400,
      description: 'Emissions from maritime shipping channels, expressways, and petrochemical crackers.',
      values: data.no2,
    },
    {
      code: 'SO2 (24-hr)',
      name: 'Sulfur Dioxide',
      unit: 'µg/m³',
      safeThreshold: 50,
      dangerThreshold: 125,
      description: 'Combustion of heavy fuel oil in maritime bunkering and industrial complexes.',
      values: data.so2,
    },
    {
      code: 'CO (8-hr Max)',
      name: 'Carbon Monoxide',
      unit: 'mg/m³',
      safeThreshold: 9.0,
      dangerThreshold: 30.0,
      description: 'Incomplete combustion byproduct from vehicular exhausts and peatland forest smoldering.',
      values: data.co,
    },
  ];

  return (
    <div id="pollutants-section" className="space-y-6">
      {/* Transboundary Haze & Hotspot Telemetry Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Regional Transboundary Haze & Satellite Hotspot Tracker
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Season: {data.transboundary.monsoonSeason}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Sumatra Hotspots
            </div>
            <div className="text-2xl font-mono font-bold tabular-nums text-amber-400 mt-1">
              {data.transboundary.hotspotCountSumatra}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              MODIS / VIIRS thermal anomalies
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Kalimantan Hotspots
            </div>
            <div className="text-2xl font-mono font-bold tabular-nums text-slate-200 mt-1">
              {data.transboundary.hotspotCountKalimantan}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Borneo peatland detection
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Prevailing Wind Vector
            </div>
            <div className="text-lg font-mono font-semibold text-cyan-300 mt-1 truncate">
              {data.transboundary.windDirectionText}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Speed: {data.transboundary.windSpeedKmh} km/h
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Transboundary Risk
            </div>
            <div
              className={`text-2xl font-mono font-bold mt-1 ${
                data.transboundary.hazeRiskLevel === 'High' || data.transboundary.hazeRiskLevel === 'Severe'
                  ? 'text-rose-400'
                  : data.transboundary.hazeRiskLevel === 'Moderate'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {data.transboundary.hazeRiskLevel}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Atmospheric dispersion potential
            </div>
          </div>
        </div>
      </div>

      {/* 6 Criteria Pollutants Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden backdrop-blur-md">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              Criteria Pollutants Telemetry Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Concentrations reported across Singapore meteorological monitoring networks
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4 font-medium">Pollutant</th>
                <th className="py-3 px-4 font-medium text-right">National</th>
                <th className="py-3 px-4 font-medium text-right">South (Sentosa)</th>
                <th className="py-3 px-4 font-medium text-right">Central</th>
                <th className="py-3 px-4 font-medium text-right">North</th>
                <th className="py-3 px-4 font-medium text-right">East</th>
                <th className="py-3 px-4 font-medium text-right">West</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {pollutants.map(p => (
                <tr key={p.code} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-sans font-semibold text-slate-200">
                      {p.code}
                    </div>
                    <div className="font-sans text-[11px] text-slate-400">
                      {p.name}
                    </div>
                  </td>
                  {regions.map(reg => {
                    const val = p.values[reg] ?? 0;
                    const isHigh = val >= p.dangerThreshold;
                    return (
                      <td
                        key={reg}
                        className={`py-3 px-4 text-right tabular-nums ${
                          isHigh
                            ? 'text-amber-400 font-bold'
                            : selectedRegion === reg
                            ? 'text-cyan-300 font-medium'
                            : 'text-slate-300'
                        }`}
                      >
                        {val} <span className="text-[10px] text-slate-500 font-sans">{p.unit}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
