import React, { useState } from 'react';
import { Compass, Eye, Wind } from 'lucide-react';
import { RegionKey } from '../types/psi';
import { HEALTH_BANDS, PM25_BANDS, SINGAPORE_REGIONS, getHealthBand, getPm25Band } from '../utils/constants';

interface InteractiveSingaporeMapProps {
  psiReadings: Record<RegionKey, number>;
  pm25Readings: Record<RegionKey, number>;
  selectedRegion: RegionKey;
  onSelectRegion: (region: RegionKey) => void;
  windSpeedKmh: number;
  windDirectionText: string;
}

type ActiveMetric = 'psi' | 'pm25';

interface Landmark {
  id: string;
  name: string;
  region: RegionKey;
  x: number;
  y: number;
  type: string;
}

const LANDMARKS: Landmark[] = [
  { id: 'sentosa', name: 'Sentosa Island', region: 'south', x: 470, y: 395, type: 'Resort / Coast' },
  { id: 'mbs', name: 'Marina Bay / CBD', region: 'south', x: 520, y: 360, type: 'Financial Hub' },
  { id: 'changi', name: 'Changi Airport', region: 'east', x: 740, y: 260, type: 'Aviation Hub' },
  { id: 'woodlands', name: 'Woodlands Causeway', region: 'north', x: 420, y: 110, type: 'North Border' },
  { id: 'jurong', name: 'Jurong Mega Port', region: 'west', x: 260, y: 330, type: 'Maritime / Industrial' },
];

