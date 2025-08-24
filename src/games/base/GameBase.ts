import type { Game, Player, Shot, GameType } from '../../types/index';

export interface IGameEngine {
  /** Game type */
  getGameType(): GameType;
  
  /** Initialize players */
  initializePlayers(playerSetups: {name: string, targetScore?: number, targetSets?: number}[]): Player[];
  
  /** Initialize game */
  initializeGame(playerSetups: {name: string, targetScore?: number, targetSets?: number}[]): Game;
  
  /** Handle ball pocket */
  handlePocketBall(game: Game, ballNumber: number): Game;
  
  /** Handle player switch */
  handleSwitchPlayer(game: Game): Game;
  
  /** Check victory condition */
  checkVictoryCondition(game: Game): { isGameOver: boolean; winnerId?: string };
  
  /** Check if game has custom logic */
  hasCustomLogic(): boolean;
  
  /** Handle custom game action */
  handleCustomAction?(game: Game, action: string, data?: any): Game;
  
  /** Get ball numbers used in the game */
  getBallNumbers(): number[];
  
  /** Handle action undo */
  handleUndo(game: Game): Game;
}

export abstract class GameBase implements IGameEngine {
  abstract getGameType(): GameType;
  abstract getBallNumbers(): number[];
  
  initializePlayers(playerSetups: {name: string, targetScore?: number, targetSets?: number}[]): Player[] {
    return playerSetups.map((setup, index) => ({
      id: `player-${index + 1}`,
      name: setup.name,
      score: 0,
      ballsPocketed: [],
      isActive: index === 0,
      targetScore: setup.targetScore,
      targetSets: setup.targetSets,
    }));
  }
  
  initializeGame(playerSetups: {name: string, targetScore?: number, targetSets?: number}[]): Game {
    const players = this.initializePlayers(playerSetups);
    
    return {
      id: `game-${Date.now()}`,
      type: this.getGameType(),
      status: 'IN_PROGRESS' as const,
      players,
      currentPlayerIndex: 0,
      startTime: new Date(),
      totalRacks: 1,
      currentRack: 1,
      rackInProgress: true,
      shotHistory: [],
      scoreHistory: players.map(player => ({
        playerId: player.id,
        score: 0,
        timestamp: new Date(),
      })),
    };
  }
  
  abstract handlePocketBall(game: Game, ballNumber: number): Game;
  abstract handleSwitchPlayer(game: Game): Game;
  abstract checkVictoryCondition(game: Game): { isGameOver: boolean; winnerId?: string };
  
  hasCustomLogic(): boolean {
    return false;
  }
  
  handleUndo(game: Game): Game {
    // Default undo processing (remove last shotHistory entry)
    if (game.shotHistory.length === 0) return game;
    
    const lastShot = game.shotHistory[game.shotHistory.length - 1];
    const updatedGame = { ...game };
    
    // Remove last entry from shotHistory
    updatedGame.shotHistory = updatedGame.shotHistory.slice(0, -1);
    
    // Also remove corresponding entry from scoreHistory (for ROTATION graph display)
    const scoreToRemove = this.getBallScore(lastShot.ballNumber);
    if (updatedGame.scoreHistory.length > 0) {
      // Check last score entry and remove if it matches
      const lastScoreIndex = updatedGame.scoreHistory.length - 1;
      const lastScoreEntry = updatedGame.scoreHistory[lastScoreIndex];
      if (lastScoreEntry.playerId === lastShot.playerId && lastScoreEntry.score === scoreToRemove) {
        updatedGame.scoreHistory = updatedGame.scoreHistory.slice(0, -1);
      }
    }
    
    // Remove last pocketed ball from player
    updatedGame.players = updatedGame.players.map(player => {
      if (player.id === lastShot.playerId && lastShot.isSunk) {
        return {
          ...player,
          ballsPocketed: player.ballsPocketed.filter(ball => ball !== lastShot.ballNumber),
          score: Math.max(0, player.score - this.getBallScore(lastShot.ballNumber)),
        };
      }
      return player;
    });
    
    return updatedGame;
  }
  
  protected getBallScore(_ballNumber: number): number {
    // Default is 1 point, override as needed
    return 1;
  }
  
  protected addShotToHistory(game: Game, playerId: string, ballNumber: number, isSunk: boolean): Game {
    const shot: Shot = {
      playerId,
      ballNumber,
      isSunk,
      isFoul: false,
      timestamp: new Date(),
    };
    
    return {
      ...game,
      shotHistory: [...game.shotHistory, shot],
    };
  }
}
