import type { Player, Game, Round } from '../types';

interface AnalysisInsight {
  type: 'strength' | 'weakness' | 'tip';
  title: string;
  detail: string;
}

interface PerCardStats {
  cardCount: number;
  rounds: number;
  hits: number;
}

export function generatePlayerAnalysis(
  player: Player,
  games: Game[],
): AnalysisInsight[] {
  const completedGames = games.filter(
    (g) => g.status === 'completed' && g.playerIds.includes(player.id),
  );

  if (completedGames.length === 0) return [];

  const allRounds: Round[] = [];
  for (const game of completedGames) {
    for (const round of game.rounds) {
      if (round.status === 'complete' && player.id in round.bids) {
        allRounds.push(round);
      }
    }
  }

  if (allRounds.length === 0) return [];

  const insights: AnalysisInsight[] = [];
  const { stats } = player;

  const bidAcc =
    stats.totalRoundsPlayed > 0
      ? stats.totalBidsCorrect / stats.totalRoundsPlayed
      : 0;
  const avgBid =
    stats.totalRoundsPlayed > 0
      ? stats.totalBidsSum / stats.totalRoundsPlayed
      : 0;
  const winRate =
    stats.gamesPlayed > 0 ? stats.gamesWon / stats.gamesPlayed : 0;
  const avgPlacement =
    stats.gamesPlayed > 0
      ? stats.totalPlacement / stats.gamesPlayed
      : 0;

  // --- Bid accuracy analysis ---
  if (bidAcc >= 0.6) {
    insights.push({
      type: 'strength',
      title: 'Psychic Bidder',
      detail: `Nails ${(bidAcc * 100).toFixed(0)}% of bids. Either you can count cards or you sold your soul — either way, it's working.`,
    });
  } else if (bidAcc >= 0.45) {
    insights.push({
      type: 'strength',
      title: 'Steady Hand',
      detail: `Hits ${(bidAcc * 100).toFixed(0)}% of bids — solid and reliable. Not flashy, but your opponents should be nervous.`,
    });
  } else if (bidAcc >= 0.3) {
    insights.push({
      type: 'tip',
      title: 'Room to Grow',
      detail: `Hitting ${(bidAcc * 100).toFixed(0)}% of bids. Not terrible, but your crystal ball might need a firmware update.`,
    });
  } else {
    insights.push({
      type: 'weakness',
      title: 'Wild Guesser',
      detail: `Only hitting ${(bidAcc * 100).toFixed(0)}% of bids. A coin flip would be more accurate — maybe try one?`,
    });
  }

  // --- Over-bidding vs under-bidding ---
  let overBids = 0;
  let underBids = 0;
  let perfectBids = 0;
  let totalOverAmount = 0;
  let totalUnderAmount = 0;

  for (const round of allRounds) {
    const bid = round.bids[player.id];
    const tricks = round.tricksTaken[player.id];
    if (bid > tricks) {
      overBids++;
      totalOverAmount += bid - tricks;
    } else if (bid < tricks) {
      underBids++;
      totalUnderAmount += tricks - bid;
    } else {
      perfectBids++;
    }
  }

  const totalMisses = overBids + underBids;
  if (totalMisses > 0) {
    const overPct = overBids / totalMisses;
    if (overPct >= 0.65) {
      insights.push({
        type: 'weakness',
        title: 'The Optimist',
        detail: `Overbids ${(overPct * 100).toFixed(0)}% of the time when wrong. You believe in yourself more than your cards do.`,
      });
      insights.push({
        type: 'tip',
        title: 'Dial It Back',
        detail: `Try bidding 1 less when you're unsure. Your ego will recover, and your score won't.`,
      });
    } else if (overPct <= 0.35) {
      insights.push({
        type: 'weakness',
        title: 'The Sandbagger',
        detail: `Underbids ${((1 - overPct) * 100).toFixed(0)}% of the time when wrong. Playing it safe? More like leaving points on the table.`,
      });
      insights.push({
        type: 'tip',
        title: 'Bet on Yourself',
        detail: `You're taking more tricks than you think. Trust your cards — they trust you.`,
      });
    } else {
      insights.push({
        type: 'strength',
        title: 'Balanced Misser',
        detail: `When you miss, it goes both ways equally. At least your errors are fair and balanced.`,
      });
    }
  }

  // --- High-card vs low-card performance ---
  const perCard: Record<number, PerCardStats> = {};
  for (const round of allRounds) {
    const c = round.cardsDealt;
    if (!perCard[c]) perCard[c] = { cardCount: c, rounds: 0, hits: 0 };
    perCard[c].rounds++;
    if (round.bids[player.id] === round.tricksTaken[player.id]) {
      perCard[c].hits++;
    }
  }

  const cardCounts = Object.keys(perCard).map(Number).sort((a, b) => a - b);
  if (cardCounts.length >= 3) {
    const mid = Math.ceil(cardCounts.length / 2);
    const lowCards = cardCounts.slice(0, mid);
    const highCards = cardCounts.slice(mid);

    let lowHits = 0, lowRounds = 0;
    for (const c of lowCards) {
      lowHits += perCard[c].hits;
      lowRounds += perCard[c].rounds;
    }

    let highHits = 0, highRounds = 0;
    for (const c of highCards) {
      highHits += perCard[c].hits;
      highRounds += perCard[c].rounds;
    }

    const lowAcc = lowRounds > 0 ? lowHits / lowRounds : 0;
    const highAcc = highRounds > 0 ? highHits / highRounds : 0;

    if (lowAcc > highAcc + 0.15 && lowRounds >= 3) {
      insights.push({
        type: 'strength',
        title: 'Small Ball Specialist',
        detail: `${(lowAcc * 100).toFixed(0)}% accurate on low-card rounds vs ${(highAcc * 100).toFixed(0)}% on high-card. You thrive in chaos when the stakes are small.`,
      });
      insights.push({
        type: 'tip',
        title: 'Think Bigger',
        detail: `High-card rounds are where the big points hide. Focus on reading the table when there are more cards in play.`,
      });
    } else if (highAcc > lowAcc + 0.15 && highRounds >= 3) {
      insights.push({
        type: 'strength',
        title: 'Big Game Hunter',
        detail: `${(highAcc * 100).toFixed(0)}% accurate on high-card rounds vs ${(lowAcc * 100).toFixed(0)}% on low-card. You feast when there's more on the line.`,
      });
      insights.push({
        type: 'tip',
        title: 'Sweat the Small Stuff',
        detail: `Low-card rounds add up. Don't sleepwalk through the 1s and 2s — they're sneaky point factories.`,
      });
    }
  }

  // --- Win rate ---
  if (winRate >= 0.4 && stats.gamesPlayed >= 3) {
    insights.push({
      type: 'strength',
      title: 'Closer',
      detail: `Wins ${(winRate * 100).toFixed(0)}% of games. When it matters, you deliver. Other players should consider therapy.`,
    });
  } else if (winRate <= 0.1 && stats.gamesPlayed >= 3) {
    insights.push({
      type: 'weakness',
      title: 'Participation Trophy',
      detail: `${(winRate * 100).toFixed(0)}% win rate across ${stats.gamesPlayed} games. You show up, and honestly? That's what counts. (It isn't.)`,
    });
  }

  // --- Placement consistency ---
  if (avgPlacement <= 1.5 && stats.gamesPlayed >= 3) {
    insights.push({
      type: 'strength',
      title: 'The Podium Is Home',
      detail: `Average placement of ${avgPlacement.toFixed(1)} — basically allergic to losing. Must be nice.`,
    });
  } else if (avgPlacement >= 3.5 && stats.gamesPlayed >= 3) {
    insights.push({
      type: 'weakness',
      title: 'Bottom Feeder',
      detail: `Average placement of ${avgPlacement.toFixed(1)}. You're single-handedly keeping the bottom of the leaderboard warm.`,
    });
  }

  // --- Bid ambition (avg bid vs avg cards) ---
  let totalBidRatio = 0;
  for (const round of allRounds) {
    totalBidRatio += round.bids[player.id] / round.cardsDealt;
  }
  const avgBidRatio = totalBidRatio / allRounds.length;

  if (avgBidRatio >= 0.5) {
    insights.push({
      type: bidAcc >= 0.45 ? 'strength' : 'weakness',
      title: bidAcc >= 0.45 ? 'High Roller' : 'Eyes Bigger Than Cards',
      detail:
        bidAcc >= 0.45
          ? `Bids an average of ${(avgBidRatio * 100).toFixed(0)}% of available tricks — and backs it up. Fearless.`
          : `Bids ${(avgBidRatio * 100).toFixed(0)}% of available tricks but can't quite cash those checks. Bold strategy, Cotton.`,
    });
  } else if (avgBidRatio <= 0.25) {
    insights.push({
      type: bidAcc >= 0.5 ? 'strength' : 'weakness',
      title: bidAcc >= 0.5 ? 'The Sniper' : 'Playing Not to Lose',
      detail:
        bidAcc >= 0.5
          ? `Conservative bids at ${(avgBidRatio * 100).toFixed(0)}% ratio, but rarely misses. Efficient. Ruthless. Boring, but effective.`
          : `Bids low at ${(avgBidRatio * 100).toFixed(0)}% ratio and still misses. You're the living embodiment of "no risk, still no reward."`,
    });
  }

  // --- Zero-bid performance ---
  let zeroBids = 0;
  let zeroHits = 0;
  for (const round of allRounds) {
    if (round.bids[player.id] === 0) {
      zeroBids++;
      if (round.tricksTaken[player.id] === 0) zeroHits++;
    }
  }
  if (zeroBids >= 3) {
    const zeroAcc = zeroHits / zeroBids;
    if (zeroAcc >= 0.8) {
      insights.push({
        type: 'strength',
        title: 'Nil Assassin',
        detail: `Bids zero ${zeroBids} times, nails it ${(zeroAcc * 100).toFixed(0)}% of the time. The art of doing nothing, perfected.`,
      });
    } else if (zeroAcc <= 0.4) {
      insights.push({
        type: 'weakness',
        title: 'Accidental Winner',
        detail: `Bids zero but somehow takes tricks ${((1 - zeroAcc) * 100).toFixed(0)}% of the time. Your cards didn't get the memo.`,
      });
    }
  }

  // --- Dealer performance ---
  let dealerRounds = 0;
  let dealerHits = 0;
  let nonDealerRounds = 0;
  let nonDealerHits = 0;
  for (const round of allRounds) {
    if (round.dealerPlayerId === player.id) {
      dealerRounds++;
      if (round.bids[player.id] === round.tricksTaken[player.id]) dealerHits++;
    } else {
      nonDealerRounds++;
      if (round.bids[player.id] === round.tricksTaken[player.id]) nonDealerHits++;
    }
  }
  if (dealerRounds >= 3 && nonDealerRounds >= 3) {
    const dealerAcc = dealerHits / dealerRounds;
    const nonDealerAcc = nonDealerHits / nonDealerRounds;
    if (dealerAcc > nonDealerAcc + 0.15) {
      insights.push({
        type: 'strength',
        title: 'House Advantage',
        detail: `${(dealerAcc * 100).toFixed(0)}% accuracy as dealer vs ${(nonDealerAcc * 100).toFixed(0)}% otherwise. Dealing the cards? More like dealing justice.`,
      });
    } else if (nonDealerAcc > dealerAcc + 0.15) {
      insights.push({
        type: 'weakness',
        title: 'Dealer Curse',
        detail: `${(dealerAcc * 100).toFixed(0)}% accuracy as dealer vs ${(nonDealerAcc * 100).toFixed(0)}% otherwise. The restricted bid haunts your dreams.`,
      });
    }
  }

  return insights;
}