export const InteractiveSingaporeMap: React.FC<InteractiveSingaporeMapProps> = ({
  psiReadings,
  pm25Readings,
  selectedRegion,
  onSelectRegion,
  windSpeedKmh,
  windDirectionText,
}) => {
  const [metric, setMetric] = useState<ActiveMetric>('psi');
  const [showWind, setShowWind] = useState<boolean>(true);
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [hoveredRegion, setHoveredRegion] = useState<RegionKey | null>(null);

  const getMetricValue = (region: RegionKey): number => {
    return metric === 'psi' ? psiReadings[region] || 0 : pm25Readings[region] || 0;
  };

  const getRegionFill = (region: RegionKey): string => {
    const val = getMetricValue(region);
    if (metric === 'psi') {
      const band = getHealthBand(val);
      return band.colorHex;
    } else {
      const band = getPm25Band(val);
      return band.colorHex;
    }
  };

  const currentDisplayRegion = hoveredRegion || (selectedRegion !== 'national' ? selectedRegion : 'south');
  const currentVal = getMetricValue(currentDisplayRegion);
  const currentBand = metric === 'psi' ? getHealthBand(currentVal) : getPm25Band(currentVal);

  return (
    <div className="relative rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md overflow-hidden flex flex-col">
      {/* Map Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-cyan-400" />
            Regional Radar View
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-300">
            {SINGAPORE_REGIONS[selectedRegion].name}
          </span>
        </div>

        {/* Metric Switcher Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-slate-900 border border-slate-750 rounded-lg">
            <button
              type="button"
              onClick={() => setMetric('psi')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                metric === 'psi'
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              24-hr PSI
            </button>
            <button
              type="button"
              onClick={() => setMetric('pm25')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                metric === 'pm25'
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1-hr PM2.5 (µg/m³)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowWind(!showWind)}
            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
              showWind
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle transboundary wind vectors"
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wind</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLandmarks(!showLandmarks)}
            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
              showLandmarks
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle landmark pins (Sentosa, Marina Bay, etc.)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Landmarks</span>
          </button>
        </div>
      </div>

      {/* Main SVG Vector Canvas */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[380px] max-h-[540px] bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950 flex items-center justify-center p-2 sm:p-4 select-none">
        {/* Subtle Radar Scan Grid Background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Compass Rose Top-Right */}
        <div className="absolute top-4 right-4 flex flex-col items-center pointer-events-none opacity-40">
          <div className="text-[10px] font-mono font-bold text-cyan-400">N</div>
          <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-400 to-transparent my-0.5" />
          <div className="text-[9px] font-mono text-slate-500">000°</div>
        </div>

        {/* Live Wind Vector Indicator HUD (Top Left) */}
        {showWind && (
          <div className="absolute top-4 left-4 z-10 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 backdrop-blur-sm max-w-[210px]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Wind className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Transboundary Wind</span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Flow: <span className="text-slate-200 font-mono font-medium">{windDirectionText}</span>
            </div>
            <div className="text-xs text-slate-400">
              Speed: <span className="text-cyan-400 font-mono font-bold">{windSpeedKmh} km/h</span>
            </div>
          </div>
        )}

        {/* Active Region Quick HUD (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/95 border border-slate-800 rounded-lg p-3 backdrop-blur-sm max-w-[260px] shadow-lg">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
            {SINGAPORE_REGIONS[currentDisplayRegion].name}
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-mono font-bold tabular-nums text-slate-100">
              {currentVal}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {metric === 'psi' ? 'PSI' : 'µg/m³'}
            </span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded ml-auto border"
              style={{
                backgroundColor: `${currentBand.colorHex}22`,
                borderColor: `${currentBand.colorHex}55`,
                color: currentBand.colorHex,
              }}
            >
              {currentBand.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {SINGAPORE_REGIONS[currentDisplayRegion].description}
          </p>
        </div>

        {/* SVG Singapore Island Map */}
        <svg
          viewBox="0 0 920 480"
          className="w-full h-full max-h-[460px] drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
          aria-label="Interactive Map of Singapore Air Quality Regions"
        >
          <defs>
            <filter id="region-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Linear gradient for water straits */}
            <radialGradient id="water-depth" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#081020" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.8" />
            </radialGradient>
          </defs>

          {/* Johor Straits / Maritime ambient backwash */}
          <rect x="0" y="0" width="920" height="480" fill="url(#water-depth)" rx="12" />

          {/* Johor coastline silhouette (subtle contextual geography) */}
          <path
            d="M 120 40 Q 280 20, 430 75 Q 580 50, 750 90 L 880 110 L 880 0 L 120 0 Z"
            fill="#091322"
            opacity="0.35"
          />

          {/* Batam / Riau Islands coastline silhouette (south) */}
          <path
            d="M 320 470 Q 500 450, 700 460 Q 820 440, 890 470 L 890 480 L 320 480 Z"
            fill="#091322"
            opacity="0.35"
          />

          {/* ===================== REGION 1: WEST REGION ===================== */}
          <g
            id="region-west"
            onClick={() => onSelectRegion('west')}
            onMouseEnter={() => setHoveredRegion('west')}
            onMouseLeave={() => setHoveredRegion(null)}
            className="cursor-pointer transition-all duration-200"
          >
            {/* West Main Basin & Jurong Industrial/Tuas */}
            <path
              d="M 180 340
                 L 140 310
                 L 170 260
                 L 220 230
                 L 280 210
                 L 330 220
                 L 360 250
                 L 360 290
                 L 320 340
                 L 270 365
                 L 200 360 Z"
              fill={getRegionFill('west')}
              fillOpacity={selectedRegion === 'west' || hoveredRegion === 'west' ? 0.45 : 0.25}
              stroke={getRegionFill('west')}
              strokeWidth={selectedRegion === 'west' || hoveredRegion === 'west' ? 3 : 1.5}
              strokeLinejoin="round"
              className="transition-all duration-200 hover:brightness-125"
            />
            {/* Jurong Island Offshore Complex */}
            <path
              d="M 280 380 L 330 370 L 350 400 L 310 415 L 270 395 Z"
              fill={getRegionFill('west')}
              fillOpacity={selectedRegion === 'west' || hoveredRegion === 'west' ? 0.5 : 0.3}
              stroke={getRegionFill('west')}
              strokeWidth={1.5}
            />
            <text x="260" y="280" fill="#f8fafc" fontSize="13" fontWeight="600" textAnchor="middle" pointerEvents="none">
              WEST
            </text>
            <text x="260" y="296" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle" pointerEvents="none">
              {getMetricValue('west')} {metric === 'psi' ? 'PSI' : 'µg/m³'}
            </text>
          </g>

          {/* ===================== REGION 2: NORTH REGION ===================== */}
          <g
            id="region-north"
            onClick={() => onSelectRegion('north')}
            onMouseEnter={() => setHoveredRegion('north')}
            onMouseLeave={() => setHoveredRegion(null)}
            className="cursor-pointer transition-all duration-200"
          >
            <path
              d="M 330 220
                 L 340 160
                 L 380 120
                 L 450 110
                 L 510 130
                 L 540 170
                 L 510 210
                 L 460 215
                 L 410 220 Z"
              fill={getRegionFill('north')}
              fillOpacity={selectedRegion === 'north' || hoveredRegion === 'north' ? 0.45 : 0.25}
              stroke={getRegionFill('north')}
              strokeWidth={selectedRegion === 'north' || hoveredRegion === 'north' ? 3 : 1.5}
              strokeLinejoin="round"
              className="transition-all duration-200 hover:brightness-125"
            />
            <text x="440" y="165" fill="#f8fafc" fontSize="13" fontWeight="600" textAnchor="middle" pointerEvents="none">
              NORTH
            </text>
            <text x="440" y="181" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle" pointerEvents="none">
              {getMetricValue('north')} {metric === 'psi' ? 'PSI' : 'µg/m³'}
            </text>
          </g>

          {/* ===================== REGION 3: CENTRAL REGION ===================== */}
          <g
            id="region-central"
            onClick={() => onSelectRegion('central')}
            onMouseEnter={() => setHoveredRegion('central')}
            onMouseLeave={() => setHoveredRegion(null)}
            className="cursor-pointer transition-all duration-200"
          >
            <path
              d="M 360 250
                 L 410 220
                 L 460 215
                 L 510 210
                 L 550 250
                 L 540 300
                 L 480 320
                 L 420 310
                 L 360 290 Z"
              fill={getRegionFill('central')}
              fillOpacity={selectedRegion === 'central' || hoveredRegion === 'central' ? 0.45 : 0.25}
              stroke={getRegionFill('central')}
              strokeWidth={selectedRegion === 'central' || hoveredRegion === 'central' ? 3 : 1.5}
              strokeLinejoin="round"
              className="transition-all duration-200 hover:brightness-125"
            />
            <text x="455" y="260" fill="#f8fafc" fontSize="13" fontWeight="600" textAnchor="middle" pointerEvents="none">
              CENTRAL
            </text>
            <text x="455" y="276" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle" pointerEvents="none">
              {getMetricValue('central')} {metric === 'psi' ? 'PSI' : 'µg/m³'}
            </text>
          </g>

          {/* ===================== REGION 4: EAST REGION ===================== */}
          <g
            id="region-east"
            onClick={() => onSelectRegion('east')}
            onMouseEnter={() => setHoveredRegion('east')}
            onMouseLeave={() => setHoveredRegion(null)}
            className="cursor-pointer transition-all duration-200"
          >
            <path
              d="M 540 170
                 L 600 170
                 L 660 200
                 L 760 230
                 L 780 270
                 L 740 310
                 L 640 310
                 L 550 250
                 L 510 210 Z"
              fill={getRegionFill('east')}
              fillOpacity={selectedRegion === 'east' || hoveredRegion === 'east' ? 0.45 : 0.25}
              stroke={getRegionFill('east')}
              strokeWidth={selectedRegion === 'east' || hoveredRegion === 'east' ? 3 : 1.5}
              strokeLinejoin="round"
              className="transition-all duration-200 hover:brightness-125"
            />
            {/* Pulau Ubin & Pulau Tekong (East offshore islands) */}
            <path
              d="M 670 145 L 720 140 L 730 160 L 680 165 Z"
              fill={getRegionFill('east')}
              fillOpacity={0.3}
              stroke={getRegionFill('east')}
              strokeWidth={1}
            />
            <path
              d="M 750 140 L 800 135 L 810 175 L 760 180 Z"
              fill={getRegionFill('east')}
              fillOpacity={0.3}
              stroke={getRegionFill('east')}
              strokeWidth={1}
            />
            <text x="650" y="250" fill="#f8fafc" fontSize="13" fontWeight="600" textAnchor="middle" pointerEvents="none">
              EAST
            </text>
            <text x="650" y="266" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle" pointerEvents="none">
              {getMetricValue('east')} {metric === 'psi' ? 'PSI' : 'µg/m³'}
            </text>
          </g>

          {/* ===================== REGION 5: SOUTH REGION & SENTOSA ===================== */}
          <g
            id="region-south"
            onClick={() => onSelectRegion('south')}
            onMouseEnter={() => setHoveredRegion('south')}
            onMouseLeave={() => setHoveredRegion(null)}
            className="cursor-pointer transition-all duration-200"
          >
            {/* South Coastal Strip */}
            <path
              d="M 360 290
                 L 420 310
                 L 480 320
                 L 540 300
                 L 640 310
                 L 610 350
                 L 530 365
                 L 450 360
                 L 390 345
                 L 320 340 Z"
              fill={getRegionFill('south')}
              fillOpacity={selectedRegion === 'south' || hoveredRegion === 'south' ? 0.5 : 0.28}
              stroke={getRegionFill('south')}
              strokeWidth={selectedRegion === 'south' || hoveredRegion === 'south' ? 3 : 1.5}
              strokeLinejoin="round"
              className="transition-all duration-200 hover:brightness-125"
            />
            {/* Sentosa Island (Accurately rendered south of Harbourfront) */}
            <path
              d="M 440 395
                 C 455 385, 480 385, 500 392
                 C 515 397, 510 412, 490 415
                 C 465 418, 440 410, 440 395 Z"
              fill={getRegionFill('south')}
              fillOpacity={selectedRegion === 'south' || hoveredRegion === 'south' ? 0.75 : 0.5}
              stroke="#06b6d4"
              strokeWidth={selectedRegion === 'south' ? 2.5 : 1.5}
              className="transition-all duration-200"
            />
            {/* Sentosa Bridge Causeway line to mainland */}
            <line x1="470" y1="365" x2="470" y2="390" stroke="#38bdf8" strokeWidth="2" strokeDasharray="2,2" />

            <text x="495" y="340" fill="#f8fafc" fontSize="13" fontWeight="600" textAnchor="middle" pointerEvents="none">
              SOUTH
            </text>
            <text x="495" y="356" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle" pointerEvents="none">
              {getMetricValue('south')} {metric === 'psi' ? 'PSI' : 'µg/m³'}
            </text>
          </g>

          {/* Animated Transboundary Wind Particle Streaks */}
          {showWind && (
            <g className="pointer-events-none opacity-60">
              {/* SSW wind flow vectors across Singapore Straits */}
              <path
                d="M 120 440 L 260 300"
                stroke="#38bdf8"
                strokeWidth="2"
                fill="none"
                className="animate-wind"
              />
              <path
                d="M 280 460 L 440 280"
                stroke="#38bdf8"
                strokeWidth="2.5"
                fill="none"
                className="animate-wind"
              />
              <path
                d="M 440 460 L 600 280"
                stroke="#38bdf8"
                strokeWidth="2"
                fill="none"
                className="animate-wind"
              />
              <path
                d="M 620 460 L 760 300"
                stroke="#38bdf8"
                strokeWidth="2"
                fill="none"
                className="animate-wind"
              />
            </g>
          )}

          {/* Key Landmark Markers */}
          {showLandmarks &&
            LANDMARKS.map(lm => (
              <g
                key={lm.id}
                transform={`translate(${lm.x}, ${lm.y})`}
                className="cursor-pointer group"
                onClick={e => {
                  e.stopPropagation();
                  onSelectRegion(lm.region);
                }}
              >
                {/* Ping circle */}
                <circle r="4" fill="#38bdf8" className="transition-transform group-hover:scale-125" />
                <circle r="9" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.4" className="animate-ping" />
                
                {/* Landmark Label */}
                <rect
                  x="-45"
                  y="-22"
                  width="90"
                  height="16"
                  rx="3"
                  fill="#020617"
                  stroke="#334155"
                  strokeWidth="1"
                  opacity="0.9"
                />
                <text
                  x="0"
                  y="-11"
                  fill="#f1f5f9"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                  className="select-none"
                >
                  {lm.name}
                </text>
              </g>
            ))}
        </svg>
      </div>

      {/* Map Footer: NEA Official PSI / PM2.5 Color Scale Legend */}
      <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">
            {metric === 'psi' ? 'NEA 24-hr PSI Scale:' : 'NEA 1-hr PM2.5 Band:'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {metric === 'psi' ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: HEALTH_BANDS.good.colorHex }} />
                <span className="text-slate-300 font-mono">0-50</span>
                <span className="text-slate-500">Good</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: HEALTH_BANDS.moderate.colorHex }} />
                <span className="text-slate-300 font-mono">51-100</span>
                <span className="text-slate-500">Moderate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: HEALTH_BANDS.unhealthy.colorHex }} />
                <span className="text-slate-300 font-mono">101-200</span>
                <span className="text-amber-400 font-semibold">Unhealthy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: HEALTH_BANDS.very_unhealthy.colorHex }} />
                <span className="text-slate-300 font-mono">201-300</span>
                <span className="text-rose-400 font-semibold">Very Unhealthy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: HEALTH_BANDS.hazardous.colorHex }} />
                <span className="text-slate-300 font-mono">301+</span>
                <span className="text-purple-400 font-semibold">Hazardous</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PM25_BANDS.normal.colorHex }} />
                <span className="text-slate-300 font-mono">0-12</span>
                <span className="text-slate-500">Normal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PM25_BANDS.elevated.colorHex }} />
                <span className="text-slate-300 font-mono">13-55</span>
                <span className="text-slate-500">Elevated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PM25_BANDS.high.colorHex }} />
                <span className="text-slate-300 font-mono">56-150</span>
                <span className="text-amber-400 font-semibold">High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PM25_BANDS.very_high.colorHex }} />
                <span className="text-slate-300 font-mono">151+</span>
                <span className="text-rose-400 font-semibold">Very High</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
