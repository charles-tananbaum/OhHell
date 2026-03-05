import type { Player, Game, Round, PlayerAnalysis, PlayerAnalysisItem } from '../types';

interface Candidate {
  title: string;
  detail: string;
  priority: number;
}

type Voice = 'normal' | 'ebonics' | 'genz';

function getVoice(name: string): Voice {
  const n = name.toLowerCase().trim();
  if (n === 'darkus') return 'ebonics';
  if (n === 'chris') return 'genz';
  return 'normal';
}

// ============================================================
// Voice-specific string builders
// ============================================================

function bidAccPro(voice: Voice, pct: string, tier: 'high' | 'mid'): Candidate {
  if (tier === 'high') {
    const m: Record<Voice, [string, string]> = {
      normal: ["Psychic Bidder", `Nails ${pct}% of bids. Either you can count cards or you sold your soul — either way, it's working.`],
      ebonics: ["Third Eye Open", `${pct}% accuracy. You seein' the cards before they even get dealt. That's that vision, nah mean? BOOM BOOM BOOM.`],
      genz: ["Literally Clairvoyant", `${pct}% bid accuracy no cap. You're giving psychic oracle energy rn. The cards are literally shaking.`],
    };
    return { priority: 10, title: m[voice][0], detail: m[voice][1] };
  }
  const m: Record<Voice, [string, string]> = {
    normal: ["Steady Hand", `Hits ${pct}% of bids — solid and reliable. Not flashy, but your opponents should be nervous.`],
    ebonics: ["Steady Cookin'", `${pct}% accuracy — you ain't the flashiest in the kitchen but the work speak for itself. Consistent like a brick on the scale.`],
    genz: ["Lowkey Consistent", `${pct}% accuracy and it's giving reliable king energy. Not the main character yet but definitely a strong supporting role.`],
  };
  return { priority: 8, title: m[voice][0], detail: m[voice][1] };
}

function winRatePro(voice: Voice, pct: string, tier: 'high' | 'mid'): Candidate {
  if (tier === 'high') {
    const m: Record<Voice, [string, string]> = {
      normal: ["Closer", `Wins ${pct}% of games. When it matters, you deliver. Other players should consider therapy.`],
      ebonics: ["Top of the Food Chain", `${pct}% win rate. You eatin' everybody plate. The table is yours, they just sittin' at it.`],
      genz: ["Main Character Fr", `${pct}% win rate. You're literally the protagonist and everyone else is an NPC. Unironically goated.`],
    };
    return { priority: 9, title: m[voice][0], detail: m[voice][1] };
  }
  const m: Record<Voice, [string, string]> = {
    normal: ["Contender", `${pct}% win rate — you're always in the mix. Not quite the final boss, but definitely a mini-boss.`],
    ebonics: ["In the Cut", `${pct}% win rate — you always lurkin', always dangerous. Not the kingpin yet but you definitely a lieutenant.`],
    genz: ["Side Quest King", `${pct}% win rate — you're not the final boss but you're def a mid-boss that makes people sweat. Slay adjacent.`],
  };
  return { priority: 5, title: m[voice][0], detail: m[voice][1] };
}

function placementPro(voice: Voice, avg: string, tier: 'high' | 'mid'): Candidate {
  if (tier === 'high') {
    const m: Record<Voice, [string, string]> = {
      normal: ["Podium Regular", `Average placement of ${avg} — basically allergic to losing. Must be nice.`],
      ebonics: ["Penthouse Floor", `Average placement ${avg}. You don't even know what the bottom look like. Luxury livin'.`],
      genz: ["Perma-Podium", `${avg} avg placement. You're literally gatekeeping first place. The podium is your emotional support structure.`],
    };
    return { priority: 9, title: m[voice][0], detail: m[voice][1] };
  }
  const m: Record<Voice, [string, string]> = {
    normal: ["Top Half Dweller", `Average placement of ${avg}. Consistently above the fold — respectable.`],
    ebonics: ["Upper Echelon", `Average placement ${avg}. You stay in the top half like it's rent controlled. Solid real estate.`],
    genz: ["Above Average Andy", `${avg} avg placement. Solidly in the top half which is honestly a vibe. Not cringe at all.`],
  };
  return { priority: 5, title: m[voice][0], detail: m[voice][1] };
}

