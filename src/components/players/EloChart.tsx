import type { EloHistoryEntry } from '../../types';
import { DEFAULT_ELO } from '../../constants';

interface EloChartProps {
  history: EloHistoryEntry[];
}

export default function EloChart({ history }: EloChartProps) {
  if (history.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl bg-surface text-xs text-text-secondary">
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
  const height = 100;
  const padding = 10;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const getX = (i: number) =>
    padding + (i / (points.length - 1 || 1)) * innerW;
  const getY = (elo: number) =>
    padding + innerH - ((elo - minElo) / range) * innerH;

  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getY(p.elo)}`)
    .join(' ');

  const lastElo = points[points.length - 1].elo;
  const firstElo = points[0].elo;
  const color = lastElo >= firstElo ? '#30d158' : '#ff453a';

  return (
    <div className="rounded-xl bg-surface p-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dots at endpoints */}
        <circle cx={getX(0)} cy={getY(firstElo)} r={3} fill={color} />
        <circle
          cx={getX(points.length - 1)}
          cy={getY(lastElo)}
          r={3}
          fill={color}
        />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-text-secondary">
        <span>{minElo}</span>
        <span>{maxElo}</span>
      </div>
    </div>
  );
}
