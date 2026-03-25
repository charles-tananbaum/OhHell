import {
  ELO_K_FACTOR,
  ELO_WEIGHT_PLACEMENT,
  ELO_WEIGHT_BID_ACCURACY,
  ELO_WEIGHT_AMBITION,
  ELO_REFERENCE_PLAYERS,
  ELO_REFERENCE_ROUNDS,
} from '../constants';
import type { Round } from '../types';

export interface EloPlayer {
  id: string;
  elo: number;
}

export interface EloExplanation {
  playerId: string;
  playerName: string;
  eloBefore: number;
  eloAfter: number;
  eloChange: number;
  placement: number;
  placementScore: number;
  bidAccuracy: number;
  bidAccuracyScore: number;
  ambitionScore: number;
  performanceScore: number;
  avgOpponentElo: number;
  playerCountMultiplier: number;
  roundCountMultiplier: number;
  totalRounds: number;
  playerCount: number;
  expectedOutcome: number;
  actualOutcome: number;
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

/**
 * Calculate ELO changes for a multiplayer game.
 *
 * Three factors influence the magnitude of ELO swings:
 *
 * 1. **Opponent ELO** (built into the expected-score formula):
 *    Beating higher-rated opponents yields more ELO than beating lower-rated ones.
 *
 * 2. **Player count multiplier** — sqrt(n / REFERENCE_PLAYERS):
 *    Winning a 6-player game is harder than a 3-player game, so it should
 *    carry more weight. Uses sqrt to keep the scaling moderate.
 *    e.g. 3 players → 0.87×, 4 → 1×, 5 → 1.12×, 6 → 1.22×, 7 → 1.32×
 *
 * 3. **Round count multiplier** — clamp(sqrt(totalRounds / REFERENCE_ROUNDS), 0.6, 1.4):
 *    Longer games have more signal (less luck). A full 7-card game (~13 rounds)
 *    is the baseline. Shorter games are dampened, longer ones amplified.
 *    e.g. 5 rounds → 0.62×, 9 → 0.83×, 13 → 1×, 19 → 1.21×
 */
export function calculateEloChanges(
  players: EloPlayer[],
  performanceScores: Record<string, number>,
  totalRounds: number,
  kFactor: number = ELO_K_FACTOR,
): Record<string, number> {
  const n = players.length;
  if (n < 2) return {};

  // Scale K for player count: more opponents = higher stakes
  const playerMultiplier = Math.sqrt(n / ELO_REFERENCE_PLAYERS);

  // Scale K for round count: more rounds = more reliable result
  const roundMultiplier = Math.max(
    0.6,
    Math.min(1.4, Math.sqrt(totalRounds / ELO_REFERENCE_ROUNDS)),
  );

  const effectiveK = kFactor * playerMultiplier * roundMultiplier;
  const scaledK = effectiveK / (n - 1);

  const changes: Record<string, number> = {};
  for (const p of players) {
    changes[p.id] = 0;
  }

  // Pairwise ELO: each pair exchanges rating based on actual vs expected outcome
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const pA = players[i];
      const pB = players[j];
      const psA = performanceScores[pA.id] || 0;
      const psB = performanceScores[pB.id] || 0;

      // Actual outcome derived from performance scores
      const psSum = psA + psB;
      const actualA = psSum === 0 ? 0.5 : psA / psSum;
      const actualB = 1 - actualA;

      // Expected outcome from current ELO ratings
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

/**
 * Generate a human-readable breakdown of why each player's ELO changed.
 */
export function generateEloExplanations(
  players: EloPlayer[],
  playerNames: Record<string, string>,
  performanceScores: Record<string, number>,
  placements: Record<string, number>,
  completedRounds: Round[],
  eloChanges: Record<string, number>,
): EloExplanation[] {
  const n = players.length;
  const totalRounds = completedRounds.length;

  const playerMultiplier = Math.sqrt(n / ELO_REFERENCE_PLAYERS);
  const roundMultiplier = Math.max(
    0.6,
    Math.min(1.4, Math.sqrt(totalRounds / ELO_REFERENCE_ROUNDS)),
  );

  // Recompute individual component scores for the breakdown
  const totalWeight = completedRounds.reduce(
    (sum, r) => sum + Math.sqrt(r.cardsDealt),
    0,
  );

  return players.map((player) => {
    const opponents = players.filter((p) => p.id !== player.id);
    const avgOpponentElo =
      opponents.length > 0
        ? Math.round(opponents.reduce((s, o) => s + o.elo, 0) / opponents.length)
        : player.elo;

    // Avg expected outcome across all opponents
    const expectedOutcome =
      opponents.length > 0
        ? opponents.reduce(
            (s, o) => s + 1 / (1 + Math.pow(10, (o.elo - player.elo) / 400)),
            0,
          ) / opponents.length
        : 0.5;

    // Avg actual outcome across all opponents
    const ps = performanceScores[player.id] || 0;
    const actualOutcome =
      opponents.length > 0
        ? opponents.reduce((s, o) => {
            const ops = performanceScores[o.id] || 0;
            const sum = ps + ops;
            return s + (sum === 0 ? 0.5 : ps / sum);
          }, 0) / opponents.length
        : 0.5;

    // Bid accuracy for this player
    let bidsHit = 0;
    for (const round of completedRounds) {
      if (round.bids[player.id] === round.tricksTaken[player.id]) {
        bidsHit++;
      }
    }
    const bidAccuracy = totalRounds > 0 ? bidsHit / totalRounds : 0;

    // Weighted bid accuracy score
    let hitWeight = 0;
    if (totalWeight > 0) {
      for (const round of completedRounds) {
        if (round.bids[player.id] === round.tricksTaken[player.id]) {
          hitWeight += Math.sqrt(round.cardsDealt);
        }
      }
    }
    const bidAccuracyScore = totalWeight > 0 ? hitWeight / totalWeight : 0;

    // Placement score
    const placementScore =
      n > 1 ? (n - placements[player.id]) / (n - 1) : 1;

    // Ambition score (simplified — same as in calculatePerformanceScores)
    let ambitionSum = 0;
    for (const round of completedRounds) {
      if (round.bids[player.id] === round.tricksTaken[player.id]) {
        ambitionSum += round.bids[player.id] / round.cardsDealt;
      }
    }
    const rawAmbition = totalRounds > 0 ? ambitionSum / totalRounds : 0;

    return {
      playerId: player.id,
      playerName: playerNames[player.id] ?? '?',
      eloBefore: player.elo,
      eloAfter: player.elo + (eloChanges[player.id] || 0),
      eloChange: eloChanges[player.id] || 0,
      placement: placements[player.id],
      placementScore,
      bidAccuracy,
      bidAccuracyScore,
      ambitionScore: rawAmbition,
      performanceScore: performanceScores[player.id] || 0,
      avgOpponentElo,
      playerCountMultiplier: playerMultiplier,
      roundCountMultiplier: roundMultiplier,
      totalRounds,
      playerCount: n,
      expectedOutcome,
      actualOutcome,
    };
  });
}