function balancedMissPro(voice: Voice): Candidate {
  const m: Record<Voice, [string, string]> = {
    normal: ["Balanced Misser", `When you miss, it goes both ways equally. At least your errors are fair and balanced.`],
    ebonics: ["Even Keel", `When you miss you miss both ways equal. At least the L's balanced like a good portfolio, nah mean.`],
    genz: ["Symmetrical L's", `When you miss it's equal both ways which is lowkey iconic. Your failures are balanced, as all things should be.`],
  };
  return { priority: 4, title: m[voice][0], detail: m[voice][1] };
}

function cardSplitPro(voice: Voice, lowPct: string, highPct: string, tier: 'low' | 'high'): Candidate {
  if (tier === 'low') {
    const m: Record<Voice, [string, string]> = {
      normal: ["Small Ball Specialist", `${lowPct}% accurate on low-card rounds vs ${highPct}% on high-card. You thrive when the stakes are small.`],
      ebonics: ["Small Plates, Big Chef", `${lowPct}% on low cards vs ${highPct}% on high. You move surgical when the hand small. Scalpel work.`],
      genz: ["Smol Round Enjoyer", `${lowPct}% on low cards vs ${highPct}% on high. You're literally built different when stakes are mini. Niche flex but valid.`],
    };
    return { priority: 6, title: m[voice][0], detail: m[voice][1] };
  }
  const m: Record<Voice, [string, string]> = {
    normal: ["Big Game Hunter", `${highPct}% accurate on high-card rounds vs ${lowPct}% on low-card. You feast when there's more on the line.`],
    ebonics: ["Big Dog Energy", `${highPct}% on high cards vs ${lowPct}% on low. When the pot heavy you come alive. That's that big game hunger.`],
    genz: ["High Card Chad", `${highPct}% on big rounds vs ${lowPct}% on small. You literally only activate in boss fights. Gigachad energy.`],
  };
  return { priority: 6, title: m[voice][0], detail: m[voice][1] };
}

function ambitionPro(voice: Voice, ratio: string, tier: 'bold' | 'sniper'): Candidate {
  if (tier === 'bold') {
    const m: Record<Voice, [string, string]> = {
      normal: ["High Roller", `Bids an average of ${ratio}% of available tricks — and backs it up. Fearless.`],
      ebonics: ["Bet the House", `Biddin' ${ratio}% of the tricks and cashin' every check. You talk big and walk bigger.`],
      genz: ["Sigma Bidder", `Bidding ${ratio}% of tricks and actually hitting? That's not confidence that's delusion that worked. Respect.`],
    };
    return { priority: 7, title: m[voice][0], detail: m[voice][1] };
  }
  const m: Record<Voice, [string, string]> = {
    normal: ["The Sniper", `Conservative bids at ${ratio}% ratio, but rarely misses. Efficient. Ruthless. Boring, but effective.`],
    ebonics: ["Silent Assassin", `Low bids at ${ratio}% ratio but you barely miss. Quiet money the loudest.`],
    genz: ["Stealth Mode", `${ratio}% bid ratio and barely misses. You're giving minimalist king. Less is more and you chose violence (quietly).`],
  };
  return { priority: 7, title: m[voice][0], detail: m[voice][1] };
}

function zeroBidPro(voice: Voice, count: number, pct: string): Candidate {
  const m: Record<Voice, [string, string]> = {
    normal: ["Nil Assassin", `Bids zero ${count} times, nails it ${pct}% of the time. The art of doing nothing, perfected.`],
    ebonics: ["Ghost Protocol", `Bid zero ${count} times, disappeared ${pct}% of the time. You a phantom out here. Can't take what you can't see.`],
    genz: ["AFK Diff", `Bid zero ${count} times, ${pct}% success rate. You're literally winning by doing nothing. Touch grass? Nah, touch zero.`],
  };
  return { priority: 6, title: m[voice][0], detail: m[voice][1] };
}

function dealerPro(voice: Voice, dPct: string, ndPct: string): Candidate {
  const m: Record<Voice, [string, string]> = {
    normal: ["House Advantage", `${dPct}% accuracy as dealer vs ${ndPct}% otherwise. Dealing the cards? More like dealing justice.`],
    ebonics: ["Plug Walk", `${dPct}% as dealer vs ${ndPct}% otherwise. When you movin' the product you don't miss. The plug is the plug.`],
    genz: ["Dealer Diffing", `${dPct}% as dealer vs ${ndPct}% otherwise. You literally get a buff when you deal. That's a passive ability.`],
  };
  return { priority: 5, title: m[voice][0], detail: m[voice][1] };
}

