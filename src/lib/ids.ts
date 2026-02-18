export function generateId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

export function generatePlayerId(): string {
  return generateId('p');
}

export function generateGameId(): string {
  return generateId('g');
}
