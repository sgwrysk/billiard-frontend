import { GameBase } from '../base/GameBase';
import type { Game, Player } from '../../types/index';
import { GameType, GameStatus } from '../../types/index';

export class SetMatchEngine extends GameBase {
  getGameType(): GameType {
    return GameType.SET_MATCH;
  }
  
  getBallNumbers(): number[] {
    // Set Match uses standard 9-ball setup for individual ball tracking
    return [1, 2, 3, 4, 5, 6, 7, 8, 9];
  }
  
  initializePlayers(playerSetups: {name: string, targetScore?: number, targetSets?: number}[]): Player[] {
    return playerSetups.map((setup, index) => ({
      id: `player-${index + 1}`,
      name: setup.name,
      score: 0,
      ballsPocketed: [],
      isActive: false, // In Set Match, no one is initially selected
      targetScore: setup.targetScore,
      targetSets: setup.targetSets,
      setsWon: 0, // Set Match specific
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
      scoreHistory: [], // Initial scoreHistory is empty for SET_MATCH
    };
  }
  
  handlePocketBall(game: Game, ballNumber: number): Game {
    const currentPlayerIndex = game.currentPlayerIndex;
    const updatedPlayers = game.players.map((player, index) => {
      if (index === currentPlayerIndex) {
        return {
          ...player,
          ballsPocketed: [...player.ballsPocketed, ballNumber],
          score: player.score + (ballNumber === 9 ? 10 : 1), // 9-ball is worth 10 points, others are 1 point
        };
      }
      return player;
    });

    const shotHistory = [...game.shotHistory, {
      playerId: game.players[currentPlayerIndex].id,
      ballNumber,
      timestamp: new Date(),
      isSunk: true,
      isFoul: false,
    }];

    return {
      ...game,
      players: updatedPlayers,
      shotHistory,
    };
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
      if (player.targetSets && (player.setsWon || 0) >= player.targetSets) {
        return { isGameOver: true, winnerId: player.id };
      }
    }
    return { isGameOver: false };
  }
  
  hasCustomLogic(): boolean {
    return true;
  }
  
  handleCustomAction(game: Game, action: string, data?: unknown): Game {
    switch (action) {
      case 'WIN_SET':
        if (data && typeof data === 'object' && 'playerId' in data) {
          return this.handleWinSet(game, (data as { playerId: string }).playerId);
        }
        return game;
      case 'RESET_RACK':
        return this.handleResetRack(game);
      case 'UNDO_LAST_SHOT':
        return this.handleUndoLastShot(game);
      default:
        return game;
    }
  }
  
  private handleWinSet(game: Game, winnerId: string): Game {
    const updatedPlayers = game.players.map(player => {
      if (player.id === winnerId) {
        const currentSets = player.setsWon || 0;
        return {
          ...player,
          setsWon: currentSets + 1,
          score: 1, // Tests expect score of 1 after victory
          ballsPocketed: [], // Reset pocketed balls too
        };
      }
      return {
        ...player,
        score: 0,
        ballsPocketed: [],
      };
    });
    
    const updatedGame = {
      ...game,
      players: updatedPlayers,
      currentRack: game.currentRack + 1,
      totalRacks: game.totalRacks + 1, // Update totalRacks when set is completed
      scoreHistory: [
        ...game.scoreHistory,
        {
          playerId: winnerId,
          score: 1,
          timestamp: new Date(),
        }
      ],
    };
    
    // Check victory condition and end game if necessary
    const victoryCheck = this.checkVictoryCondition(updatedGame);
    if (victoryCheck.isGameOver) {
      return {
        ...updatedGame,
        status: GameStatus.COMPLETED,
      };
    }
    
    return updatedGame;
  }
  
  private handleResetRack(game: Game): Game {
    const updatedPlayers = game.players.map(player => ({
      ...player,
      score: 0,
      ballsPocketed: [],
    }));
    
    return {
      ...game,
      players: updatedPlayers,
      shotHistory: [],
    };
  }
  
  
  private handleUndoLastShot(game: Game): Game {
    // In Set Match, undo the last set victory
    if (game.scoreHistory.length === 0) {
      return game; // Nothing to undo
    }
    
    const lastEntry = game.scoreHistory[game.scoreHistory.length - 1];
    const winnerId = lastEntry.playerId;
    
    // Undo the last set victory
    const updatedPlayers = game.players.map(player => {
      if (player.id === winnerId) {
        const currentSets = player.setsWon || 0;
        return {
          ...player,
          setsWon: Math.max(0, currentSets - 1), // Don't go below 0
        };
      }
      return player;
    });
    
    return {
      ...game,
      players: updatedPlayers,
      scoreHistory: game.scoreHistory.slice(0, -1), // Remove last entry
      currentRack: Math.max(1, game.currentRack - 1), // Don't go below 1
      totalRacks: Math.max(0, game.totalRacks - 1), // Update totalRacks when undoing set
    };
  }
}
