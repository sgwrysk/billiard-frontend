import { GameBase } from '../base/GameBase';
import type { Game, Player } from '../../types/index';
import { GameType } from '../../types/index';
import { getBallScore } from '../../utils/ballUtils';

export class RotationEngine extends GameBase {
  getGameType(): GameType {
    return GameType.ROTATION;
  }
  
  getBallNumbers(): number[] {
    return Array.from({ length: 15 }, (_, i) => i + 1);
  }
  
  handlePocketBall(game: Game, ballNumber: number): Game {
    const activePlayer = game.players[game.currentPlayerIndex];
    
    // Check if ball is already pocketed
    if (this.isBallPocketed(game, ballNumber)) {
      return game;
    }
    
    const score = getBallScore(ballNumber, this.getGameType());
    
    // Update player state
    const updatedPlayers = game.players.map(player => {
      if (player.id === activePlayer.id) {
        return {
          ...player,
          ballsPocketed: [...player.ballsPocketed, ballNumber],
          score: player.score + score,
        };
      }
      return player;
    });
    
    // Add shot history
    const gameWithShotHistory = this.addShotToHistory(
      { ...game, players: updatedPlayers },
      activePlayer.id,
      ballNumber,
      true
    );
    
    // Also add score history (for graph display)
    const scoreEntry = {
      playerId: activePlayer.id,
      score: score, // Score gained from this ball
      timestamp: new Date(),
    };
    
    const updatedGame = {
      ...gameWithShotHistory,
      scoreHistory: [...gameWithShotHistory.scoreHistory, scoreEntry],
    };
    
    return updatedGame;
  }
  
  handleSwitchPlayer(game: Game): Game {
    const updatedPlayers = game.players.map(player => ({
      ...player,
      isActive: false,
    }));
    
    const nextPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    updatedPlayers[nextPlayerIndex].isActive = true;
    
    return {
      ...game,
      players: updatedPlayers,
      currentPlayerIndex: nextPlayerIndex,
    };
  }
  
  checkVictoryCondition(game: Game): { isGameOver: boolean; winnerId?: string } {
    for (const player of game.players) {
      if (player.targetScore && player.score >= player.targetScore) {
        return { isGameOver: true, winnerId: player.id };
      }
    }
    return { isGameOver: false };
  }
  
  hasCustomLogic(): boolean {
    return true;
  }
  
  handleCustomAction(game: Game, action: string, _data?: unknown): Game {
    switch (action) {
      case 'RESET_RACK':
        return this.handleResetRack(game);
      case 'CHECK_ALL_BALLS_POCKETED':
        // Don't change game state as this returns boolean
        return game;
      case 'UNDO_LAST_SHOT':
        return this.handleRotationUndo(game);
      default:
        return game;
    }
  }
  
  private handleResetRack(game: Game): Game {
    
    // Clear ballsPocketed for new rack (so all balls appear available)
    // But keep the undo capability through scoreHistory
    const updatedPlayers = game.players.map(player => ({
      ...player,
      ballsPocketed: [], // Clear for new rack display
    }));
    
    const updatedGame = {
      ...game,
      players: updatedPlayers,
      shotHistory: [], // Clear shot history for new rack
      currentRack: game.currentRack + 1,
      totalRacks: game.totalRacks + 1,
    };
    
    return updatedGame;
  }
  
  checkAllBallsPocketed(game: Game): boolean {
    const totalBalls = this.getBallNumbers();
    const pocketedBalls = game.players.reduce((acc, player) => {
      return acc.concat(player.ballsPocketed);
    }, [] as number[]);
    
    return totalBalls.every(ball => pocketedBalls.includes(ball));
  }
  
  getRemainingScore(player: Player): number {
    if (!player.targetScore) return 0;
    return Math.max(0, player.targetScore - player.score);
  }
  
  private handleRotationUndo(game: Game): Game {

    // If we have shot history in current rack, use default undo
    if (game.shotHistory && game.shotHistory.length > 0) {
      return this.handleUndo(game);
    }

    // For advanced racks (rack 2+) with no shot history, undo from score history
    if (game.currentRack > 1 && game.scoreHistory && game.scoreHistory.length > game.players.length) {
      return this.handleAdvancedRackUndo(game);
    }

    return game;
  }

