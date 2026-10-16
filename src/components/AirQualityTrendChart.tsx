import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { HistoricalReadingPoint, RegionKey } from '../types/psi';
import { SINGAPORE_REGIONS, getHealthBand } from '../utils/constants';

interface AirQualityTrendChartProps {
  history: Record<RegionKey, HistoricalReadingPoint[]>;
  selectedRegion: RegionKey;
  onSelectRegion: (reg: RegionKey) => void;
}

export const AirQualityTrendChart: React.FC<AirQualityTrendChartProps> = ({
  history,
  selectedRegion,
  onSelectRegion,
}) => {
  const [metric, setMetric] = useState<'psi' | 'pm25'>('psi');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const regionHistory = history[selectedRegion] || [];
  if (regionHistory.length === 0) return null;

  // Chart dimensions
  const width = 800;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Values
  const values = regionHistory.map(p => (metric === 'psi' ? p.psi : p.pm25));
  const maxVal = Math.max(metric === 'psi' ? 120 : 60, Math.ceil(Math.max(...values, 0) / 20) * 20 + 20);
  const minVal = 0;

  const getX = (idx: number) => paddingLeft + (idx / (regionHistory.length - 1)) * chartW;
  const getY = (val: number) => paddingTop + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

  // Generate SVG path for line
  const points = regionHistory.map((p, idx) => ({
    x: getX(idx),
    y: getY(metric === 'psi' ? p.psi : p.pm25),
    ...p,
  }));

  const linePath = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartH} L ${points[0].x} ${paddingTop + chartH} Z`;

  // Threshold lines
  const unhealthyThresholdY = getY(100);
  const activeHoverPoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              24-Hour Air Quality Historical Trajectory
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Hourly progression showing peak diurnal variations and transboundary particulate waves
          </p>
        </div>

        {/* Metric and Region Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Region Tabs */}
          <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
            {(['national', 'south', 'central', 'north', 'east', 'west'] as RegionKey[]).map(reg => (
              <button
                key={reg}
                type="button"
                onClick={() => onSelectRegion(reg)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                  selectedRegion === reg
                    ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {reg === 'national' ? 'Island-wide' : SINGAPORE_REGIONS[reg].name.replace(' Region', '')}
              </button>
            ))}
          </div>

          {/* Metric Toggle */}
          <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setMetric('psi')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                metric === 'psi' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              PSI
            </button>
            <button
              type="button"
              onClick={() => setMetric('pm25')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                metric === 'pm25' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              PM2.5
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[24/8] min-h-[220px]">
        {/* Hover Point Tooltip HUD */}
        {activeHoverPoint && (
          <div className="absolute top-2 right-4 bg-slate-950/90 border border-slate-750 px-3 py-1.5 rounded-lg text-xs flex items-center gap-3 backdrop-blur-sm pointer-events-none z-10">
            <span className="text-slate-400 font-mono">Time: {activeHoverPoint.timeStr}</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono font-bold text-cyan-300">
              {metric === 'psi' ? `PSI ${activeHoverPoint.psi}` : `PM2.5 ${activeHoverPoint.pm25} µg/m³`}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] text-slate-300">
              {getHealthBand(activeHoverPoint.psi).label}
            </span>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible select-none"
        >
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const val = Math.round(minVal + pct * (maxVal - minVal));
            const y = getY(val);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  textAnchor="end"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Unhealthy reference threshold line (100 PSI) */}
          {metric === 'psi' && unhealthyThresholdY >= paddingTop && unhealthyThresholdY <= paddingTop + chartH && (
            <g>
              <line
                x1={paddingLeft}
                y1={unhealthyThresholdY}
                x2={width - paddingRight}
                y2={unhealthyThresholdY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
              <text
                x={width - paddingRight - 4}
                y={unhealthyThresholdY - 4}
                fill="#f59e0b"
                fontSize="9"
                fontWeight="600"
                textAnchor="end"
              >
                100 UNHEALTHY THRESHOLD
              </text>
            </g>
          )}

          {/* Gradient Area Fill */}
          <path d={areaPath} fill="url(#trend-fill)" />

          {/* Primary Trend Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points and interactive hover hitboxes */}
          {points.map((p, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Large transparent touch/mouse target */}
                <rect
                  x={p.x - chartW / points.length / 2}
                  y={paddingTop}
                  width={chartW / points.length}
                  height={chartH}
                  fill="transparent"
                />
                {/* Point dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5 : 2.5}
                  fill={isHovered ? '#38bdf8' : '#0891b2'}
                  stroke="#020617"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />
                {/* Vertical hover crosshair guide */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={paddingTop}
                    x2={p.x}
                    y2={paddingTop + chartH}
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    pointerEvents="none"
                  />
                )}
              </g>
            );
          })}

          {/* Time axis labels */}
          {points.map((p, idx) => {
            if (idx % 3 !== 0 && idx !== points.length - 1) return null;
            return (
              <text
                key={idx}
                x={p.x}
                y={height - 12}
                fill="#64748b"
                fontSize="10"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
              >
                {p.timeStr}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
