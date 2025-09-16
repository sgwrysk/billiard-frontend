import type { Game } from '../../../types/index';

// Base props interface for all victory screen components
export interface BaseVictoryScreenProps {
  game: Game;
  onRematch: () => void;
  onBackToMenu: () => void;
  onReturnToGame: () => void;
}

// Game-specific victory content props interface
export interface GameVictoryContentProps {
  game: Game;
}