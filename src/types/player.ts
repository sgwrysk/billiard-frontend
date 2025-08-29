/**
 * Player management type definitions
 */

export interface Player {
  id: number;
  name: string;
  isVisible: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PlayerCreateInput {
  name: string;
}

export interface PlayerUpdateInput {
  name?: string;
  isVisible?: boolean;
}

export interface DefaultPlayerSettings {
  player1DefaultId: number | null;
  player2DefaultId: number | null;
}

export interface PlayerStorage {
  players: Player[];
  defaults: DefaultPlayerSettings;
  nextId: number;
}

export interface PlayerValidationError {
  field: string;
  message: string;
}

// Constants
export const PLAYER_NAME_MAX_LENGTH = 20;
export const STORAGE_KEY_PLAYERS = 'billiard-players';