import type { Game, Shot } from '../../types/index';

// Types for Japan undo operations
interface RackCompleteActionData {
  type: 'rack_complete';
  previousRack: number;
  previousMultiplier: number;
  previousPlayerStates: Array<{
    id: string;
    ballsPocketed: number[];
    score: number;
  }>;
}

interface BallClickActionData {
  type: 'ball_click';
  points: number;
}

type JapanActionData = RackCompleteActionData | BallClickActionData | Record<string, unknown>;

/**
 * Utility class for handling undo operations in Japan billiard games
 */
export class JapanUndoHandler {
  /**
   * Handle undo operation for Japan game
   * @param game Current game state
   * @returns Updated game state after undo operation
   */
  static handleUndo(game: Game): Game {
    if (game.shotHistory.length === 0) {
      return game;
    }
    
    const lastShot = game.shotHistory[game.shotHistory.length - 1];
    const lastAction = lastShot.customData as JapanActionData;
    
    const updatedGame = { ...game };
    
    // Undo based on the last action type
    if (lastAction?.type === 'rack_complete') {
      // Undo rack completion - revert to previous rack state
      return JapanUndoHandler.handleRackCompleteUndo(updatedGame, lastAction as RackCompleteActionData);
    } else if (lastAction?.type === 'ball_click') {
      // Undo ball click - subtract the points earned
      return JapanUndoHandler.handleBallClickUndo(updatedGame, lastShot);
    }
    
    // Remove the last shot from history for any action type
    updatedGame.shotHistory = updatedGame.shotHistory.slice(0, -1);
    
    return updatedGame;
  }

  /**
   * Handle undo for rack completion
   * @param game Current game state
   * @param lastAction Last action custom data
   * @returns Updated game state after undoing rack completion
   */
  private static handleRackCompleteUndo(game: Game, lastAction: RackCompleteActionData): Game {
    const previousRack = lastAction.previousRack;
    const previousPlayerStates = lastAction.previousPlayerStates;
    
    // Restore rack number
    game.currentRack = previousRack;
    
    // Remove the last rack from history
    if (game.japanRackHistory && game.japanRackHistory.length > 0) {
      game.japanRackHistory = game.japanRackHistory.slice(0, -1);
    }
    
    // Restore multiplier
    const previousMultiplier = lastAction.previousMultiplier;
    game.japanCurrentMultiplier = previousMultiplier;
    
    // Restore player states (ballsPocketed arrays and scores)
    game.players = game.players.map(player => {
      const previousState = previousPlayerStates?.find(ps => ps.id === player.id);
      return {
        ...player,
        ballsPocketed: previousState ? [...previousState.ballsPocketed] : [],
        score: previousState?.score ?? player.score, // Restore previous rack score
      };
    });
    
    // Remove the last shot from history
    game.shotHistory = game.shotHistory.slice(0, -1);
    
    return game;
  }

  /**
   * Handle undo for ball click
   * @param game Current game state
   * @param lastShot Last shot that was taken
   * @returns Updated game state after undoing ball click
   */
  private static handleBallClickUndo(game: Game, lastShot: Shot): Game {
    const customData = lastShot.customData as unknown as BallClickActionData;
    const points = customData.points;
    
    game.players = game.players.map(player => {
      if (player.id === lastShot.playerId) {
        return { 
          ...player, 
          score: Math.max(0, player.score - points),
          ballsPocketed: JapanUndoHandler.removeBallFromPocketed(
            player.ballsPocketed || [],
            lastShot.ballNumber
          )
        };
      }
      return player;
    });
    
    // Remove the last shot from history
    game.shotHistory = game.shotHistory.slice(0, -1);
    
    return game;
  }

  /**
   * Remove the most recently pocketed ball from the pocketed balls array
   * This removes the last item in the array (most recent pocket)
   * @param ballsPocketed Array of pocketed ball numbers in pocket order
   * @param ballNumber Ball number that was just undone (for verification)
   * @returns Updated array with the most recent ball removed
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static removeBallFromPocketed(ballsPocketed: number[], _ballNumber: number): number[] {
    const balls = [...ballsPocketed];
    // Remove the last ball from the array (most recent pocket), regardless of ball number
    // This matches the shot order - last shot should remove last ball pocketed
    if (balls.length > 0) {
      balls.pop();
    }
    return balls;
  }
}