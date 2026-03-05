import type { Player, Game, Round, PlayerAnalysis, PlayerAnalysisItem } from '../types';

interface Candidate {
  title: string;
  detail: string;
  priority: number; // higher = more relevant
}

export function generatePlayerAnalysis(
  player: Player,
  games: Game[],
): PlayerAnalysis | null {
  const completedGames = games.filter(
    (g) => g.status === 'completed' && g.playerIds.includes(player.id),
  );

  if (completedGames.length === 0) return null;

  const allRounds: Round[] = [];
  for (const game of completedGames) {
    for (const round of game.rounds) {
      if (round.status === 'complete' && player.id in round.bids) {
        allRounds.push(round);
      }
    }
  }

  if (allRounds.length === 0) return null;

  const pros: Candidate[] = [];
  const cons: Candidate[] = [];
  const advice: Candidate[] = [];

  const { stats } = player;
  const bidAcc = stats.totalRoundsPlayed > 0
    ? stats.totalBidsCorrect / stats.totalRoundsPlayed
    : 0;
  const winRate = stats.gamesPlayed > 0 ? stats.gamesWon / stats.gamesPlayed : 0;
  const avgPlacement = stats.gamesPlayed > 0
    ? stats.totalPlacement / stats.gamesPlayed
    : 0;

  // --- Over/under bid stats ---
  let overBids = 0;
  let underBids = 0;
  for (const round of allRounds) {
    const bid = round.bids[player.id];
    const tricks = round.tricksTaken[player.id];
    if (bid > tricks) overBids++;
    else if (bid < tricks) underBids++;
  }
  const totalMisses = overBids + underBids;
  const overPct = totalMisses > 0 ? overBids / totalMisses : 0.5;

  // --- Per-card-count stats ---
  const perCard: Record<number, { rounds: number; hits: number }> = {};
  for (const round of allRounds) {
    const c = round.cardsDealt;
    if (!perCard[c]) perCard[c] = { rounds: 0, hits: 0 };
    perCard[c].rounds++;
    if (round.bids[player.id] === round.tricksTaken[player.id]) perCard[c].hits++;
  }
  const cardCounts = Object.keys(perCard).map(Number).sort((a, b) => a - b);

  let lowAcc = 0, highAcc = 0, hasCardSplit = false;
  if (cardCounts.length >= 3) {
    const mid = Math.ceil(cardCounts.length / 2);
    let lowHits = 0, lowRounds = 0, highHits = 0, highRounds = 0;
    for (const c of cardCounts.slice(0, mid)) { lowHits += perCard[c].hits; lowRounds += perCard[c].rounds; }
    for (const c of cardCounts.slice(mid)) { highHits += perCard[c].hits; highRounds += perCard[c].rounds; }
    lowAcc = lowRounds > 0 ? lowHits / lowRounds : 0;
    highAcc = highRounds > 0 ? highHits / highRounds : 0;
    hasCardSplit = lowRounds >= 3 && highRounds >= 3;
  }

  // --- Bid ambition ---
  let totalBidRatio = 0;
  for (const round of allRounds) {
    totalBidRatio += round.bids[player.id] / round.cardsDealt;
  }
  const avgBidRatio = totalBidRatio / allRounds.length;

  // --- Zero-bid stats ---
  let zeroBids = 0, zeroHits = 0;
  for (const round of allRounds) {
    if (round.bids[player.id] === 0) {
      zeroBids++;
      if (round.tricksTaken[player.id] === 0) zeroHits++;
    }
  }
  const zeroAcc = zeroBids > 0 ? zeroHits / zeroBids : 0;

  // --- Dealer stats ---
  let dealerRounds = 0, dealerHits = 0, nonDealerRounds = 0, nonDealerHits = 0;
  for (const round of allRounds) {
    if (round.dealerPlayerId === player.id) {
      dealerRounds++;
      if (round.bids[player.id] === round.tricksTaken[player.id]) dealerHits++;
    } else {
      nonDealerRounds++;
      if (round.bids[player.id] === round.tricksTaken[player.id]) nonDealerHits++;
    }
  }
  const dealerAcc = dealerRounds > 0 ? dealerHits / dealerRounds : 0;
  const nonDealerAcc = nonDealerRounds > 0 ? nonDealerHits / nonDealerRounds : 0;

  // =====================
  // PROS
  // =====================
  if (bidAcc >= 0.6) {
    pros.push({ priority: 10, title: 'Psychic Bidder', detail: `Nails ${(bidAcc * 100).toFixed(0)}% of bids. Either you can count cards or you sold your soul — either way, it's working.` });
  } else if (bidAcc >= 0.45) {
    pros.push({ priority: 8, title: 'Steady Hand', detail: `Hits ${(bidAcc * 100).toFixed(0)}% of bids — solid and reliable. Not flashy, but your opponents should be nervous.` });
  }

  if (winRate >= 0.4 && stats.gamesPlayed >= 2) {
    pros.push({ priority: 9, title: 'Closer', detail: `Wins ${(winRate * 100).toFixed(0)}% of games. When it matters, you deliver. Other players should consider therapy.` });
  } else if (winRate >= 0.25 && stats.gamesPlayed >= 2) {
    pros.push({ priority: 5, title: 'Contender', detail: `${(winRate * 100).toFixed(0)}% win rate — you're always in the mix. Not quite the final boss, but definitely a mini-boss.` });
  }

  if (avgPlacement <= 1.5 && stats.gamesPlayed >= 2) {
    pros.push({ priority: 9, title: 'Podium Regular', detail: `Average placement of ${avgPlacement.toFixed(1)} — basically allergic to losing. Must be nice.` });
  } else if (avgPlacement <= 2.5 && stats.gamesPlayed >= 2) {
    pros.push({ priority: 5, title: 'Top Half Dweller', detail: `Average placement of ${avgPlacement.toFixed(1)}. Consistently above the fold — respectable.` });
  }

  if (totalMisses > 0 && overPct > 0.35 && overPct < 0.65) {
    pros.push({ priority: 4, title: 'Balanced Misser', detail: `When you miss, it goes both ways equally. At least your errors are fair and balanced.` });
  }

  if (hasCardSplit && lowAcc > highAcc + 0.15) {
    pros.push({ priority: 6, title: 'Small Ball Specialist', detail: `${(lowAcc * 100).toFixed(0)}% accurate on low-card rounds vs ${(highAcc * 100).toFixed(0)}% on high-card. You thrive when the stakes are small.` });
  } else if (hasCardSplit && highAcc > lowAcc + 0.15) {
    pros.push({ priority: 6, title: 'Big Game Hunter', detail: `${(highAcc * 100).toFixed(0)}% accurate on high-card rounds vs ${(lowAcc * 100).toFixed(0)}% on low-card. You feast when there's more on the line.` });
  }

  if (avgBidRatio >= 0.5 && bidAcc >= 0.45) {
    pros.push({ priority: 7, title: 'High Roller', detail: `Bids an average of ${(avgBidRatio * 100).toFixed(0)}% of available tricks — and backs it up. Fearless.` });
  } else if (avgBidRatio <= 0.25 && bidAcc >= 0.5) {
    pros.push({ priority: 7, title: 'The Sniper', detail: `Conservative bids at ${(avgBidRatio * 100).toFixed(0)}% ratio, but rarely misses. Efficient. Ruthless. Boring, but effective.` });
  }

  if (zeroBids >= 3 && zeroAcc >= 0.8) {
    pros.push({ priority: 6, title: 'Nil Assassin', detail: `Bids zero ${zeroBids} times, nails it ${(zeroAcc * 100).toFixed(0)}% of the time. The art of doing nothing, perfected.` });
  }

  if (dealerRounds >= 3 && nonDealerRounds >= 3 && dealerAcc > nonDealerAcc + 0.15) {
    pros.push({ priority: 5, title: 'House Advantage', detail: `${(dealerAcc * 100).toFixed(0)}% accuracy as dealer vs ${(nonDealerAcc * 100).toFixed(0)}% otherwise. Dealing the cards? More like dealing justice.` });
  }

  // Fallback pros
  if (pros.length === 0) {
    if (stats.gamesPlayed >= 1) {
      pros.push({ priority: 1, title: 'Shows Up', detail: `${stats.gamesPlayed} games played. Consistency is its own kind of talent — keep stacking those reps.` });
    }
    if (bidAcc >= 0.3) {
      pros.push({ priority: 2, title: 'Not Hopeless', detail: `${(bidAcc * 100).toFixed(0)}% bid accuracy — there's a foundation here. Diamonds are just coal under pressure.` });
    }
    if (pros.length === 0) {
      pros.push({ priority: 0, title: 'Brave Soul', detail: `Still in the game. That takes guts, if not skill. Respect.` });
    }
  }

  // =====================
  // CONS
  // =====================
  if (bidAcc < 0.3) {
    cons.push({ priority: 10, title: 'Wild Guesser', detail: `Only hitting ${(bidAcc * 100).toFixed(0)}% of bids. A coin flip would be more accurate — maybe try one?` });
  } else if (bidAcc < 0.45) {
    cons.push({ priority: 7, title: 'Shaky Reads', detail: `${(bidAcc * 100).toFixed(0)}% bid accuracy. Your crystal ball might need a firmware update.` });
  }

  if (totalMisses > 0 && overPct >= 0.65) {
    cons.push({ priority: 8, title: 'The Optimist', detail: `Overbids ${(overPct * 100).toFixed(0)}% of the time when wrong. You believe in yourself more than your cards do.` });
  } else if (totalMisses > 0 && overPct <= 0.35) {
    cons.push({ priority: 8, title: 'The Sandbagger', detail: `Underbids ${((1 - overPct) * 100).toFixed(0)}% of the time when wrong. Playing it safe? More like leaving points on the table.` });
  }

  if (winRate <= 0.1 && stats.gamesPlayed >= 3) {
    cons.push({ priority: 9, title: 'Participation Trophy', detail: `${(winRate * 100).toFixed(0)}% win rate across ${stats.gamesPlayed} games. You show up, and honestly? That's what counts. (It isn't.)` });
  } else if (winRate < 0.25 && stats.gamesPlayed >= 3) {
    cons.push({ priority: 6, title: 'Win Drought', detail: `${(winRate * 100).toFixed(0)}% win rate. The top spot isn't exactly calling your name.` });
  }

  if (avgPlacement >= 3.5 && stats.gamesPlayed >= 2) {
    cons.push({ priority: 8, title: 'Bottom Feeder', detail: `Average placement of ${avgPlacement.toFixed(1)}. You're single-handedly keeping the bottom of the leaderboard warm.` });
  } else if (avgPlacement >= 2.5 && stats.gamesPlayed >= 3) {
    cons.push({ priority: 5, title: 'Below the Fold', detail: `Average placement of ${avgPlacement.toFixed(1)}. Consistently in the bottom half — at least you're consistent.` });
  }

  if (avgBidRatio >= 0.5 && bidAcc < 0.45) {
    cons.push({ priority: 7, title: 'Eyes Bigger Than Cards', detail: `Bids ${(avgBidRatio * 100).toFixed(0)}% of available tricks but can't quite cash those checks. Bold strategy, Cotton.` });
  } else if (avgBidRatio <= 0.25 && bidAcc < 0.5) {
    cons.push({ priority: 6, title: 'Playing Not to Lose', detail: `Bids low at ${(avgBidRatio * 100).toFixed(0)}% ratio and still misses. The living embodiment of "no risk, still no reward."` });
  }

  if (zeroBids >= 3 && zeroAcc <= 0.4) {
    cons.push({ priority: 6, title: 'Accidental Winner', detail: `Bids zero but somehow takes tricks ${((1 - zeroAcc) * 100).toFixed(0)}% of the time. Your cards didn't get the memo.` });
  }

  if (dealerRounds >= 3 && nonDealerRounds >= 3 && nonDealerAcc > dealerAcc + 0.15) {
    cons.push({ priority: 5, title: 'Dealer Curse', detail: `${(dealerAcc * 100).toFixed(0)}% accuracy as dealer vs ${(nonDealerAcc * 100).toFixed(0)}% otherwise. The restricted bid haunts your dreams.` });
  }

  if (hasCardSplit && lowAcc > highAcc + 0.15) {
    cons.push({ priority: 4, title: 'Wilts Under Pressure', detail: `Only ${(highAcc * 100).toFixed(0)}% accurate on high-card rounds. The big moments aren't your thing — yet.` });
  } else if (hasCardSplit && highAcc > lowAcc + 0.15) {
    cons.push({ priority: 4, title: 'Sloppy on the Small Stuff', detail: `Only ${(lowAcc * 100).toFixed(0)}% accurate on low-card rounds. You sleepwalk through the easy ones.` });
  }

  // Fallback cons
  if (cons.length === 0) {
    if (bidAcc < 0.7) {
      cons.push({ priority: 1, title: 'Room at the Top', detail: `${(bidAcc * 100).toFixed(0)}% bid accuracy. Good, not great — there's always another level.` });
    }
    if (cons.length === 0) {
      cons.push({ priority: 0, title: 'Annoyingly Good', detail: `Hard to find a weakness. Your opponents hate this about you.` });
    }
  }

  // =====================
  // ADVICE
  // =====================
  if (totalMisses > 0 && overPct >= 0.65) {
    advice.push({ priority: 9, title: 'Dial It Back', detail: `Try bidding 1 less when you're unsure. Your ego will recover, and your score won't.` });
  } else if (totalMisses > 0 && overPct <= 0.35) {
    advice.push({ priority: 9, title: 'Bet on Yourself', detail: `You're taking more tricks than you think. Trust your cards — they trust you.` });
  }

  if (hasCardSplit && lowAcc > highAcc + 0.15) {
    advice.push({ priority: 7, title: 'Think Bigger', detail: `High-card rounds are where the big points hide. Focus on reading the table when there are more cards in play.` });
  } else if (hasCardSplit && highAcc > lowAcc + 0.15) {
    advice.push({ priority: 7, title: 'Sweat the Small Stuff', detail: `Low-card rounds add up. Don't sleepwalk through the 1s and 2s — they're sneaky point factories.` });
  }

  if (bidAcc < 0.45) {
    advice.push({ priority: 8, title: 'Count Your Outs', detail: `Before bidding, count your sure tricks (aces, high trumps) and add 1 for maybes. Sounds basic — because it works.` });
  }

  if (zeroBids >= 3 && zeroAcc <= 0.5) {
    advice.push({ priority: 6, title: 'Dodge the Lead', detail: `When you bid zero, play your highest cards early to avoid winning tricks late. Let others fight for the lead.` });
  }

  if (avgBidRatio >= 0.5 && bidAcc < 0.45) {
    advice.push({ priority: 7, title: 'Ego Check', detail: `You're bidding aggressively but not converting. Try matching your ambition to your hand, not your pride.` });
  }

  if (dealerRounds >= 3 && nonDealerRounds >= 3 && nonDealerAcc > dealerAcc + 0.15) {
    advice.push({ priority: 5, title: 'Own the Restriction', detail: `As dealer, the restricted bid forces creativity. Use it — bid around the restriction instead of fighting it.` });
  }

  if (winRate < 0.2 && stats.gamesPlayed >= 3) {
    advice.push({ priority: 6, title: 'Play the Long Game', detail: `Focus on hitting bids every round instead of chasing big scores. Consistency beats heroics in Oh Hell.` });
  }

  if (avgPlacement >= 3 && stats.gamesPlayed >= 2) {
    advice.push({ priority: 5, title: 'Watch the Leaders', detail: `Pay attention to what top players bid in similar spots. Pattern recognition is half the battle.` });
  }

  // Fallback advice
  if (advice.length === 0) {
    advice.push({ priority: 1, title: 'Stay Dangerous', detail: `You're doing well — keep mixing up your bids to stay unpredictable. Predictability is a weakness.` });
    advice.push({ priority: 0, title: 'Teach the Table', detail: `At your level, the best way to improve is to help others get better. Stronger opponents sharpen your game.` });
  }

  // Sort by priority descending, take top 3 each
  const pick = (arr: Candidate[], n: number): PlayerAnalysisItem[] =>
    arr.sort((a, b) => b.priority - a.priority)
      .slice(0, n)
      .map(({ title, detail }) => ({ title, detail }));

  return {
    pros: pick(pros, 3),
    cons: pick(cons, 3),
    advice: pick(advice, 3),
  };
}
