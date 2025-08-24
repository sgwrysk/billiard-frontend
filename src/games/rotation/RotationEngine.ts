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
        // Use default undo processing for ROTATION
        return this.handleUndo(game);
      default:
        return game;
    }
  }
  
  private handleResetRack(game: Game): Game {
    const updatedPlayers = game.players.map(player => ({
      ...player,
      ballsPocketed: [],
    }));
    
    return {
      ...game,
      players: updatedPlayers,
      shotHistory: [],
      currentRack: game.currentRack + 1,
      totalRacks: game.totalRacks + 1,
    };
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
  
  private isBallPocketed(game: Game, ballNumber: number): boolean {
    return game.players.some(player => 
      player.ballsPocketed.includes(ballNumber)
    );
  }
  
  protected getBallScore(ballNumber: number): number {
    return getBallScore(ballNumber, this.getGameType());
  }
}