// --- Fallback pros ---
function fallbackPro(voice: Voice, tier: 'games' | 'acc' | 'last', gp?: number, acc?: string): Candidate {
  if (tier === 'games') {
    const m: Record<Voice, [string, string]> = {
      normal: ["Shows Up", `${gp} games played. Consistency is its own kind of talent — keep stacking those reps.`],
      ebonics: ["Showin' Up", `${gp} games deep. You puttin' in the hours on the block. The work gon' pay off eventually, keep grindin'.`],
      genz: ["Attendance Award", `${gp} games played. Showing up is literally half the battle and you cleared that checkpoint.`],
    };
    return { priority: 1, title: m[voice][0], detail: m[voice][1] };
  }
  if (tier === 'acc') {
    const m: Record<Voice, [string, string]> = {
      normal: ["Not Hopeless", `${acc}% bid accuracy — there's a foundation here. Diamonds are just coal under pressure.`],
      ebonics: ["Got a Lil Somethin'", `${acc}% accuracy — the foundation there. Every empire started with one brick, you feel me.`],
      genz: ["Has Potential", `${acc}% accuracy — the origin story is mid but every glow-up starts somewhere bestie.`],
    };
    return { priority: 2, title: m[voice][0], detail: m[voice][1] };
  }
  const m: Record<Voice, [string, string]> = {
    normal: ["Brave Soul", `Still in the game. That takes guts, if not skill. Respect.`],
    ebonics: ["Ayo He Still Here", `You still in the game and that alone is gangsta. Heart of a lion, hands of a... we workin' on it.`],
    genz: ["Unironically Brave", `Still queueing up. That's not delusion that's commitment. We stan the grind even if the results are... pending.`],
  };
  return { priority: 0, title: m[voice][0], detail: m[voice][1] };
}

// ============================================================
// CONS voice builders
// ============================================================

function bidAccCon(voice: Voice, pct: string, tier: 'low' | 'mid'): Candidate {
  if (tier === 'low') {
    const m: Record<Voice, [string, string]> = {
      normal: ["Wild Guesser", `Only hitting ${pct}% of bids. A coin flip would be more accurate — maybe try one?`],
      ebonics: ["Throwin' Bricks", `${pct}% accuracy. You shootin' like you got the wrong prescription on, fam. Air balls on air balls.`],
      genz: ["Literally Guessing", `${pct}% accuracy. Bestie you're not bidding you're manifesting and it's not working. This is giving RNG.`],
    };
    return { priority: 10, title: m[voice][0], detail: m[voice][1] };
  }
  const m: Record<Voice, [string, string]> = {
    normal: ["Shaky Reads", `${pct}% bid accuracy. Your crystal ball might need a firmware update.`],
    ebonics: ["Foggy Reads", `${pct}% accuracy. You readin' the table like a book with half the pages ripped out. Need better intel.`],
    genz: ["Mid Reads", `${pct}% accuracy. Your reads are giving "didn't study for the exam" energy. Kinda sus.`],
  };
  return { priority: 7, title: m[voice][0], detail: m[voice][1] };
}

function overBidCon(voice: Voice, pct: string): Candidate {
  const m: Record<Voice, [string, string]> = {
    normal: ["The Optimist", `Overbids ${pct}% of the time when wrong. You believe in yourself more than your cards do.`],
    ebonics: ["All Cap", `Overbiddin' ${pct}% of misses. You talkin' like you got the whole deck but your hand tellin' a different story. Cap city.`],
    genz: ["Delusional Bidder", `Overbids ${pct}% of misses. The confidence is giving delulu but not in a cute way. Your cards are NOT that girl.`],
  };
  return { priority: 8, title: m[voice][0], detail: m[voice][1] };
}

function underBidCon(voice: Voice, pct: string): Candidate {
  const m: Record<Voice, [string, string]> = {
    normal: ["The Sandbagger", `Underbids ${pct}% of the time when wrong. Playing it safe? More like leaving points on the table.`],
    ebonics: ["Playin' Scared", `Underbiddin' ${pct}% of misses. You movin' like you got a warrant — too cautious. Fortune favor the bold, beloved.`],
    genz: ["Cooked by Caution", `Underbids ${pct}% of misses. You're literally self-nerfing. This is giving anxiety not strategy.`],
  };
  return { priority: 8, title: m[voice][0], detail: m[voice][1] };
}

