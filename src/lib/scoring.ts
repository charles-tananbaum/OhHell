export function calculateScore(bid: number, tricks: number): number {
  return bid === tricks ? 10 + tricks : tricks;
}

export function calculateCumulativeScores(
  rounds: { scores: Record<string, number>; status: string }[],
  playerIds: string[],
): Record<string, number> {
  const totals: Record<string, number> = {};
  playerIds.forEach((id) => {
    totals[id] = 0;
  });

  for (const round of rounds) {
    if (round.status !== 'complete') break;
    for (const id of playerIds) {
      totals[id] += round.scores[id] || 0;
    }
  }

  return totals;
}
