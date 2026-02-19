import {
  ELO_K_FACTOR,
  ELO_WEIGHT_PLACEMENT,
  ELO_WEIGHT_BID_ACCURACY,
  ELO_WEIGHT_AMBITION,
} from '../constants';
import type { Round } from '../types';

interface EloPlayer {
  id: string;
  elo: number;
}

export function calculatePerformanceScores(
  playerIds: string[],
  completedRounds: Round[],
  placements: Record<string, number>,
): Record<string, number> {
  const n = playerIds.length;
  const totalRounds = completedRounds.length;

  // Component 1: Placement score — (n - rank) / (n - 1), normalized to [0, 1]
  const placementScores: Record<string, number> = {};
  for (const id of playerIds) {
    placementScores[id] = n > 1 ? (n - placements[id]) / (n - 1) : 1;
  }

  // Component 2: Weighted bid accuracy — hits weighted by √(cardsDealt)
  const totalWeight = completedRounds.reduce(
    (sum, r) => sum + Math.sqrt(r.cardsDealt),
    0,
  );
  const wbaScores: Record<string, number> = {};
  for (const id of playerIds) {
    if (totalWeight === 0) {
      wbaScores[id] = 0;
      continue;
    }
    let hitWeight = 0;
    for (const round of completedRounds) {
      if (round.bids[id] === round.tricksTaken[id]) {
        hitWeight += Math.sqrt(round.cardsDealt);
      }
    }
    wbaScores[id] = hitWeight / totalWeight;
  }

  // Component 3: Ambition bonus — avg(bid/cardsDealt) for hit rounds, divided by totalRounds
  const rawAmbition: Record<string, number> = {};
  for (const id of playerIds) {
    let ambitionSum = 0;
    for (const round of completedRounds) {
      if (round.bids[id] === round.tricksTaken[id]) {
        ambitionSum += round.bids[id] / round.cardsDealt;
      }
    }
    rawAmbition[id] = totalRounds > 0 ? ambitionSum / totalRounds : 0;
  }
  const maxAmbition = Math.max(...Object.values(rawAmbition));
  const ambitionScores: Record<string, number> = {};
  for (const id of playerIds) {
    ambitionScores[id] = maxAmbition > 0 ? rawAmbition[id] / maxAmbition : 0;
  }

  // Composite performance score
  const result: Record<string, number> = {};
  for (const id of playerIds) {
    result[id] =
      ELO_WEIGHT_PLACEMENT * placementScores[id] +
      ELO_WEIGHT_BID_ACCURACY * wbaScores[id] +
      ELO_WEIGHT_AMBITION * ambitionScores[id];
  }

  return result;
}

export function calculateEloChanges(
  players: EloPlayer[],
  performanceScores: Record<string, number>,
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
      const psA = performanceScores[pA.id] || 0;
      const psB = performanceScores[pB.id] || 0;

      let actualA: number;
      let actualB: number;
      const psSum = psA + psB;
      if (psSum === 0) {
        actualA = 0.5;
        actualB = 0.5;
      } else {
        actualA = psA / psSum;
        actualB = psB / psSum;
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
