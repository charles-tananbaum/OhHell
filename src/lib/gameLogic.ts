export function generateRoundSequence(maxCards: number): number[] {
  const ascending = Array.from({ length: maxCards }, (_, i) => i + 1);
  const descending = Array.from({ length: maxCards - 1 }, (_, i) => maxCards - 1 - i);
  return [...ascending, ...descending];
}

export function getDealerIndex(
  roundIndex: number,
  initialDealerIndex: number,
  playerCount: number,
): number {
  return (initialDealerIndex + roundIndex) % playerCount;
}

export function getBidOrder(
  playerIds: string[],
  dealerIndex: number,
): string[] {
  const n = playerIds.length;
  const order: string[] = [];
  for (let i = 1; i <= n; i++) {
    order.push(playerIds[(dealerIndex + i) % n]);
  }
  return order;
}

export function getRestrictedBid(
  cardsDealt: number,
  bids: Record<string, number>,
  bidOrder: string[],
): number | null {
  // Only the last bidder (dealer) has a restriction
  const submittedBids = bidOrder.slice(0, -1);
  const allSubmitted = submittedBids.every((id) => id in bids);
  if (!allSubmitted) return null;

  const sumOfOtherBids = submittedBids.reduce(
    (sum, id) => sum + (bids[id] || 0),
    0,
  );
  const restricted = cardsDealt - sumOfOtherBids;
  return restricted >= 0 ? restricted : null;
}