function winRateCon(voice: Voice, pct: string, gp: number, tier: 'low' | 'mid'): Candidate {
  if (tier === 'low') {
    const m: Record<Voice, [string, string]> = {
      normal: ["Participation Trophy", `${pct}% win rate across ${gp} games. You show up, and honestly? That's what counts. (It isn't.)`],
      ebonics: ["Permanent Bench", `${pct}% wins across ${gp} games. You in the game but the game ain't in you right now. That's tough.`],
      genz: ["NPC Arc", `${pct}% win rate in ${gp} games. You're giving background character. The plot hasn't found you yet bestie.`],
    };
    return { priority: 9, title: m[voice][0], detail: m[voice][1] };
  }
  const m: Record<Voice, [string, string]> = {
    normal: ["Win Drought", `${pct}% win rate. The top spot isn't exactly calling your name.`],
    ebonics: ["Drought Season", `${pct}% win rate. The well dry, the cupboard bare. You gotta flip somethin' different.`],
    genz: ["Losing Arc", `${pct}% win rate. This is giving villain origin story except you're not even the villain, just a henchman.`],
  };
  return { priority: 6, title: m[voice][0], detail: m[voice][1] };
}

function placementCon(voice: Voice, avg: string, tier: 'low' | 'mid'): Candidate {
  if (tier === 'low') {
    const m: Record<Voice, [string, string]> = {
      normal: ["Bottom Feeder", `Average placement of ${avg}. You're single-handedly keeping the bottom of the leaderboard warm.`],
      ebonics: ["Basement Dweller", `Average placement ${avg}. You holdin' down the bottom like it's your job. Somebody gotta do it, but it ain't gotta be you.`],
      genz: ["Down Bad", `${avg} avg placement. You're literally speedrunning last place. This is not the flex you think it is.`],
    };
    return { priority: 8, title: m[voice][0], detail: m[voice][1] };
  }
  const m: Record<Voice, [string, string]> = {
    normal: ["Below the Fold", `Average placement of ${avg}. Consistently in the bottom half — at least you're consistent.`],
    ebonics: ["Below the Line", `Average placement ${avg}. You livin' in the bottom half like it's rent free. Time to relocate.`],
    genz: ["Chronically Below Mid", `${avg} avg placement. Consistently below the fold. At least you're consistent at being mid.`],
  };
  return { priority: 5, title: m[voice][0], detail: m[voice][1] };
}

function ambitionCon(voice: Voice, ratio: string, tier: 'over' | 'under'): Candidate {
  if (tier === 'over') {
    const m: Record<Voice, [string, string]> = {
      normal: ["Eyes Bigger Than Cards", `Bids ${ratio}% of available tricks but can't quite cash those checks. Bold strategy, Cotton.`],
      ebonics: ["Mouth Write Checks", `Biddin' ${ratio}% of tricks but the cards ain't cosignin'. All that talk and the hand ain't backin' it up.`],
      genz: ["Bidmaxxxing (Failed)", `Bidding ${ratio}% of tricks and not delivering? That's giving overconfident Tinder bio. The audacity without the receipts.`],
    };
    return { priority: 7, title: m[voice][0], detail: m[voice][1] };
  }
  const m: Record<Voice, [string, string]> = {
    normal: ["Playing Not to Lose", `Bids low at ${ratio}% ratio and still misses. The living embodiment of "no risk, still no reward."`],
    ebonics: ["Scared Money", `Biddin' low at ${ratio}% and still missin'. You playin' not to lose and still losin'. That's a double L.`],
    genz: ["Scared Money Era", `${ratio}% bid ratio and still missing? You're literally playing on easy mode and still dying. Uninstall.`],
  };
  return { priority: 6, title: m[voice][0], detail: m[voice][1] };
}

function zeroBidCon(voice: Voice, pct: string): Candidate {
  const m: Record<Voice, [string, string]> = {
    normal: ["Accidental Winner", `Bids zero but somehow takes tricks ${pct}% of the time. Your cards didn't get the memo.`],
    ebonics: ["Can't Duck Forever", `Bid zero but caught tricks ${pct}% of the time. You tryna hide but the cards keep snitchin' on you.`],
    genz: ["Failed AFK", `Bids zero but takes tricks ${pct}% of the time. You tried to go invisible and the game said "nah fam, you're IN this."`],
  };
  return { priority: 6, title: m[voice][0], detail: m[voice][1] };
}

