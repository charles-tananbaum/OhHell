import type { Game, Player } from '../types';

export function updatePlayerStatsAfterGame(
  player: Player,
  game: Game,
  placement: number,
  isWinner: boolean,
): Player {
  const completedRounds = game.rounds.filter((r) => r.status === 'complete');
  let bidsCorrect = 0;
  let bidsSum = 0;
  let roundsPlayed = 0;

  for (const round of completedRounds) {
    if (player.id in round.bids) {
      roundsPlayed++;
      bidsSum += round.bids[player.id];
      if (round.bids[player.id] === round.tricksTaken[player.id]) {
        bidsCorrect++;
      }
    }
  }

  return {
    ...player,
    stats: {
      gamesPlayed: player.stats.gamesPlayed + 1,
      gamesWon: player.stats.gamesWon + (isWinner ? 1 : 0),
      totalRoundsPlayed: player.stats.totalRoundsPlayed + roundsPlayed,
      totalBidsCorrect: player.stats.totalBidsCorrect + bidsCorrect,
      totalBidsSum: player.stats.totalBidsSum + bidsSum,
      totalPlacement: player.stats.totalPlacement + placement,
    },
  };
}

export function computeDisplayStats(player: Player) {
  const { stats } = player;
  return {
    gamesPlayed: stats.gamesPlayed,
    gamesWon: stats.gamesWon,
    avgBid:
      stats.totalRoundsPlayed > 0
        ? (stats.totalBidsSum / stats.totalRoundsPlayed).toFixed(2)
        : '—',
    bidAccuracy:
      stats.totalRoundsPlayed > 0
        ? (
            (stats.totalBidsCorrect / stats.totalRoundsPlayed) *
            100
          ).toFixed(1) + '%'
        : '—',
    avgPlacement:
      stats.gamesPlayed > 0
        ? (stats.totalPlacement / stats.gamesPlayed).toFixed(1)
        : '—',
    elo: player.elo,
  };
}

export function getPlacementsFromScores(
  finalScores: Record<string, number>,
): Record<string, number> {
  const sorted = Object.entries(finalScores).sort(([, a], [, b]) => b - a);
  const placements: Record<string, number> = {};
  let rank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i][1] < sorted[i - 1][1]) {
      rank = i + 1;
    }
    placements[sorted[i][0]] = rank;
  }
  return placements;
}
