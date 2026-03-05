import type { Game, Player } from '../types';
import { calculateCumulativeScores } from './scoring';

export interface Narrative {
  emoji: string;
  text: string;
  priority: number;
}

export function generateGameNarratives(
  game: Game,
  players: Player[],
  allGames: Game[],
): Narrative[] {
  const completedRounds = game.rounds.filter((r) => r.status === 'complete');
  if (completedRounds.length === 0) return [];

  const narratives: Narrative[] = [];
  const cumulative = calculateCumulativeScores(game.rounds, game.playerIds);
  const sorted = [...game.playerIds].sort(
    (a, b) => (cumulative[b] || 0) - (cumulative[a] || 0),
  );
  const leaderId = sorted[0];
  const leaderScore = cumulative[leaderId] || 0;
  const secondScore = sorted.length > 1 ? cumulative[sorted[1]] || 0 : 0;
  const totalRounds = game.roundSequence.length;
  const progress = completedRounds.length / totalRounds;

  const name = (id: string) => players.find((p) => p.id === id)?.name ?? '??';

  const pastGames = allGames.filter(
    (g) => g.status === 'completed' && g.id !== game.id,
  );

  // --- First win watch ---
  const leaderPlayer = players.find((p) => p.id === leaderId);
  if (leaderPlayer && leaderPlayer.stats.gamesWon === 0 && progress >= 0.4) {
    narratives.push({
      emoji: '\u{1F31F}',
      text: `This could be ${name(leaderId)}'s first ever win!`,
      priority: 10,
    });
  }

  // --- Dynasty alert ---
  if (leaderPlayer) {
    const recentWins = getConsecutiveWins(leaderId, pastGames);
    if (recentWins >= 2 && progress >= 0.4) {
      narratives.push({
        emoji: '\u{1F451}',
        text: `${name(leaderId)} has won ${recentWins} straight — dynasty in the making?`,
        priority: 9,
      });
    }
  }

  // --- Losing streak redemption ---
  const leaderLosses = getConsecutiveLosses(leaderId, pastGames);
  if (leaderLosses >= 3 && progress >= 0.3) {
    narratives.push({
      emoji: '\u{1F525}',
      text: `${name(leaderId)} came in on a ${leaderLosses}-game cold streak. Revenge arc loading...`,
      priority: 8,
    });
  }

  // --- Last place player on a hot bid streak this game ---
  for (const id of game.playerIds) {
    const streak = getCurrentBidStreak(id, completedRounds);
    if (streak >= 3) {
      narratives.push({
        emoji: '\u{1F3AF}',
        text: `${name(id)} has hit ${streak} bids in a row — locked in.`,
        priority: 7,
      });
    }
  }

  // --- Cold streak (missed bids) ---
  for (const id of game.playerIds) {
    const missStreak = getCurrentMissStreak(id, completedRounds);
    if (missStreak >= 3) {
      narratives.push({
        emoji: '\u{1F9CA}',
        text: `${name(id)} has missed ${missStreak} straight bids. Ice cold.`,
        priority: 6,
      });
    }
  }

  // --- Blowout ---
  if (sorted.length >= 2 && leaderScore - secondScore >= 20 && progress >= 0.3) {
    narratives.push({
      emoji: '\u{1F680}',
      text: `${name(leaderId)} is running away with it — ${leaderScore - secondScore} points clear.`,
      priority: 7,
    });
  }

  // --- Neck and neck ---
  if (sorted.length >= 2 && leaderScore > 0 && leaderScore - secondScore <= 3 && progress >= 0.4) {
    narratives.push({
      emoji: '\u{26A1}',
      text: `${name(leaderId)} and ${name(sorted[1])} are separated by just ${leaderScore - secondScore} point${leaderScore - secondScore !== 1 ? 's' : ''}!`,
      priority: 8,
    });
  }

  // --- Comeback watch ---
  if (completedRounds.length >= 3) {
    const halfRounds = completedRounds.slice(0, Math.ceil(completedRounds.length / 2));
    const halfScores = calculateCumulativeScores(halfRounds, game.playerIds);
    const halfSorted = [...game.playerIds].sort(
      (a, b) => (halfScores[b] || 0) - (halfScores[a] || 0),
    );
    const wasLast = halfSorted[halfSorted.length - 1];
    const nowIdx = sorted.indexOf(wasLast);
    if (nowIdx === 0 && wasLast !== halfSorted[0]) {
      narratives.push({
        emoji: '\u{1F4AA}',
        text: `${name(wasLast)} was in last place at the halfway mark — now leads!`,
        priority: 9,
      });
    } else if (nowIdx <= 1 && halfSorted.indexOf(wasLast) >= sorted.length - 1 && sorted.length >= 3) {
      narratives.push({
        emoji: '\u{1F4C8}',
        text: `${name(wasLast)} has climbed from last to ${nowIdx === 0 ? '1st' : '2nd'}. Comeback szn.`,
        priority: 8,
      });
    }
  }

  // --- Perfect game watch ---
  for (const id of game.playerIds) {
    const allHits = completedRounds.every(
      (r) => r.bids[id] === r.tricksTaken[id],
    );
    if (allHits && completedRounds.length >= 3) {
      narratives.push({
        emoji: '\u{1F48E}',
        text: `${name(id)} hasn't missed a single bid. Perfect game alert.`,
        priority: 10,
      });
    }
  }

  // --- Biggest upset potential (lowest ELO leading) ---
  if (progress >= 0.5) {
    const elos = game.playerIds.map((id) => ({
      id,
      elo: players.find((p) => p.id === id)?.elo ?? 1000,
    }));
    const lowestElo = elos.reduce((a, b) => (a.elo < b.elo ? a : b));
    if (lowestElo.id === leaderId && elos.length >= 3) {
      const highestElo = elos.reduce((a, b) => (a.elo > b.elo ? a : b));
      if (highestElo.elo - lowestElo.elo >= 30) {
        narratives.push({
          emoji: '\u{1F3C6}',
          text: `Upset alert! ${name(leaderId)} (lowest ELO) is leading over ${name(highestElo.id)}.`,
          priority: 8,
        });
      }
    }
  }

  // --- Down to the wire ---
  if (progress >= 0.8 && sorted.length >= 2 && leaderScore - secondScore <= 10) {
    narratives.push({
      emoji: '\u{23F0}',
      text: `Final stretch — anyone's game with just ${totalRounds - completedRounds.length} round${totalRounds - completedRounds.length !== 1 ? 's' : ''} left.`,
      priority: 7,
    });
  }

  // Sort by priority, return top narratives
  return narratives
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);
}

