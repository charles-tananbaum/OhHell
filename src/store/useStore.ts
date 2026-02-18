import { create } from 'zustand';
import type { Player, Game, Round } from '../types';
import { DEFAULT_ELO, ADMIN_PASSWORD, LIMITED_PASSWORD, STORE_NAME } from '../constants';
import { generatePlayerId, generateGameId } from '../lib/ids';
import {
  generateRoundSequence,
  getDealerIndex,
  getBidOrder,
} from '../lib/gameLogic';
import { calculateScore, calculateCumulativeScores } from '../lib/scoring';
import { calculateEloChanges } from '../lib/elo';
import {
  updatePlayerStatsAfterGame,
  getPlacementsFromScores,
} from '../lib/stats';
import {
  fetchPlayers,
  fetchGames,
  upsertPlayer,
  upsertGame,
  deletePlayerDb,
  deleteGameDb,
} from '../lib/db';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export type UserRole = 'admin' | 'limited' | false;

interface StoreState {
  players: Player[];
  games: Game[];
  userRole: UserRole;
  toasts: Toast[];
  dbReady: boolean;

  // Auth
  login: (password: string) => boolean;
  logout: () => void;

  // DB sync
  loadFromDb: () => Promise<void>;

  // Toasts
  addToast: (message: string, type?: 'success' | 'error') => void;
  removeToast: (id: string) => void;

  // Players
  addPlayer: (name: string) => void;
  updatePlayer: (id: string, name: string) => void;
  deletePlayer: (id: string) => void;
  getPlayer: (id: string) => Player | undefined;

  // Games
  createGame: (
    playerIds: string[],
    maxCards: number,
    initialDealerIndex: number,
  ) => string;
  getGame: (id: string) => Game | undefined;
  deleteGame: (id: string) => void;
  submitBid: (gameId: string, playerId: string, bid: number) => void;
  reviseBid: (gameId: string, playerId: string) => void;
  submitTricks: (
    gameId: string,
    tricks: Record<string, number>,
  ) => void;
  advanceRound: (gameId: string) => void;
  completeGame: (gameId: string) => void;

  // Export/Import
  exportData: () => string;
  importData: (json: string) => boolean;
}

// --- localStorage helpers (simple cache, NOT Zustand persist) ---
function saveToLocal(players: Player[], games: Game[]) {
  try {
    localStorage.setItem(
      STORE_NAME,
      JSON.stringify({ players, games }),
    );
  } catch {
    // storage full or unavailable
  }
}

function loadFromLocal(): { players: Player[]; games: Game[] } {
  try {
    const raw = localStorage.getItem(STORE_NAME);
    if (!raw) return { players: [], games: [] };
    const data = JSON.parse(raw);
    return {
      players: data.players ?? [],
      games: data.games ?? [],
    };
  } catch {
    return { players: [], games: [] };
  }
}

// --- Supabase sync helpers (awaited, with toast on failure) ---
async function syncGame(game: Game, toast?: (msg: string, type: 'success' | 'error') => void) {
  try {
    await upsertGame(game);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('sync game error', msg);
    toast?.(`DB error: ${msg}`, 'error');
  }
}

async function syncPlayer(player: Player, toast?: (msg: string, type: 'success' | 'error') => void) {
  try {
    await upsertPlayer(player);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('sync player error', msg);
    toast?.(`DB error: ${msg}`, 'error');
  }
}