function dealerCon(voice: Voice, dPct: string, ndPct: string): Candidate {
  const m: Record<Voice, [string, string]> = {
    normal: ["Dealer Curse", `${dPct}% accuracy as dealer vs ${ndPct}% otherwise. The restricted bid haunts your dreams.`],
    ebonics: ["Dealer Blues", `${dPct}% as dealer vs ${ndPct}% otherwise. When you runnin' the table you runnin' it into the ground.`],
    genz: ["Dealer Debuff", `${dPct}% as dealer vs ${ndPct}% otherwise. You literally get a nerf when you deal. Patch notes hit you hard.`],
  };
  return { priority: 5, title: m[voice][0], detail: m[voice][1] };
}

function cardSplitCon(voice: Voice, pct: string, tier: 'high' | 'low'): Candidate {
  if (tier === 'high') {
    const m: Record<Voice, [string, string]> = {
      normal: ["Wilts Under Pressure", `Only ${pct}% accurate on high-card rounds. The big moments aren't your thing — yet.`],
      ebonics: ["Folds Under Pressure", `Only ${pct}% on high cards. When the hand get heavy you start droppin' it. Gotta tighten that grip.`],
      genz: ["Chokes in Boss Fights", `Only ${pct}% on high card rounds. You literally fold when the stakes go up. Skill issue tbh.`],
    };
    return { priority: 4, title: m[voice][0], detail: m[voice][1] };
  }
  const m: Record<Voice, [string, string]> = {
    normal: ["Sloppy on the Small Stuff", `Only ${pct}% accurate on low-card rounds. You sleepwalk through the easy ones.`],
    ebonics: ["Sloppy on the Low End", `Only ${pct}% on low cards. You sleepwalkin' through the small rounds like they don't count. They count.`],
    genz: ["Tutorial Diff", `Only ${pct}% on low cards. You're failing the tutorial levels. That's actually impressive in a bad way.`],
  };
  return { priority: 4, title: m[voice][0], detail: m[voice][1] };
}

function fallbackCon(voice: Voice, acc?: string): Candidate {
  if (acc) {
    const m: Record<Voice, [string, string]> = {
      normal: ["Room at the Top", `${acc}% bid accuracy. Good, not great — there's always another level.`],
      ebonics: ["Still Got Ceiling", `${acc}% accuracy. Respectable but you ain't touched the ceiling yet. There's another level and you know it.`],
      genz: ["Has Ceiling", `${acc}% accuracy. Solid but you haven't unlocked your final form yet. The glow-up is pending.`],
    };
    return { priority: 1, title: m[voice][0], detail: m[voice][1] };
  }
  const m: Record<Voice, [string, string]> = {
    normal: ["Annoyingly Good", `Hard to find a weakness. Your opponents hate this about you.`],
    ebonics: ["Can't Even Hate", `Hard to find a weakness on this one. The opps sick right now.`],
    genz: ["No Weaknesses Found", `Literally can't find a flaw. You're giving Mary Sue and the other players are SEETHING.`],
  };
  return { priority: 0, title: m[voice][0], detail: m[voice][1] };
}

// ============================================================
// ADVICE voice builders
// ============================================================

function overBidAdvice(voice: Voice): Candidate {
  const m: Record<Voice, [string, string]> = {
    normal: ["Dial It Back", `Try bidding 1 less when you're unsure. Your ego will recover, and your score won't.`],
    ebonics: ["Humble the Bid", `Drop it by one when you ain't sure. Ego don't score points, beloved. The smart money move quiet.`],
    genz: ["Nerf the Ego", `Try bidding one less when unsure. Your ego is not the vibe rn. Touch grass, touch lower bids.`],
  };
  return { priority: 9, title: m[voice][0], detail: m[voice][1] };
}

function underBidAdvice(voice: Voice): Candidate {
  const m: Record<Voice, [string, string]> = {
    normal: ["Bet on Yourself", `You're taking more tricks than you think. Trust your cards — they trust you.`],
    ebonics: ["Speak Up", `You takin' more tricks than you biddin' for. Stop sellin' yourself short — your hand got more juice than you think.`],
    genz: ["Stop Self-Nerfing", `You're literally taking more tricks than you bid for. Your cards believe in you more than you do. Gaslight yourself into confidence.`],
  };
  return { priority: 9, title: m[voice][0], detail: m[voice][1] };
}

