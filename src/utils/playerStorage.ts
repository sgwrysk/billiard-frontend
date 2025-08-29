/**
 * Player storage utility functions with validation and error handling
 */

import { storage } from './storage';
import type { 
  Player, 
  PlayerCreateInput, 
  PlayerUpdateInput, 
  PlayerStorage, 
  DefaultPlayerSettings,
  PlayerValidationError
} from '../types/player';
import {
  PLAYER_NAME_MAX_LENGTH,
  STORAGE_KEY_PLAYERS 
} from '../types/player';

/**
 * Initialize default storage structure
 */
const getDefaultStorage = (): PlayerStorage => ({
  players: [],
  defaults: {
    player1DefaultId: null,
    player2DefaultId: null
  },
  nextId: 1
});

/**
 * Get all player storage data
 */
const getPlayerStorage = (): PlayerStorage => {
  const data = storage.get<PlayerStorage>(STORAGE_KEY_PLAYERS);
  return data || getDefaultStorage();
};

/**
 * Save player storage data
 */
const savePlayerStorage = (playerStorage: PlayerStorage): void => {
  storage.set(STORAGE_KEY_PLAYERS, playerStorage);
};

/**
 * Validate player name
 */
export const validatePlayerName = (name: string, excludeId?: number): PlayerValidationError[] => {
  const errors: PlayerValidationError[] = [];
  
  if (!name.trim()) {
    errors.push({ field: 'name', message: 'Player name is required' });
    return errors;
  }
  
  if (name.length > PLAYER_NAME_MAX_LENGTH) {
    errors.push({ field: 'name', message: `Player name must be ${PLAYER_NAME_MAX_LENGTH} characters or less` });
  }
  
  // Check for duplicate names
  const existingPlayers = getAllPlayers();
  const isDuplicate = existingPlayers.some(player => 
    player.name.trim().toLowerCase() === name.trim().toLowerCase() && 
    player.id !== excludeId
  );
  
  if (isDuplicate) {
    errors.push({ field: 'name', message: 'Player name already exists' });
  }
  
  return errors;
};

/**
 * Get all players
 */
export const getAllPlayers = (): Player[] => {
  const playerStorage = getPlayerStorage();
  return playerStorage.players;
};

/**
 * Get visible players only
 */
export const getVisiblePlayers = (): Player[] => {
  return getAllPlayers().filter(player => player.isVisible);
};

/**
 * Get player by ID
 */
export const getPlayerById = (id: number): Player | null => {
  const players = getAllPlayers();
  return players.find(player => player.id === id) || null;
};

/**
 * Create new player
 */
export const createPlayer = (input: PlayerCreateInput): Player => {
  const errors = validatePlayerName(input.name);
  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }
  
  const playerStorage = getPlayerStorage();
  const now = Date.now();
  
  const newPlayer: Player = {
    id: playerStorage.nextId,
    name: input.name.trim(),
    isVisible: true,
    createdAt: now,
    updatedAt: now
  };
  
  playerStorage.players.push(newPlayer);
  playerStorage.nextId++;
  
  savePlayerStorage(playerStorage);
  return newPlayer;
};

/**
 * Update existing player
 */
export const updatePlayer = (id: number, input: PlayerUpdateInput): Player => {
  const playerStorage = getPlayerStorage();
  const playerIndex = playerStorage.players.findIndex(player => player.id === id);
  
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }
  
  const existingPlayer = playerStorage.players[playerIndex];
  
  // Validate name if provided
  if (input.name !== undefined) {
    const errors = validatePlayerName(input.name, id);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }
  }
  
  const updatedPlayer: Player = {
    ...existingPlayer,
    ...(input.name !== undefined && { name: input.name.trim() }),
    ...(input.isVisible !== undefined && { isVisible: input.isVisible }),
    updatedAt: Date.now()
  };
  
  playerStorage.players[playerIndex] = updatedPlayer;
  savePlayerStorage(playerStorage);
  
  return updatedPlayer;
};

/**
 * Soft delete player (set as invisible)
 */
export const hidePlayer = (id: number): Player => {
  return updatePlayer(id, { isVisible: false });
};

/**
 * Show player (set as visible)
 */
export const showPlayer = (id: number): Player => {
  return updatePlayer(id, { isVisible: true });
};

/**
 * Get default player settings
 */
export const getDefaultPlayerSettings = (): DefaultPlayerSettings => {
  const playerStorage = getPlayerStorage();
  return playerStorage.defaults;
};

/**
 * Set default player for position (1 or 2)
 */
export const setDefaultPlayer = (position: 1 | 2, playerId: number | null): void => {
  const playerStorage = getPlayerStorage();
  
  if (playerId !== null) {
    const player = getPlayerById(playerId);
    if (!player) {
      throw new Error('Player not found');
    }
    if (!player.isVisible) {
      throw new Error('Cannot set hidden player as default');
    }
  }
  
  if (position === 1) {
    playerStorage.defaults.player1DefaultId = playerId;
  } else {
    playerStorage.defaults.player2DefaultId = playerId;
  }
  
  savePlayerStorage(playerStorage);
};

/**
 * Get default player for position (1 or 2)
 */
export const getDefaultPlayer = (position: 1 | 2): Player | null => {
  const defaults = getDefaultPlayerSettings();
  const playerId = position === 1 ? defaults.player1DefaultId : defaults.player2DefaultId;
  
  if (playerId === null) return null;
  
  const player = getPlayerById(playerId);
  // Return null if player is hidden or doesn't exist
  return player && player.isVisible ? player : null;
};

/**
 * Auto-save player name when starting game
 */
export const autoSavePlayer = (name: string): Player => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Player name cannot be empty');
  }
  
  // Check if player already exists
  const existingPlayers = getAllPlayers();
  const existingPlayer = existingPlayers.find(
    player => player.name.toLowerCase() === trimmedName.toLowerCase()
  );
  
  if (existingPlayer) {
    // If hidden, make it visible again
    if (!existingPlayer.isVisible) {
      return showPlayer(existingPlayer.id);
    }
    return existingPlayer;
  }
  
  // Create new player
  return createPlayer({ name: trimmedName });
};

/**
 * Get suggested players for autocomplete (visible players sorted by recent usage)
 */
export const getSuggestedPlayers = (): Player[] => {
  return getVisiblePlayers().sort((a, b) => b.updatedAt - a.updatedAt);
};