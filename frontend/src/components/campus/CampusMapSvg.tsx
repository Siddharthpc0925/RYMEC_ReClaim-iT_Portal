import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Info } from 'lucide-react';
import { Location } from '../../types';

interface CampusMapSvgProps {
  locations: Location[];
  selectedLocationId?: string | null;
  onSelectLocation?: (location: Location) => void;
  isHeatmap?: boolean;
  hotspotCounts?: Record<string, number>;
  className?: string;
}

export const CampusMapSvg: React.FC<CampusMapSvgProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
  isHeatmap = false,
  hotspotCounts = {},
  className = '',
}) => {
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);

  // Find max count for heatmap scaling
  const maxCount = Math.max(1, ...Object.values(hotspotCounts));

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden glass border border-white/20 shadow-2xl p-4 ${className}`}>
      {/* Map Header / Title bar */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            {isHeatmap ? 'RYMEC Campus Loss Hotspot Heatmap' : 'Interactive Campus Plan'}
          </span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Info className="w-3 h-3" />
          <span>{isHeatmap ? 'Glow size indicates report density' : 'Click any zone to select location'}</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[16/10] bg-slate-950/40 rounded-2xl overflow-hidden border border-white/10">
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Campus Pathways Grid Pattern */}
            <pattern id="campusGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>

            {/* Glowing Radial Gradients for Hotspots */}
            <radialGradient id="hotspotGlowRose" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hotspotGlowAmber" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hotspotGlowIndigo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background & Grid */}
          <rect width="1000" height="650" fill="#0d1322" />
          <rect width="1000" height="650" fill="url(#campusGrid)" />

          {/* Campus Roads and Connecting Pathways */}
          <path
            d="M 500 650 L 500 480 L 285 350 L 380 180 L 700 190 L 800 120"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 500 480 L 620 320 L 820 480 L 800 120"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 220 420 L 150 550 L 500 650"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Sports Ground Oval Graphic */}
          <ellipse cx="800" cy="120" rx="90" ry="50" fill="#132e27" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
          <text x="800" y="125" textAnchor="middle" fill="#6ee7b7" fontSize="12" fontWeight="600" opacity="0.8">
            Pavilion & Cricket Ground
          </text>

          {/* Render Campus Location Zones */}
          {locations.map((loc) => {
            const posX = (loc.x / 100) * 1000;
            const posY = (loc.y / 100) * 650;
            const isSelected = selectedLocationId === loc.id;
            const isHovered = hoveredLocation?.id === loc.id;
            const count = hotspotCounts[loc.id] || 0;

            // Compute heatmap radius
            const baseRadius = 24;
            const heatRadius = isHeatmap
              ? Math.max(28, Math.min(85, 25 + (count / maxCount) * 55))
              : baseRadius;

            return (
              <g
                key={loc.id}
                onClick={() => onSelectLocation && onSelectLocation(loc)}
                onMouseEnter={() => setHoveredLocation(loc)}
                onMouseLeave={() => setHoveredLocation(null)}
                className="cursor-pointer transition-all duration-300"
              >
                {/* Heatmap Glowing Halo Circle (U10) */}
                {isHeatmap && count > 0 && (
                  <circle
                    cx={posX}
                    cy={posY}
                    r={heatRadius}
                    fill={count >= 3 ? 'url(#hotspotGlowRose)' : 'url(#hotspotGlowAmber)'}
                    className="animate-pulse"
                  />
                )}

                {/* Building / Zone Boundary Box */}
                <rect
                  x={posX - 45}
                  y={posY - 26}
                  width="90"
                  height="52"
                  rx="12"
                  fill={
                    isSelected
                      ? '#4f46e5'
                      : isHovered
                      ? '#1e293b'
                      : '#111827'
                  }
                  stroke={
                    isSelected
                      ? '#818cf8'
                      : isHovered
                      ? '#6366f1'
                      : 'rgba(255,255,255,0.25)'
                  }
                  strokeWidth={isSelected ? '3' : '1.5'}
                  filter="drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
                />

                {/* Zone Label inside Building */}
                <text
                  x={posX}
                  y={posY - 3}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="700"
                  pointerEvents="none"
                >
                  {loc.name.split(' ')[0]}
                </text>
                <text
                  x={posX}
                  y={posY + 13}
                  textAnchor="middle"
                  fill={isSelected ? '#c7d2fe' : '#94a3b8'}
                  fontSize="9.5"
                  fontWeight="500"
                  pointerEvents="none"
                >
                  {loc.name.split(' ').slice(1, 3).join(' ')}
                </text>

                {/* Pin / Badge Icon */}
                <circle
                  cx={posX}
                  cy={posY - 32}
                  r="10"
                  fill={isSelected ? '#f43f5e' : isHovered ? '#6366f1' : '#334155'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                {isHeatmap && count > 0 ? (
                  <text
                    x={posX}
                    y={posY - 28}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="800"
                    pointerEvents="none"
                  >
                    {count}
                  </text>
                ) : (
                  <circle cx={posX} cy={posY - 32} r="3" fill="#ffffff" />
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip info on hover */}
        {hoveredLocation && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs glass px-3.5 py-2 rounded-xl text-xs shadow-xl border border-white/20 text-slate-100 pointer-events-none"
          >
            <div className="font-bold text-indigo-400">{hoveredLocation.name}</div>
            <div className="text-[11px] text-slate-300 flex items-center justify-between gap-4 mt-0.5">
              <span>Campus Zone: {hoveredLocation.parent_zone}</span>
              {isHeatmap && (
                <span className="font-semibold text-amber-400">
                  {hotspotCounts[hoveredLocation.id] || 0} Reports
                </span>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
