import type { Player, Game, Round, PlayerAnalysis, PlayerAnalysisItem } from '../types';

interface Candidate {
  title: string;
  detail: string;
  priority: number;
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
  // PROS — FLYGOD ENERGY
  // =====================
  if (bidAcc >= 0.6) {
    pros.push({ priority: 10, title: 'Third Eye Open', detail: `${(bidAcc * 100).toFixed(0)}% bid accuracy. You seein' the cards before they even get dealt. That's that Griselda vision, nah mean? BOOM BOOM BOOM.` });
  } else if (bidAcc >= 0.45) {
    pros.push({ priority: 8, title: 'Steady Cookin\'', detail: `${(bidAcc * 100).toFixed(0)}% accuracy — you ain't the flashiest in the kitchen but the work speak for itself. Consistent like a brick on the scale.` });
  }

  if (winRate >= 0.4 && stats.gamesPlayed >= 2) {
    pros.push({ priority: 9, title: 'Top of the Food Chain', detail: `${(winRate * 100).toFixed(0)}% win rate. You eatin' everybody plate. The table is yours, they just sittin' at it. AH HA HA.` });
  } else if (winRate >= 0.25 && stats.gamesPlayed >= 2) {
    pros.push({ priority: 5, title: 'In the Cut', detail: `${(winRate * 100).toFixed(0)}% win rate — you always lurkin', always dangerous. Not the kingpin yet but you definitely a lieutenant.` });
  }

  if (avgPlacement <= 1.5 && stats.gamesPlayed >= 2) {
    pros.push({ priority: 9, title: 'Penthouse Floor', detail: `Average placement ${avgPlacement.toFixed(1)}. You don't even know what the bottom look like. Luxury livin'. FLYGOD.` });
  } else if (avgPlacement <= 2.5 && stats.gamesPlayed >= 2) {
    pros.push({ priority: 5, title: 'Upper Echelon', detail: `Average placement ${avgPlacement.toFixed(1)}. You stay in the top half like it's rent controlled. Solid real estate.` });
  }

  if (totalMisses > 0 && overPct > 0.35 && overPct < 0.65) {
    pros.push({ priority: 4, title: 'Even Keel', detail: `When you miss you miss both ways equal. At least the L's balanced like a good portfolio, nah mean.` });
  }

  if (hasCardSplit && lowAcc > highAcc + 0.15) {
    pros.push({ priority: 6, title: 'Small Plates, Big Chef', detail: `${(lowAcc * 100).toFixed(0)}% on low cards vs ${(highAcc * 100).toFixed(0)}% on high. You move surgical when the hand small. Scalpel work.` });
  } else if (hasCardSplit && highAcc > lowAcc + 0.15) {
    pros.push({ priority: 6, title: 'Big Dog Energy', detail: `${(highAcc * 100).toFixed(0)}% on high cards vs ${(lowAcc * 100).toFixed(0)}% on low. When the pot heavy you come alive. That's that big game hunger.` });
  }

  if (avgBidRatio >= 0.5 && bidAcc >= 0.45) {
    pros.push({ priority: 7, title: 'Bet the House', detail: `Biddin' ${(avgBidRatio * 100).toFixed(0)}% of the tricks and cashin' every check. You talk big and walk bigger. Westside Gunn numbers.` });
  } else if (avgBidRatio <= 0.25 && bidAcc >= 0.5) {
    pros.push({ priority: 7, title: 'Silent Assassin', detail: `Low bids at ${(avgBidRatio * 100).toFixed(0)}% ratio but you barely miss. Quiet money the loudest. Conway vibes.` });
  }

  if (zeroBids >= 3 && zeroAcc >= 0.8) {
    pros.push({ priority: 6, title: 'Ghost Protocol', detail: `Bid zero ${zeroBids} times, disappeared ${(zeroAcc * 100).toFixed(0)}% of the time. You a phantom out here. Can't take what you can't see.` });
  }

  if (dealerRounds >= 3 && nonDealerRounds >= 3 && dealerAcc > nonDealerAcc + 0.15) {
    pros.push({ priority: 5, title: 'Plug Walk', detail: `${(dealerAcc * 100).toFixed(0)}% as dealer vs ${(nonDealerAcc * 100).toFixed(0)}% otherwise. When you movin' the product you don't miss. The plug is the plug.` });
  }