  private handleAdvancedRackUndo(game: Game): Game {
    // Find the last score entry (most recent action)
    if (!game.scoreHistory || game.scoreHistory.length <= game.players.length) {
      return game;
    }

    const lastScoreEntry = game.scoreHistory[game.scoreHistory.length - 1];

    // Remove the last score entry
    const updatedScoreHistory = game.scoreHistory.slice(0, -1);

    // Determine which ball to remove based on the score
    const ballToRemove = this.findBallNumberForScore(lastScoreEntry.score);

    // Update the player's score and remove the ball
    const updatedPlayers = game.players.map(player => {
      if (player.id === lastScoreEntry.playerId) {
        const newScore = Math.max(0, player.score - lastScoreEntry.score);
        const newBallsPocketed = ballToRemove > 0 
          ? player.ballsPocketed.filter(ball => ball !== ballToRemove)
          : player.ballsPocketed;
        
        
        return {
          ...player,
          score: newScore,
          ballsPocketed: newBallsPocketed,
        };
      }
      return player;
    });

    // If this undo brings us back to previous rack state, we need to restore rack
    const shouldRestorePreviousRack = this.shouldRestorePreviousRack(updatedScoreHistory, game.players.length);
    
    if (shouldRestorePreviousRack && game.currentRack > 1) {
      
      // Reconstruct the exact state from score history
      const playersWithCorrectBalls = this.reconstructPlayersFromScoreHistory(updatedScoreHistory, game.players);

      return {
        ...game,
        players: playersWithCorrectBalls,
        scoreHistory: updatedScoreHistory,
        currentRack: game.currentRack - 1,
        totalRacks: Math.max(1, game.totalRacks - 1),
        // Reconstruct shot history from the previous rack
        shotHistory: this.reconstructShotHistory(updatedScoreHistory, game.players.length),
      };
    } else {
      return {
        ...game,
        players: updatedPlayers,
        scoreHistory: updatedScoreHistory,
      };
    }
  }

  private shouldRestorePreviousRack(scoreHistory: {playerId: string; score: number; timestamp: Date}[], initialPlayerEntries: number): boolean {
    // Check if we should restore to previous rack:
    // - If we just undid the last ball (15) that completed a rack
    // - The condition is: we have exactly 14 action entries (balls 1-14) remaining
    const actionEntries = scoreHistory.length - initialPlayerEntries;
    const shouldRestore = actionEntries === 14; // We have balls 1-14, but not 15
    
    
    return shouldRestore;
  }

  private reconstructShotHistory(scoreHistory: {playerId: string; score: number; timestamp: Date}[], playerCount: number): {playerId: string; ballNumber: number; isSunk: boolean; isFoul: boolean; timestamp: Date}[] {
    // Skip initial player entries and reconstruct shot history
    const actionEntries = scoreHistory.slice(playerCount);
    const shotHistory = [];

    for (let i = 0; i < actionEntries.length; i++) {
      const entry = actionEntries[i];
      // Try to find which ball corresponds to this score
      const ballNumber = this.findBallNumberForScore(entry.score);
      
      if (ballNumber > 0) {
        shotHistory.push({
          playerId: entry.playerId,
          ballNumber: ballNumber,
          isSunk: true,
          isFoul: false,
          timestamp: entry.timestamp,
        });
      }
    }

    return shotHistory;
  }

  private findBallNumberForScore(score: number): number {
    // In rotation, ball number equals score for balls 1-15
    if (score >= 1 && score <= 15) {
      return score;
    }
    return 0; // Unknown ball
  }

  private reconstructPlayersFromScoreHistory(scoreHistory: {playerId: string; score: number; timestamp: Date}[], originalPlayers: Player[]): Player[] {
    
    // Get all action entries (skip initial player entries with score 0)
    const initialPlayerEntries = originalPlayers.length;
    const actionEntries = scoreHistory.slice(initialPlayerEntries);
    
    
    // Start with empty ballsPocketed for all players
    const playersWithBalls = originalPlayers.map(player => {
      // Calculate final score from score history
      const playerScoreEntries = scoreHistory.filter(entry => entry.playerId === player.id && entry.score > 0);
      const finalScore = playerScoreEntries.reduce((sum, entry) => sum + entry.score, 0);
      
      // Collect all balls this player has pocketed from action entries only
      const ballsPocketed = actionEntries
        .filter(entry => entry.playerId === player.id)
        .map(entry => this.findBallNumberForScore(entry.score))
        .filter(ball => ball > 0);
      
      
      return {
        ...player,
        score: finalScore,
        ballsPocketed: ballsPocketed,
      };
    });

    

    return playersWithBalls;
  }

  private isBallPocketed(game: Game, ballNumber: number): boolean {
    return game.players.some(player => 
      player.ballsPocketed.includes(ballNumber)
    );
  }
  
  protected getBallScore(ballNumber: number): number {
    return getBallScore(ballNumber, this.getGameType());
  }
}
