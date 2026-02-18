import { ELO_K_FACTOR } from '../constants';

interface EloPlayer {
  id: string;
  elo: number;
}

export function calculateEloChanges(
  players: EloPlayer[],
  finalScores: Record<string, number>,
  kFactor: number = ELO_K_FACTOR,
): Record<string, number> {
  const n = players.length;
  if (n < 2) return {};

  const scaledK = kFactor / (n - 1);
  const changes: Record<string, number> = {};
  players.forEach((p) => {
    changes[p.id] = 0;
  });

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const pA = players[i];
      const pB = players[j];
      const scoreA = finalScores[pA.id] || 0;
      const scoreB = finalScores[pB.id] || 0;

      let actualA: number;
      let actualB: number;
      if (scoreA > scoreB) {
        actualA = 1;
        actualB = 0;
      } else if (scoreA < scoreB) {
        actualA = 0;
        actualB = 1;
      } else {
        actualA = 0.5;
        actualB = 0.5;
      }

      const expectedA = 1 / (1 + Math.pow(10, (pB.elo - pA.elo) / 400));
      const expectedB = 1 - expectedA;

      changes[pA.id] += scaledK * (actualA - expectedA);
      changes[pB.id] += scaledK * (actualB - expectedB);
    }
  }

  for (const id in changes) {
    changes[id] = Math.round(changes[id]);
  }

  return changes;
}