function cardSplitAdvice(voice: Voice, tier: 'high' | 'low'): Candidate {
  if (tier === 'high') {
    const m: Record<Voice, [string, string]> = {
      normal: ["Think Bigger", `High-card rounds are where the big points hide. Focus on reading the table when there are more cards in play.`],
      ebonics: ["Level Up the Arsenal", `High card rounds where the real bag at. Study the table when the hand fat — that's where fortunes flip.`],
      genz: ["Unlock Hard Mode", `High card rounds are where the XP is. You need to level up your big-hand reads. Boss fight training arc needed.`],
    };
    return { priority: 7, title: m[voice][0], detail: m[voice][1] };
  }
  const m: Record<Voice, [string, string]> = {
    normal: ["Sweat the Small Stuff", `Low-card rounds add up. Don't sleepwalk through the 1s and 2s — they're sneaky point factories.`],
    ebonics: ["Don't Skip Leg Day", `Low card rounds add up like pennies in a jar. Stop sleepin' on the 1s and 2s — they sneaky point traps.`],
    genz: ["Don't Skip the Tutorials", `Low card rounds are free XP and you're leaving it on the table. Grind the small rounds bestie.`],
  };
  return { priority: 7, title: m[voice][0], detail: m[voice][1] };
}

function readAdvice(voice: Voice): Candidate {
  const m: Record<Voice, [string, string]> = {
    normal: ["Count Your Outs", `Before bidding, count your sure tricks (aces, high trumps) and add 1 for maybes. Sounds basic — because it works.`],
    ebonics: ["Read the Room", `Count your guaranteed tricks before you bid. Aces, high trump — that's your foundation. Build from there, don't guess from the sky.`],
    genz: ["Do the Math Bestie", `Count your guaranteed tricks before bidding. Aces, high cards = safe. Then add one for vibes. It's literally not that deep.`],
  };
  return { priority: 8, title: m[voice][0], detail: m[voice][1] };
}

function zeroBidAdvice(voice: Voice): Candidate {
  const m: Record<Voice, [string, string]> = {
    normal: ["Dodge the Lead", `When you bid zero, play your highest cards early to avoid winning tricks late. Let others fight for the lead.`],
    ebonics: ["Duck and Weave", `When you bid zero, dump your highest cards first. Let the other dogs fight for the bone — you tryna be invisible.`],
    genz: ["Go Ghost Mode", `Bid zero? Throw your high cards early so you don't accidentally win. You're going AFK on purpose — commit to it.`],
  };
  return { priority: 6, title: m[voice][0], detail: m[voice][1] };
}

function ambitionAdvice(voice: Voice): Candidate {
  const m: Record<Voice, [string, string]> = {
    normal: ["Ego Check", `You're bidding aggressively but not converting. Try matching your ambition to your hand, not your pride.`],
    ebonics: ["Match the Energy", `You biddin' champagne but playin' tap water. Either level the play up to the bid or bring the bid down to Earth.`],
    genz: ["Reality Check Arc", `You're bidding like a sigma but playing like a beta. Match your energy to your actual hand. Looksmaxxing won't save bad cards.`],
  };
  return { priority: 7, title: m[voice][0], detail: m[voice][1] };
}

function dealerAdvice(voice: Voice): Candidate {
  const m: Record<Voice, [string, string]> = {
    normal: ["Own the Restriction", `As dealer, the restricted bid forces creativity. Use it — bid around the restriction instead of fighting it.`],
    ebonics: ["Finesse the Restriction", `The dealer restriction ain't a curse, it's a puzzle. Work around it — the constraint is where the creativity live.`],
    genz: ["Restriction is Lore", `The dealer restriction isn't a nerf, it's a side quest. Work around it — constraints are where the creative builds live.`],
  };
  return { priority: 5, title: m[voice][0], detail: m[voice][1] };
}

function longGameAdvice(voice: Voice): Candidate {
  const m: Record<Voice, [string, string]> = {
    normal: ["Play the Long Game", `Focus on hitting bids every round instead of chasing big scores. Consistency beats heroics in Oh Hell.`],
    ebonics: ["Stack the Small Wins", `Stop chasin' the big play and just hit your bids every round. Consistency the real cheat code out here.`],
    genz: ["Grindset Over Highlight Reel", `Stop trying to go viral and just hit your bids. Consistency is the real meta. No cap.`],
  };
  return { priority: 6, title: m[voice][0], detail: m[voice][1] };
}