export const useStore = create<StoreState>()((set, get) => ({
  players: [],
  games: [],
  userRole: false,
  toasts: [],
  dbReady: false,

  // Auth — admin gets full access, limited can add but not delete
  login: (password: string) => {
    if (password === ADMIN_PASSWORD) {
      set({ userRole: 'admin' });
      return true;
    }
    if (password === LIMITED_PASSWORD) {
      set({ userRole: 'limited' });
      return true;
    }
    return false;
  },

  logout: () => set({ userRole: false }),

  // DB sync — Supabase is source of truth, localStorage is fallback
  loadFromDb: async () => {
    try {
      const [dbPlayers, dbGames] = await Promise.all([
        fetchPlayers(),
        fetchGames(),
      ]);
      // Always use Supabase data as the source of truth
      set({ players: dbPlayers, games: dbGames, dbReady: true });
      // Cache to localStorage for offline fallback
      saveToLocal(dbPlayers, dbGames);
    } catch (e) {
      console.error('loadFromDb error:', e);
      // Supabase failed — fall back to localStorage
      const local = loadFromLocal();
      set({ players: local.players, games: local.games, dbReady: true });
    }
  },

  // Toasts
  addToast: (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => get().removeToast(id), 3000);
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  // Players
  addPlayer: (name: string) => {
    const player: Player = {
      id: generatePlayerId(),
      name: name.trim(),
      elo: DEFAULT_ELO,
      eloHistory: [],
      stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        totalRoundsPlayed: 0,
        totalBidsCorrect: 0,
        totalBidsSum: 0,
        totalPlacement: 0,
      },
    };
    set((state) => {
      const players = [...state.players, player];
      saveToLocal(players, state.games);
      return { players };
    });
    syncPlayer(player, get().addToast);
  },

  updatePlayer: (id: string, name: string) => {
    set((state) => {
      const players = state.players.map((p) =>
        p.id === id ? { ...p, name: name.trim() } : p,
      );
      saveToLocal(players, state.games);
      return { players };
    });
    const updated = get().players.find((p) => p.id === id);
    if (updated) syncPlayer(updated, get().addToast);
  },

  deletePlayer: (id: string) => {
    set((state) => {
      const players = state.players.filter((p) => p.id !== id);
      saveToLocal(players, state.games);
      return { players };
    });
    deletePlayerDb(id);
  },

  getPlayer: (id: string) => {
    return get().players.find((p) => p.id === id);
  },

  // Games
  createGame: (
    playerIds: string[],
    maxCards: number,
    initialDealerIndex: number,
  ) => {
    const id = generateGameId();
    const roundSequence = generateRoundSequence(maxCards);
    const dealerIdx = getDealerIndex(0, initialDealerIndex, playerIds.length);
    const bidOrder = getBidOrder(playerIds, dealerIdx);

    const firstRound: Round = {
      roundNumber: 1,
      cardsDealt: roundSequence[0],
      dealerPlayerId: playerIds[dealerIdx],
      firstBidderId: bidOrder[0],
      bidOrder,
      bids: {},
      tricksTaken: {},
      scores: {},
      status: 'bidding',
    };

    const game: Game = {
      id,
      status: 'active',
      date: new Date().toISOString(),
      playerIds,
      maxCards,
      roundSequence,
      currentRoundIndex: 0,
      initialDealerIndex,
      rounds: [firstRound],
      finalScores: null,
      eloChanges: null,
    };

    set((state) => {
      const games = [...state.games, game];
      saveToLocal(state.players, games);
      return { games };
    });
    syncGame(game, get().addToast);
    return id;
  },

  getGame: (id: string) => {
    return get().games.find((g) => g.id === id);
  },

  deleteGame: (id: string) => {
    set((state) => {
      const games = state.games.filter((g) => g.id !== id);
      saveToLocal(state.players, games);
      return { games };
    });
    deleteGameDb(id);
  },

  submitBid: (gameId: string, playerId: string, bid: number) => {
    set((state) => {
      const games = state.games.map((game) => {
        if (game.id !== gameId) return game;
        const rounds = [...game.rounds];
        const current = { ...rounds[game.currentRoundIndex] };
        current.bids = { ...current.bids, [playerId]: bid };

        if (Object.keys(current.bids).length === game.playerIds.length) {
          current.status = 'playing';
        }

        rounds[game.currentRoundIndex] = current;
        return { ...game, rounds };
      });
      saveToLocal(state.players, games);
      return { games };
    });
    const game = get().games.find((g) => g.id === gameId);
    if (game) syncGame(game, get().addToast);
  },

  reviseBid: (gameId: string, playerId: string) => {
    set((state) => {
      const games = state.games.map((game) => {
        if (game.id !== gameId) return game;
        const rounds = [...game.rounds];
        const current = { ...rounds[game.currentRoundIndex] };

        const playerIdx = current.bidOrder.indexOf(playerId);
        if (playerIdx < 0) return game;

        const newBids: Record<string, number> = {};
        for (let i = 0; i < playerIdx; i++) {
          const id = current.bidOrder[i];
          if (id in current.bids) newBids[id] = current.bids[id];
        }
        current.bids = newBids;

        if (current.status === 'playing') {
          current.status = 'bidding';
        }

        rounds[game.currentRoundIndex] = current;
        return { ...game, rounds };
      });
      saveToLocal(state.players, games);
      return { games };
    });
    const game = get().games.find((g) => g.id === gameId);
    if (game) syncGame(game, get().addToast);
  },

  submitTricks: (gameId: string, tricks: Record<string, number>) => {
    set((state) => {
      const games = state.games.map((game) => {
        if (game.id !== gameId) return game;
        const rounds = [...game.rounds];
        const current = { ...rounds[game.currentRoundIndex] };
        current.tricksTaken = tricks;

        const scores: Record<string, number> = {};
        for (const id of game.playerIds) {
          scores[id] = calculateScore(current.bids[id], tricks[id]);
        }
        current.scores = scores;
        current.status = 'complete';

        rounds[game.currentRoundIndex] = current;
        return { ...game, rounds };
      });
      saveToLocal(state.players, games);
      return { games };
    });
    const game = get().games.find((g) => g.id === gameId);
    if (game) syncGame(game, get().addToast);
  },

  advanceRound: (gameId: string) => {
    set((state) => {
      const games = state.games.map((game) => {
        if (game.id !== gameId) return game;
        const nextIndex = game.currentRoundIndex + 1;

        if (nextIndex >= game.roundSequence.length) {
          return game;
        }

        const dealerIdx = getDealerIndex(
          nextIndex,
          game.initialDealerIndex,
          game.playerIds.length,
        );
        const bidOrder = getBidOrder(game.playerIds, dealerIdx);

        const nextRound: Round = {
          roundNumber: nextIndex + 1,
          cardsDealt: game.roundSequence[nextIndex],
          dealerPlayerId: game.playerIds[dealerIdx],
          firstBidderId: bidOrder[0],
          bidOrder,
          bids: {},
          tricksTaken: {},
          scores: {},
          status: 'bidding',
        };

        return {
          ...game,
          currentRoundIndex: nextIndex,
          rounds: [...game.rounds, nextRound],
        };
      });
      saveToLocal(state.players, games);
      return { games };
    });
    const game = get().games.find((g) => g.id === gameId);
    if (game) syncGame(game, get().addToast);
  },

  completeGame: (gameId: string) => {
    const state = get();
    const game = state.games.find((g) => g.id === gameId);
    if (!game) return;

    const finalScores = calculateCumulativeScores(
      game.rounds,
      game.playerIds,
    );
    const placements = getPlacementsFromScores(finalScores);
    const minPlacement = Math.min(...Object.values(placements));

    const eloPlayers = game.playerIds.map((id) => {
      const p = state.players.find((pl) => pl.id === id)!;
      return { id: p.id, elo: p.elo };
    });
    const eloChanges = calculateEloChanges(eloPlayers, finalScores);

    const updatedPlayers = state.players.map((player) => {
      if (!game.playerIds.includes(player.id)) return player;

      const placement = placements[player.id];
      const isWinner = placement === minPlacement;
      const updated = updatePlayerStatsAfterGame(
        player,
        game,
        placement,
        isWinner,
      );

      const eloBefore = player.elo;
      const eloAfter = player.elo + (eloChanges[player.id] || 0);

      return {
        ...updated,
        elo: eloAfter,
        eloHistory: [
          ...player.eloHistory,
          {
            gameId: game.id,
            date: new Date().toISOString(),
            eloBefore,
            eloAfter,
          },
        ],
      };
    });

    const updatedGames = state.games.map((g) =>
      g.id === gameId
        ? { ...g, status: 'completed' as const, finalScores, eloChanges }
        : g,
    );

    set({ players: updatedPlayers, games: updatedGames });
    saveToLocal(updatedPlayers, updatedGames);

    // Sync all affected data to Supabase
    const toast = get().addToast;
    const completedGame = updatedGames.find((g) => g.id === gameId);
    if (completedGame) syncGame(completedGame, toast);
    for (const p of updatedPlayers) {
      if (game.playerIds.includes(p.id)) syncPlayer(p, toast);
    }
  },

  // Export/Import
  exportData: () => {
    const { players, games } = get();
    return JSON.stringify(
      { players, games, exportDate: new Date().toISOString() },
      null,
      2,
    );
  },

  importData: (json: string) => {
    try {
      const data = JSON.parse(json);
      if (!data.players || !data.games) return false;
      set({ players: data.players, games: data.games });
      saveToLocal(data.players, data.games);
      const toast = get().addToast;
      for (const p of data.players) syncPlayer(p, toast);
      for (const g of data.games) syncGame(g, toast);
      return true;
    } catch {
      return false;
    }
  },
}));
