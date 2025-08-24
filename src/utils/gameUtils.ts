import type { Game } from '../types/index';
import { GameType } from '../types/index';

/**
 * Determines if a game is in progress
 * @param game Game object
 * @returns true if the game is in progress
 */
export const isGameInProgress = (game: Game): boolean => {
  if (!game) return false;

  switch (game.type) {
    case GameType.SET_MATCH:
      // Set Match: any player has won sets
      return game.players.some(player => (player.setsWon || 0) > 0);
      
    case GameType.ROTATION:
      // Rotation: any player has pocketed balls or has a score
      return game.players.some(player => 
        player.score > 0 || 
        (player.ballsPocketed && player.ballsPocketed.length > 0)
      );
      
    case GameType.BOWLARD: {
      // Bowlard: bowling frames exist and any frame has recorded rolls
      const player = game.players[0];
      if (!player.bowlingFrames || player.bowlingFrames.length === 0) {
        return false;
      }
      return player.bowlingFrames.some(frame => frame.rolls.length > 0);
    }
      
    default:
      return false;
  }
};