function getConsecutiveWins(
  playerId: string,
  pastGames: Game[],
): number {
  const playerGames = pastGames
    .filter((g) => g.playerIds.includes(playerId) && g.finalScores)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let streak = 0;
  for (const g of playerGames) {
    const scores = g.finalScores!;
    const maxScore = Math.max(...Object.values(scores));
    if (scores[playerId] === maxScore) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getConsecutiveLosses(
  playerId: string,
  pastGames: Game[],
): number {
  const playerGames = pastGames
    .filter((g) => g.playerIds.includes(playerId) && g.finalScores)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let streak = 0;
  for (const g of playerGames) {
    const scores = g.finalScores!;
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const rank = sorted.findIndex(([id]) => id === playerId) + 1;
    if (rank >= Math.ceil(sorted.length / 2) + 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getCurrentBidStreak(
  playerId: string,
  completedRounds: Game['rounds'],
): number {
  let streak = 0;
  for (let i = completedRounds.length - 1; i >= 0; i--) {
    const r = completedRounds[i];
    if (r.bids[playerId] === r.tricksTaken[playerId]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getCurrentMissStreak(
  playerId: string,
  completedRounds: Game['rounds'],
): number {
  let streak = 0;
  for (let i = completedRounds.length - 1; i >= 0; i--) {
    const r = completedRounds[i];
    if (r.bids[playerId] !== r.tricksTaken[playerId]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