  // Fallback pros
  if (pros.length === 0) {
    if (stats.gamesPlayed >= 1) {
      pros.push({ priority: 1, title: 'Showin\' Up', detail: `${stats.gamesPlayed} games deep. You puttin' in the hours on the block. The work gon' pay off eventually, keep grindin'.` });
    }
    if (bidAcc >= 0.3) {
      pros.push({ priority: 2, title: 'Got a Lil Somethin\'', detail: `${(bidAcc * 100).toFixed(0)}% accuracy — the foundation there. Every empire started with one brick, you feel me.` });
    }
    if (pros.length === 0) {
      pros.push({ priority: 0, title: 'Ayo He Still Here', detail: `You still in the game and that alone is gangsta. Heart of a lion, hands of a... we workin' on it.` });
    }
  }

  // =====================
  // CONS — KEEP IT A BUCK
  // =====================
  if (bidAcc < 0.3) {
    cons.push({ priority: 10, title: 'Throwin\' Bricks', detail: `${(bidAcc * 100).toFixed(0)}% accuracy. You shootin' like you got the wrong prescription on, fam. Air balls on air balls.` });
  } else if (bidAcc < 0.45) {
    cons.push({ priority: 7, title: 'Foggy Reads', detail: `${(bidAcc * 100).toFixed(0)}% accuracy. You readin' the table like a book with half the pages ripped out. Need better intel.` });
  }

  if (totalMisses > 0 && overPct >= 0.65) {
    cons.push({ priority: 8, title: 'All Cap', detail: `Overbiddin' ${(overPct * 100).toFixed(0)}% of misses. You talkin' like you got the whole deck but your hand tellin' a different story. Cap city.` });
  } else if (totalMisses > 0 && overPct <= 0.35) {
    cons.push({ priority: 8, title: 'Playin\' Scared', detail: `Underbiddin' ${((1 - overPct) * 100).toFixed(0)}% of misses. You movin' like you got a warrant — too cautious. Fortune favor the bold, beloved.` });
  }

  if (winRate <= 0.1 && stats.gamesPlayed >= 3) {
    cons.push({ priority: 9, title: 'Permanent Bench', detail: `${(winRate * 100).toFixed(0)}% wins across ${stats.gamesPlayed} games. You in the game but the game ain't in you right now. That's tough.` });
  } else if (winRate < 0.25 && stats.gamesPlayed >= 3) {
    cons.push({ priority: 6, title: 'Drought Season', detail: `${(winRate * 100).toFixed(0)}% win rate. The well dry, the cupboard bare. You gotta flip somethin' different.` });
  }

  if (avgPlacement >= 3.5 && stats.gamesPlayed >= 2) {
    cons.push({ priority: 8, title: 'Basement Dweller', detail: `Average placement ${avgPlacement.toFixed(1)}. You holdin' down the bottom like it's your job. Somebody gotta do it, but it ain't gotta be you.` });
  } else if (avgPlacement >= 2.5 && stats.gamesPlayed >= 3) {
    cons.push({ priority: 5, title: 'Below the Line', detail: `Average placement ${avgPlacement.toFixed(1)}. You livin' in the bottom half like it's rent free. Time to relocate.` });
  }

  if (avgBidRatio >= 0.5 && bidAcc < 0.45) {
    cons.push({ priority: 7, title: 'Mouth Write Checks', detail: `Biddin' ${(avgBidRatio * 100).toFixed(0)}% of tricks but the cards ain't cosignin'. All that talk and the hand ain't backin' it up.` });
  } else if (avgBidRatio <= 0.25 && bidAcc < 0.5) {
    cons.push({ priority: 6, title: 'Scared Money', detail: `Biddin' low at ${(avgBidRatio * 100).toFixed(0)}% and still missin'. You playin' not to lose and still losin'. That's a double L.` });
  }

  if (zeroBids >= 3 && zeroAcc <= 0.4) {
    cons.push({ priority: 6, title: 'Can\'t Duck Forever', detail: `Bid zero but caught tricks ${((1 - zeroAcc) * 100).toFixed(0)}% of the time. You tryna hide but the cards keep snitch- in' on you.` });
  }

  if (dealerRounds >= 3 && nonDealerRounds >= 3 && nonDealerAcc > dealerAcc + 0.15) {
    cons.push({ priority: 5, title: 'Dealer Blues', detail: `${(dealerAcc * 100).toFixed(0)}% as dealer vs ${(nonDealerAcc * 100).toFixed(0)}% otherwise. When you runnin' the table you runnin' it into the ground.` });
  }