function watchLeadersAdvice(voice: Voice): Candidate {
  const m: Record<Voice, [string, string]> = {
    normal: ["Watch the Leaders", `Pay attention to what top players bid in similar spots. Pattern recognition is half the battle.`],
    ebonics: ["Study the Tape", `Watch what the top dogs bid in the same spots you fumble. Pattern recognition separate the plugs from the customers.`],
    genz: ["Study the Meta", `Watch what the top players bid in the same spots. That's literally free coaching content. Learn the meta, climb the ranks.`],
  };
  return { priority: 5, title: m[voice][0], detail: m[voice][1] };
}

function fallbackAdvice(voice: Voice, tier: 'stay' | 'sharpen'): Candidate {
  if (tier === 'stay') {
    const m: Record<Voice, [string, string]> = {
      normal: ["Stay Dangerous", `You're doing well — keep mixing up your bids to stay unpredictable. Predictability is a weakness.`],
      ebonics: ["Stay Dangerous", `You movin' right, just keep switchin' up the bids so they can't read you. Predictability get you cooked out here.`],
      genz: ["Keep Them Guessing", `You're doing well but switch up the bids so nobody can read you. Predictability is the ultimate ick.`],
    };
    return { priority: 1, title: m[voice][0], detail: m[voice][1] };
  }
  const m: Record<Voice, [string, string]> = {
    normal: ["Teach the Table", `At your level, the best way to improve is to help others get better. Stronger opponents sharpen your game.`],
    ebonics: ["Sharpen the Iron", `You at a level where the best move is raisin' the competition around you. Iron sharpen iron, that's the code.`],
    genz: ["Carry the Lobby", `You're at the point where you need better opponents to level up. Smurf less, scrim more.`],
  };
  return { priority: 0, title: m[voice][0], detail: m[voice][1] };
}

