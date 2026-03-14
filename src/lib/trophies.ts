import type { Game, Player } from '../types';

export interface TrophyRecord {
  label: string;
  description: string;
  playerName: string;
  playerId: string;
  value: string;
  gameDate: string;
  gameId: string;
  icon: 'crown' | 'target' | 'percent' | 'flame' | 'trophy' | 'skull' | 'zap' | 'award';
}

export interface AllTimeTrophy {
  label: string;
  description: string;
  playerName: string;
  playerId: string;
  value: string;
  icon: 'trophy' | 'flame' | 'target' | 'percent' | 'award';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getPlayerName(playerId: string, players: Player[]): string {
  return players.find((p) => p.id === playerId)?.name ?? 'Unknown';
}

export function computeGameTrophies(
  games: readonly Game[],
  players: readonly Player[],
): TrophyRecord[] {
  const completed = games.filter((g) => g.status === 'completed' && g.finalScores);
  if (completed.length === 0) return [];

  const trophies: TrophyRecord[] = [];

  // --- Highest score in a game ---
  let highestScore = -Infinity;
  let highestScorePlayer = '';
  let highestScoreGame: Game | null = null;

  for (const game of completed) {
    for (const [pid, score] of Object.entries(game.finalScores!)) {
      if (score > highestScore) {
        highestScore = score;
        highestScorePlayer = pid;
        highestScoreGame = game;
      }
    }
  }

  if (highestScoreGame) {
    trophies.push({
      label: 'Highest Score',
      description: 'Best single-game score ever recorded',
      playerName: getPlayerName(highestScorePlayer, players),
      playerId: highestScorePlayer,
      value: String(highestScore),
      gameDate: formatDate(highestScoreGame.date),
      gameId: highestScoreGame.id,
      icon: 'crown',
    });
  }

  // --- Lowest score in a game ---
  let lowestScore = Infinity;
  let lowestScorePlayer = '';
  let lowestScoreGame: Game | null = null;

  for (const game of completed) {
    for (const [pid, score] of Object.entries(game.finalScores!)) {
      if (score < lowestScore) {
        lowestScore = score;
        lowestScorePlayer = pid;
        lowestScoreGame = game;
      }
    }
  }

  if (lowestScoreGame) {
    trophies.push({
      label: 'Lowest Score',
      description: 'Worst single-game score on record',
      playerName: getPlayerName(lowestScorePlayer, players),
      playerId: lowestScorePlayer,
      value: String(lowestScore),
      gameDate: formatDate(lowestScoreGame.date),
      gameId: lowestScoreGame.id,
      icon: 'skull',
    });
  }

  // --- Most bids hit in a single game ---
  let mostBidsHit = 0;
  let mostBidsHitPlayer = '';
  let mostBidsHitGame: Game | null = null;

  for (const game of completed) {
    const completedRounds = game.rounds.filter((r) => r.status === 'complete');
    for (const pid of game.playerIds) {
      let hits = 0;
      for (const round of completedRounds) {
        if (round.bids[pid] === round.tricksTaken[pid]) {
          hits++;
        }
      }
      if (hits > mostBidsHit) {
        mostBidsHit = hits;
        mostBidsHitPlayer = pid;
        mostBidsHitGame = game;
      }
    }
  }

  if (mostBidsHitGame) {
    trophies.push({
      label: 'Most Bids Hit',
      description: 'Most correct bids in a single game',
      playerName: getPlayerName(mostBidsHitPlayer, players),
      playerId: mostBidsHitPlayer,
      value: `${mostBidsHit} bids`,
      gameDate: formatDate(mostBidsHitGame.date),
      gameId: mostBidsHitGame.id,
      icon: 'target',
    });
  }

  // --- Highest bid accuracy % in a single game (min 5 rounds) ---
  let bestAccuracy = 0;
  let bestAccuracyPlayer = '';
  let bestAccuracyGame: Game | null = null;
  let bestAccuracyHits = 0;
  let bestAccuracyTotal = 0;

  for (const game of completed) {
    const completedRounds = game.rounds.filter((r) => r.status === 'complete');
    if (completedRounds.length < 5) continue;

    for (const pid of game.playerIds) {
      let hits = 0;
      for (const round of completedRounds) {
        if (round.bids[pid] === round.tricksTaken[pid]) {
          hits++;
        }
      }
      const accuracy = hits / completedRounds.length;
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        bestAccuracyPlayer = pid;
        bestAccuracyGame = game;
        bestAccuracyHits = hits;
        bestAccuracyTotal = completedRounds.length;
      }
    }
  }

  if (bestAccuracyGame) {
    trophies.push({
      label: 'Best Bid Accuracy',
      description: `Highest bid hit rate in a game (min 5 rounds) — ${bestAccuracyHits}/${bestAccuracyTotal}`,
      playerName: getPlayerName(bestAccuracyPlayer, players),
      playerId: bestAccuracyPlayer,
      value: `${Math.round(bestAccuracy * 100)}%`,
      gameDate: formatDate(bestAccuracyGame.date),
      gameId: bestAccuracyGame.id,
      icon: 'percent',
    });
  }

  // --- Highest margin of victory ---
  let biggestMargin = 0;
  let marginWinner = '';
  let marginGame: Game | null = null;

  for (const game of completed) {
    const scores = Object.entries(game.finalScores!).sort(
      ([, a], [, b]) => b - a,
    );
    if (scores.length < 2) continue;
    const margin = scores[0][1] - scores[1][1];
    if (margin > biggestMargin) {
      biggestMargin = margin;
      marginWinner = scores[0][0];
      marginGame = game;
    }
  }

