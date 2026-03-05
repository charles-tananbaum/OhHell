export interface PlayerAnalysisItem {
  title: string;
  detail: string;
}

export interface PlayerAnalysis {
  pros: PlayerAnalysisItem[];
  cons: PlayerAnalysisItem[];
  advice: PlayerAnalysisItem[];
}

export interface Player {
  id: string;
  name: string;
  elo: number;
  eloHistory: EloHistoryEntry[];
  stats: PlayerStats;
  analysis: PlayerAnalysis | null;
}

export interface EloHistoryEntry {
  gameId: string;
  date: string;
  eloBefore: number;
  eloAfter: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  totalRoundsPlayed: number;
  totalBidsCorrect: number;
  totalBidsSum: number;
  totalPlacement: number;
}

export interface Game {
  id: string;
  status: 'active' | 'completed';
  date: string;
  playerIds: string[];
  maxCards: number;
  roundSequence: number[];
  currentRoundIndex: number;
  initialDealerIndex: number;
  rounds: Round[];
  finalScores: Record<string, number> | null;
  eloChanges: Record<string, number> | null;
}

export interface Round {
  roundNumber: number;
  cardsDealt: number;
  dealerPlayerId: string;
  firstBidderId: string;
  bidOrder: string[];
  bids: Record<string, number>;
  tricksTaken: Record<string, number>;
  scores: Record<string, number>;
  status: 'bidding' | 'playing' | 'complete';
}

export interface AppState {
  players: Player[];
  games: Game[];
  userRole: 'admin' | 'limited' | false;
}