  if (hasCardSplit && lowAcc > highAcc + 0.15) {
    cons.push({ priority: 4, title: 'Folds Under Pressure', detail: `Only ${(highAcc * 100).toFixed(0)}% on high cards. When the hand get heavy you start droppin' it. Gotta tighten that grip.` });
  } else if (hasCardSplit && highAcc > lowAcc + 0.15) {
    cons.push({ priority: 4, title: 'Sloppy on the Low End', detail: `Only ${(lowAcc * 100).toFixed(0)}% on low cards. You sleepwalkin' through the small rounds like they don't count. They count.` });
  }

  // Fallback cons
  if (cons.length === 0) {
    if (bidAcc < 0.7) {
      cons.push({ priority: 1, title: 'Still Got Ceiling', detail: `${(bidAcc * 100).toFixed(0)}% accuracy. Respectable but you ain't touched the ceiling yet. There's another level and you know it.` });
    }
    if (cons.length === 0) {
      cons.push({ priority: 0, title: 'Can\'t Even Hate', detail: `Hard to find a weakness on this one. The opps sick right now. DOOT DOOT DOOT DOOT.` });
    }
  }

  // =====================
  // ADVICE — GAME FROM THE OG
  // =====================
  if (totalMisses > 0 && overPct >= 0.65) {
    advice.push({ priority: 9, title: 'Humble the Bid', detail: `Drop it by one when you ain't sure. Ego don't score points, beloved. The smart money move quiet.` });
  } else if (totalMisses > 0 && overPct <= 0.35) {
    advice.push({ priority: 9, title: 'Speak Up', detail: `You takin' more tricks than you biddin' for. Stop sellin' yourself short — your hand got more juice than you think.` });
  }

  if (hasCardSplit && lowAcc > highAcc + 0.15) {
    advice.push({ priority: 7, title: 'Level Up the Arsenal', detail: `High card rounds where the real bag at. Study the table when the hand fat — that's where fortunes flip.` });
  } else if (hasCardSplit && highAcc > lowAcc + 0.15) {
    advice.push({ priority: 7, title: 'Don\'t Skip Leg Day', detail: `Low card rounds add up like pennies in a jar. Stop sleepin' on the 1s and 2s — they sneaky point traps.` });
  }

  if (bidAcc < 0.45) {
    advice.push({ priority: 8, title: 'Read the Room', detail: `Count your guaranteed tricks before you bid. Aces, high trump — that's your foundation. Build from there, don't guess from the sky.` });
  }

  if (zeroBids >= 3 && zeroAcc <= 0.5) {
    advice.push({ priority: 6, title: 'Duck and Weave', detail: `When you bid zero, dump your highest cards first. Let the other dogs fight for the bone — you tryna be invisible.` });
  }

  if (avgBidRatio >= 0.5 && bidAcc < 0.45) {
    advice.push({ priority: 7, title: 'Match the Energy', detail: `You biddin' champagne but playin' tap water. Either level the play up to the bid or bring the bid down to Earth.` });
  }

  if (dealerRounds >= 3 && nonDealerRounds >= 3 && nonDealerAcc > dealerAcc + 0.15) {
    advice.push({ priority: 5, title: 'Finesse the Restriction', detail: `The dealer restriction ain't a curse, it's a puzzle. Work around it — the constraint is where the creativity live.` });
  }

  if (winRate < 0.2 && stats.gamesPlayed >= 3) {
    advice.push({ priority: 6, title: 'Stack the Small Wins', detail: `Stop chasin' the big play and just hit your bids every round. Consistency the real cheat code out here.` });
  }

  if (avgPlacement >= 3 && stats.gamesPlayed >= 2) {
    advice.push({ priority: 5, title: 'Study the Tape', detail: `Watch what the top dogs bid in the same spots you fumble. Pattern recognition separate the plugs from the customers.` });
  }

  // Fallback advice
  if (advice.length === 0) {
    advice.push({ priority: 1, title: 'Stay Dangerous', detail: `You movin' right, just keep switchin' up the bids so they can't read you. Predictability get you cooked out here.` });
    advice.push({ priority: 0, title: 'Sharpen the Iron', detail: `You at a level where the best move is raisin' the competition around you. Iron sharpen iron, that's the code.` });
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