// ============================================================
// Main analysis function
// ============================================================

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

  const voice = getVoice(player.name);
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

  let totalBidRatio = 0;
  for (const round of allRounds) {
    totalBidRatio += round.bids[player.id] / round.cardsDealt;
  }
  const avgBidRatio = totalBidRatio / allRounds.length;

  let zeroBidsCount = 0, zeroHits = 0;
  for (const round of allRounds) {
    if (round.bids[player.id] === 0) {
      zeroBidsCount++;
      if (round.tricksTaken[player.id] === 0) zeroHits++;
    }
  }
  const zeroAcc = zeroBidsCount > 0 ? zeroHits / zeroBidsCount : 0;

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

  const pct = (n: number) => (n * 100).toFixed(0);

  // === PROS ===
  if (bidAcc >= 0.6) pros.push(bidAccPro(voice, pct(bidAcc), 'high'));
  else if (bidAcc >= 0.45) pros.push(bidAccPro(voice, pct(bidAcc), 'mid'));

  if (winRate >= 0.4 && stats.gamesPlayed >= 2) pros.push(winRatePro(voice, pct(winRate), 'high'));
  else if (winRate >= 0.25 && stats.gamesPlayed >= 2) pros.push(winRatePro(voice, pct(winRate), 'mid'));

  if (avgPlacement <= 1.5 && stats.gamesPlayed >= 2) pros.push(placementPro(voice, avgPlacement.toFixed(1), 'high'));
  else if (avgPlacement <= 2.5 && stats.gamesPlayed >= 2) pros.push(placementPro(voice, avgPlacement.toFixed(1), 'mid'));

  if (totalMisses > 0 && overPct > 0.35 && overPct < 0.65) pros.push(balancedMissPro(voice));

  if (hasCardSplit && lowAcc > highAcc + 0.15) pros.push(cardSplitPro(voice, pct(lowAcc), pct(highAcc), 'low'));
  else if (hasCardSplit && highAcc > lowAcc + 0.15) pros.push(cardSplitPro(voice, pct(lowAcc), pct(highAcc), 'high'));

  if (avgBidRatio >= 0.5 && bidAcc >= 0.45) pros.push(ambitionPro(voice, pct(avgBidRatio), 'bold'));
  else if (avgBidRatio <= 0.25 && bidAcc >= 0.5) pros.push(ambitionPro(voice, pct(avgBidRatio), 'sniper'));

  if (zeroBidsCount >= 3 && zeroAcc >= 0.8) pros.push(zeroBidPro(voice, zeroBidsCount, pct(zeroAcc)));

  if (dealerRounds >= 3 && nonDealerRounds >= 3 && dealerAcc > nonDealerAcc + 0.15)
    pros.push(dealerPro(voice, pct(dealerAcc), pct(nonDealerAcc)));

  if (pros.length === 0) {
    if (stats.gamesPlayed >= 1) pros.push(fallbackPro(voice, 'games', stats.gamesPlayed));
    if (bidAcc >= 0.3) pros.push(fallbackPro(voice, 'acc', undefined, pct(bidAcc)));
    if (pros.length === 0) pros.push(fallbackPro(voice, 'last'));
  }

  // === CONS ===
  if (bidAcc < 0.3) cons.push(bidAccCon(voice, pct(bidAcc), 'low'));
  else if (bidAcc < 0.45) cons.push(bidAccCon(voice, pct(bidAcc), 'mid'));

  if (totalMisses > 0 && overPct >= 0.65) cons.push(overBidCon(voice, pct(overPct)));
  else if (totalMisses > 0 && overPct <= 0.35) cons.push(underBidCon(voice, pct(1 - overPct)));

  if (winRate <= 0.1 && stats.gamesPlayed >= 3) cons.push(winRateCon(voice, pct(winRate), stats.gamesPlayed, 'low'));
  else if (winRate < 0.25 && stats.gamesPlayed >= 3) cons.push(winRateCon(voice, pct(winRate), stats.gamesPlayed, 'mid'));

  if (avgPlacement >= 3.5 && stats.gamesPlayed >= 2) cons.push(placementCon(voice, avgPlacement.toFixed(1), 'low'));
  else if (avgPlacement >= 2.5 && stats.gamesPlayed >= 3) cons.push(placementCon(voice, avgPlacement.toFixed(1), 'mid'));

  if (avgBidRatio >= 0.5 && bidAcc < 0.45) cons.push(ambitionCon(voice, pct(avgBidRatio), 'over'));
  else if (avgBidRatio <= 0.25 && bidAcc < 0.5) cons.push(ambitionCon(voice, pct(avgBidRatio), 'under'));

  if (zeroBidsCount >= 3 && zeroAcc <= 0.4) cons.push(zeroBidCon(voice, pct(1 - zeroAcc)));

  if (dealerRounds >= 3 && nonDealerRounds >= 3 && nonDealerAcc > dealerAcc + 0.15)
    cons.push(dealerCon(voice, pct(dealerAcc), pct(nonDealerAcc)));

  if (hasCardSplit && lowAcc > highAcc + 0.15) cons.push(cardSplitCon(voice, pct(highAcc), 'high'));
  else if (hasCardSplit && highAcc > lowAcc + 0.15) cons.push(cardSplitCon(voice, pct(lowAcc), 'low'));

  if (cons.length === 0) {
    if (bidAcc < 0.7) cons.push(fallbackCon(voice, pct(bidAcc)));
    if (cons.length === 0) cons.push(fallbackCon(voice));
  }

  // === ADVICE ===
  if (totalMisses > 0 && overPct >= 0.65) advice.push(overBidAdvice(voice));
  else if (totalMisses > 0 && overPct <= 0.35) advice.push(underBidAdvice(voice));

  if (hasCardSplit && lowAcc > highAcc + 0.15) advice.push(cardSplitAdvice(voice, 'high'));
  else if (hasCardSplit && highAcc > lowAcc + 0.15) advice.push(cardSplitAdvice(voice, 'low'));

  if (bidAcc < 0.45) advice.push(readAdvice(voice));

  if (zeroBidsCount >= 3 && zeroAcc <= 0.5) advice.push(zeroBidAdvice(voice));

  if (avgBidRatio >= 0.5 && bidAcc < 0.45) advice.push(ambitionAdvice(voice));

  if (dealerRounds >= 3 && nonDealerRounds >= 3 && nonDealerAcc > dealerAcc + 0.15)
    advice.push(dealerAdvice(voice));

  if (winRate < 0.2 && stats.gamesPlayed >= 3) advice.push(longGameAdvice(voice));

  if (avgPlacement >= 3 && stats.gamesPlayed >= 2) advice.push(watchLeadersAdvice(voice));

  if (advice.length === 0) {
    advice.push(fallbackAdvice(voice, 'stay'));
    advice.push(fallbackAdvice(voice, 'sharpen'));
  }

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
