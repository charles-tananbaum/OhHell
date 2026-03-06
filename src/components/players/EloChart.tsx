import type { EloHistoryEntry } from '../../types';
import { DEFAULT_ELO } from '../../constants';

interface EloChartProps {
  history: EloHistoryEntry[];
}

export default function EloChart({ history }: EloChartProps) {
  if (history.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center rounded-2xl card-surface text-xs text-text-secondary">
        No ELO history yet
      </div>
    );
  }

  const points = [
    { elo: history[0]?.eloBefore ?? DEFAULT_ELO },
    ...history.map((h) => ({ elo: h.eloAfter })),
  ];

  const elos = points.map((p) => p.elo);
  const minElo = Math.min(...elos);
  const maxElo = Math.max(...elos);
  const range = maxElo - minElo || 1;

  const width = 300;
  const height = 120;
  const padding = 12;
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
  const strokeColor = isUp ? '#3da066' : '#c45c4a';
  const gradientId = isUp ? 'elo-grad-up' : 'elo-grad-down';

  return (
    <div className="rounded-2xl card-surface p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="elo-grad-up" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3da066" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3da066" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="elo-grad-down" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c45c4a" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#c45c4a" stopOpacity="0" />
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
        <circle cx={getX(0)} cy={getY(firstElo)} r={3} fill={strokeColor} />
        <circle
          cx={getX(points.length - 1)}
          cy={getY(lastElo)}
          r={4}
          fill={strokeColor}
          stroke="#0c0f0a"
          strokeWidth={2}
        />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-text-muted">
        <span>{minElo}</span>
        <span className="font-semibold text-ivory">{lastElo}</span>
        <span>{maxElo}</span>
      </div>
    </div>
  );
}
