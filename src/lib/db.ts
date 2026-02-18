import { supabase } from './supabase';
import type { Player, Game } from '../types';

// ---- Players ----

export async function fetchPlayers(): Promise<Player[]> {
  const { data, error } = await supabase.from('players').select('*');
  if (error) {
    console.error('fetchPlayers error:', error);
    throw new Error(`fetchPlayers: ${error.message}`);
  }
  return (data ?? []).map(rowToPlayer);
}

export async function upsertPlayer(player: Player): Promise<void> {
  const row = playerToRow(player);
  console.log('DB upsertPlayer:', row.id, row.name);
  const { error } = await supabase
    .from('players')
    .upsert(row, { onConflict: 'id' });
  if (error) {
    console.error('upsertPlayer error:', error, 'row:', row);
    throw new Error(`upsertPlayer: ${error.message}`);
  }
  console.log('DB upsertPlayer success:', row.id);
}

export async function deletePlayerDb(id: string): Promise<void> {
  const { error } = await supabase.from('players').delete().eq('id', id);
  if (error) {
    console.error('deletePlayer error:', error);
    throw new Error(`deletePlayer: ${error.message}`);
  }
}

// ---- Games ----

export async function fetchGames(): Promise<Game[]> {
  const { data, error } = await supabase.from('games').select('*');
  if (error) {
    console.error('fetchGames error:', error);
    throw new Error(`fetchGames: ${error.message}`);
  }
  return (data ?? []).map(rowToGame);
}

export async function upsertGame(game: Game): Promise<void> {
  const row = gameToRow(game);
  console.log('DB upsertGame:', row.id, row.status);
  const { error } = await supabase
    .from('games')
    .upsert(row, { onConflict: 'id' });
  if (error) {
    console.error('upsertGame error:', error, 'row:', row);
    throw new Error(`upsertGame: ${error.message}`);
  }
  console.log('DB upsertGame success:', row.id);
}

export async function deleteGameDb(id: string): Promise<void> {
  const { error } = await supabase.from('games').delete().eq('id', id);
  if (error) {
    console.error('deleteGame error:', error);
    throw new Error(`deleteGame: ${error.message}`);
  }
}

// ---- Row <-> Model mapping ----

function playerToRow(p: Player) {
  return {
    id: p.id,
    name: p.name,
    elo: p.elo,
    elo_history: p.eloHistory as unknown,
    stats: p.stats as unknown,
  };
}

function rowToPlayer(row: Record<string, unknown>): Player {
  return {
    id: row.id as string,
    name: row.name as string,
    elo: row.elo as number,
    eloHistory: (row.elo_history as Player['eloHistory']) ?? [],
    stats: (row.stats as Player['stats']) ?? {
      gamesPlayed: 0,
      gamesWon: 0,
      totalRoundsPlayed: 0,
      totalBidsCorrect: 0,
      totalBidsSum: 0,
      totalPlacement: 0,
    },
  };
}

function gameToRow(g: Game) {
  return {
    id: g.id,
    status: g.status,
    date: g.date,
    player_ids: g.playerIds as unknown,
    max_cards: g.maxCards,
    round_sequence: g.roundSequence as unknown,
    current_round_index: g.currentRoundIndex,
    initial_dealer_index: g.initialDealerIndex,
    rounds: g.rounds as unknown,
    final_scores: g.finalScores as unknown,
    elo_changes: g.eloChanges as unknown,
  };
}

function rowToGame(row: Record<string, unknown>): Game {
  return {
    id: row.id as string,
    status: row.status as Game['status'],
    date: row.date as string,
    playerIds: (row.player_ids as string[]) ?? [],
    maxCards: row.max_cards as number,
    roundSequence: (row.round_sequence as number[]) ?? [],
    currentRoundIndex: row.current_round_index as number,
    initialDealerIndex: row.initial_dealer_index as number,
    rounds: (row.rounds as Game['rounds']) ?? [],
    finalScores: (row.final_scores as Record<string, number>) ?? null,
    eloChanges: (row.elo_changes as Record<string, number>) ?? null,
  };
}
