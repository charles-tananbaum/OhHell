import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import type { EloHistoryEntry } from '../../types';
import { DEFAULT_ELO } from '../../constants';

interface EloChartProps {
  history: EloHistoryEntry[];
}

interface ChartPoint {
  elo: number;
  date: string | null;
  gameId: string | null;
  change: number;
  label: string;
}

export default function EloChart({ history }: EloChartProps) {
  const games = useStore((s) => s.games);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (history.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl card-surface text-xs text-text-secondary">
        No ELO history yet
      </div>
    );
  }

  const points: ChartPoint[] = [
    {
      elo: history[0]?.eloBefore ?? DEFAULT_ELO,
      date: null,
      gameId: null,
      change: 0,
      label: 'Starting ELO',
    },
    ...history.map((h) => {
      const game = games.find((g) => g.id === h.gameId);
      const playerCount = game?.playerIds.length ?? 0;
      return {
        elo: h.eloAfter,
        date: h.date,
        gameId: h.gameId,
        change: h.eloAfter - h.eloBefore,
        label: game
          ? `${playerCount}-player game`
          : 'Game',
      };
    }),
  ];

  const elos = points.map((p) => p.elo);
  const minElo = Math.min(...elos);
  const maxElo = Math.max(...elos);
  const range = maxElo - minElo || 1;

  const width = 300;
  const height = 130;
  const padding = 16;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const getX = (i: number) =>
    padding + (i / (points.length - 1 || 1)) * innerW;
  const getY = (elo: number) =>
    padding + innerH - ((elo - minElo) / range) * innerH;

  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getY(p.elo)}`)
    .join(' ');

  const areaData =
    pathData +
    ` L${getX(points.length - 1)},${height - padding} L${padding},${height - padding} Z`;

  const lastElo = points[points.length - 1].elo;
  const firstElo = points[0].elo;
  const isUp = lastElo >= firstElo;
  const strokeColor = isUp ? '#00d4aa' : '#fb7185';
  const gradientId = isUp ? 'elo-grad-up' : 'elo-grad-down';

  const handleInteraction = useCallback(
    (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();

      let clientX: number;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
      } else {
        clientX = e.clientX;
      }

      const svgX = ((clientX - rect.left) / rect.width) * width;
      // Find nearest point
      let nearest = 0;
      let nearestDist = Infinity;
      for (let i = 0; i < points.length; i++) {
        const dist = Math.abs(svgX - getX(i));
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = i;
        }
      }
      setActiveIndex(nearest);
    },
    [points.length],
  );

  const activePoint = activeIndex !== null ? points[activeIndex] : null;

  return (
    <div className="rounded-xl card-surface p-4">
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full touch-none"
          preserveAspectRatio="none"
          onMouseMove={handleInteraction}
          onTouchMove={handleInteraction}
          onMouseLeave={() => setActiveIndex(null)}
          onTouchEnd={() => setActiveIndex(null)}
        >
          <defs>
            <linearGradient id="elo-grad-up" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#00d4aa" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="elo-grad-down" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb7185" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaData} fill={`url(#${gradientId})`} />
          <path
            d={pathData}
            fill="none"
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data point dots */}
          {points.map((p, i) => {
            const isActive = activeIndex === i;
            const isEndpoint = i === 0 || i === points.length - 1;
            return (
              <circle
                key={i}
                cx={getX(i)}
                cy={getY(p.elo)}
                r={isActive ? 5 : isEndpoint ? 3 : 2}
                fill={isActive ? '#fff' : strokeColor}
                stroke={isActive ? strokeColor : 'none'}
                strokeWidth={isActive ? 2.5 : 0}
                style={{ transition: 'r 0.15s ease' }}
              />
            );
          })}

          {/* Vertical guide line on hover */}
          {activeIndex !== null && (
            <line
              x1={getX(activeIndex)}
              y1={padding}
              x2={getX(activeIndex)}
              y2={height - padding}
              stroke={strokeColor}
              strokeWidth={0.8}
              strokeDasharray="3 3"
              opacity={0.5}
            />
          )}
        </svg>

        {/* Tooltip */}
        <AnimatePresence>
          {activePoint && activeIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none"
              style={{
                paddingLeft: `${(getX(activeIndex) / width) * 100}%`,
                transform: `translateX(-50%)`,
              }}
            >
              <div className="rounded-lg border border-separator-strong bg-surface-raised px-3 py-2 shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="font-display text-base text-ivory">
                    {activePoint.elo}
                  </span>
                  {activePoint.change !== 0 && (
                    <span
                      className={`text-xs font-bold ${
                        activePoint.change > 0 ? 'text-green' : 'text-red'
                      }`}
                    >
                      {activePoint.change > 0 ? '+' : ''}
                      {activePoint.change}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-text-muted">
                  {activePoint.date
                    ? `${new Date(activePoint.date).toLocaleDateString()} · ${activePoint.label}`
                    : activePoint.label}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-1.5 flex justify-between text-[10px] text-text-muted">
        <span>{minElo}</span>
        <span className="font-bold text-ivory">{lastElo}</span>
        <span>{maxElo}</span>
      </div>
    </div>
  );
}