  if (marginGame && biggestMargin > 0) {
    trophies.push({
      label: 'Biggest Blowout',
      description: 'Largest margin of victory in a single game',
      playerName: getPlayerName(marginWinner, players),
      playerId: marginWinner,
      value: `+${biggestMargin} pts`,
      gameDate: formatDate(marginGame.date),
      gameId: marginGame.id,
      icon: 'zap',
    });
  }

  // --- Closest game (smallest margin of victory) ---
  let closestMargin = Infinity;
  let closestWinner = '';
  let closestGame: Game | null = null;

  for (const game of completed) {
    const scores = Object.entries(game.finalScores!).sort(
      ([, a], [, b]) => b - a,
    );
    if (scores.length < 2) continue;
    const margin = scores[0][1] - scores[1][1];
    if (margin < closestMargin && margin > 0) {
      closestMargin = margin;
      closestWinner = scores[0][0];
      closestGame = game;
    }
  }

  if (closestGame && closestMargin < Infinity) {
    trophies.push({
      label: 'Closest Victory',
      description: 'Narrowest winning margin ever',
      playerName: getPlayerName(closestWinner, players),
      playerId: closestWinner,
      value: `+${closestMargin} pt${closestMargin === 1 ? '' : 's'}`,
      gameDate: formatDate(closestGame.date),
      gameId: closestGame.id,
      icon: 'flame',
    });
  }

  // --- Highest single-round score ---
  let bestRoundScore = 0;
  let bestRoundPlayer = '';
  let bestRoundGame: Game | null = null;
  let bestRoundNum = 0;

  for (const game of completed) {
    for (const round of game.rounds) {
      if (round.status !== 'complete') continue;
      for (const [pid, score] of Object.entries(round.scores)) {
        if (score > bestRoundScore) {
          bestRoundScore = score;
          bestRoundPlayer = pid;
          bestRoundGame = game;
          bestRoundNum = round.roundNumber;
        }
      }
    }
  }

  if (bestRoundGame) {
    trophies.push({
      label: 'Best Round',
      description: `Highest single-round score (Round ${bestRoundNum})`,
      playerName: getPlayerName(bestRoundPlayer, players),
      playerId: bestRoundPlayer,
      value: `${bestRoundScore} pts`,
      gameDate: formatDate(bestRoundGame.date),
      gameId: bestRoundGame.id,
      icon: 'award',
    });
  }

  return trophies;
}

export function computeAllTimeTrophies(
  players: readonly Player[],
): AllTimeTrophy[] {
  const active = players.filter((p) => p.stats.gamesPlayed > 0);
  if (active.length === 0) return [];

  const trophies: AllTimeTrophy[] = [];

  // --- Most wins ---
  const mostWinsPlayer = [...active].sort(
    (a, b) => b.stats.gamesWon - a.stats.gamesWon,
  )[0];
  trophies.push({
    label: 'Most Wins',
    description: 'All-time career victory leader',
    playerName: mostWinsPlayer.name,
    playerId: mostWinsPlayer.id,
    value: `${mostWinsPlayer.stats.gamesWon} wins`,
    icon: 'trophy',
  });

  // --- Best all-time bid accuracy (min 10 rounds) ---
  const withAccuracy = active
    .filter((p) => p.stats.totalRoundsPlayed >= 10)
    .map((p) => ({
      ...p,
      accuracy: p.stats.totalBidsCorrect / p.stats.totalRoundsPlayed,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  if (withAccuracy.length > 0) {
    const best = withAccuracy[0];
    trophies.push({
      label: 'Sharpshooter',
      description: `Best career bid accuracy (min 10 rounds) — ${best.stats.totalBidsCorrect}/${best.stats.totalRoundsPlayed}`,
      playerName: best.name,
      playerId: best.id,
      value: `${Math.round(best.accuracy * 100)}%`,
      icon: 'target',
    });
  }

  // --- Best win rate (min 3 games) ---
  const withWinRate = active
    .filter((p) => p.stats.gamesPlayed >= 3)
    .map((p) => ({
      ...p,
      winRate: p.stats.gamesWon / p.stats.gamesPlayed,
    }))
    .sort((a, b) => b.winRate - a.winRate);

  if (withWinRate.length > 0) {
    const best = withWinRate[0];
    trophies.push({
      label: 'Win Machine',
      description: `Highest career win rate (min 3 games) — ${best.stats.gamesWon}/${best.stats.gamesPlayed}`,
      playerName: best.name,
      playerId: best.id,
      value: `${Math.round(best.winRate * 100)}%`,
      icon: 'flame',
    });
  }

  // --- Most games played ---
  const mostGamesPlayer = [...active].sort(
    (a, b) => b.stats.gamesPlayed - a.stats.gamesPlayed,
  )[0];
  trophies.push({
    label: 'Iron Player',
    description: 'Most games played all-time',
    playerName: mostGamesPlayer.name,
    playerId: mostGamesPlayer.id,
    value: `${mostGamesPlayer.stats.gamesPlayed} games`,
    icon: 'award',
  });

  // --- Highest ELO ---
  const highestElo = [...active].sort((a, b) => b.elo - a.elo)[0];
  trophies.push({
    label: 'Peak Rating',
    description: 'Highest current ELO rating',
    playerName: highestElo.name,
    playerId: highestElo.id,
    value: `${highestElo.elo} ELO`,
    icon: 'trophy',
  });

  return trophies;
}
