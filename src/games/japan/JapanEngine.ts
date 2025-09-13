import { GameBase } from '../base/GameBase';
import { GameType } from '../../types/index';
import type { Game, Shot } from '../../types/index';
import type { JapanGameSettings } from '../../types/japan';
import { PlayerOrderCalculator } from './PlayerOrderCalculator';
import { JapanScoreCalculator } from './JapanScoreCalculator';
import { JapanUndoHandler } from './JapanUndoHandler';

interface RackData {
  player1Balls: number;
  player2Balls: number;
  rackNumber: number;
}

export class JapanEngine extends GameBase {
  getGameType(): GameType {
    return GameType.JAPAN;
  }
  
  getBallNumbers(): number[] {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }
  
  initializeGame(playerSetups: {name: string, targetScore?: number, targetSets?: number}[], japanSettings?: JapanGameSettings): Game {
    const baseGame = super.initializeGame(playerSetups);
    
    return {
      ...baseGame,
      japanSettings: japanSettings || {
        handicapBalls: [5, 9],
        orderChangeInterval: 10,
        orderChangeEnabled: false
      },
      japanCurrentMultiplier: 1, // Initialize with default multiplier
      japanRackHistory: [],
      japanPlayerOrderHistory: [{
        fromRack: 1,
        toRack: japanSettings?.orderChangeInterval || 10,
        playerOrder: baseGame.players.map(p => p.id)
      }]
    };
  }
  
  handleRackComplete(game: Game, rackData: RackData): Game {
    const japanSettings = game.japanSettings!;
    const handicapBalls = japanSettings.handicapBalls;
    
    // Calculate scores for each player based on ball counts
    const updatedPlayers = game.players.map((player, index) => {
      const ballCount = index === 0 ? rackData.player1Balls : rackData.player2Balls;
      
      // Calculate score: assume handicap balls are distributed proportionally
      // If player gets X balls out of 10 total, they get X/10 of each handicap ball type
      let score = 0;
      
      if (ballCount === 10) {
        // Player got all balls - include all handicap balls with double points
        score = 10 + handicapBalls.length * 5; // Regular balls + handicap bonus (5 points each handicap)
      } else {
        // More deterministic approach: 
        // If player gets >= 5 balls, they probably got at least one handicap
        const likelyHandicapBalls = ballCount >= 5 ? Math.min(Math.floor(ballCount / 5), handicapBalls.length) : 0;
        const regularBalls = ballCount - likelyHandicapBalls;
        
        score = regularBalls + (likelyHandicapBalls * 10); // Regular + (handicap * 2 * 5)
      }
      
      return {
        ...player,
        score: player.score + Math.max(0, score),
      };
    });
    
    // Create shot history entry for the rack
    const shot: Shot = {
      playerId: game.players[0].id, // Track for first player (could be extended)
      ballNumber: rackData.player1Balls, // Use ball count as identifier
      isSunk: true,
      isFoul: false,
      timestamp: new Date(),
      customData: {
        type: 'rack_complete',
        rackNumber: rackData.rackNumber,
        player1Balls: rackData.player1Balls,
        player2Balls: rackData.player2Balls
      }
    };
    
    return {
      ...game,
      players: updatedPlayers,
      currentRack: game.currentRack + 1,
      shotHistory: [...game.shotHistory, shot],
    };
  }
  
  
  // Handle individual ball clicks for Japan game
  handlePocketBall(game: Game, ballNumber: number): Game {
    const currentPlayer = game.players[game.currentPlayerIndex];
    const points = 1; // All balls are worth 1 point
    
    // Update the current player's score
    const updatedPlayers = game.players.map((player) => {
      if (player.id === currentPlayer.id) {
        return {
          ...player,
          score: player.score + points,
          ballsPocketed: [...(player.ballsPocketed || []), ballNumber], // Track pocketed balls
        };
      }
      return player;
    });
    
    // Create shot history entry
    const shot = {
      playerId: currentPlayer.id,
      ballNumber,
      isSunk: true,
      isFoul: false,
      timestamp: new Date(),
      customData: {
        type: 'ball_click',
        points,
      }
    };
    
    return {
      ...game,
      players: updatedPlayers,
      shotHistory: [...game.shotHistory, shot],
    };
  }
  
  handleSwitchPlayer(game: Game): Game {
    const nextPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    
    const updatedPlayers = game.players.map((player, index) => ({
      ...player,
      isActive: index === nextPlayerIndex,
    }));
    
    return {
      ...game,
      players: updatedPlayers,
      currentPlayerIndex: nextPlayerIndex,
    };
  }
  
  // Handle multiplier change
  handleMultiplierChange(game: Game, multiplier: number): Game {
    return {
      ...game,
      japanCurrentMultiplier: Math.max(1, Math.min(100, multiplier)) // Ensure multiplier is between 1 and 100
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  checkVictoryCondition(_game: Game): { isGameOver: boolean; winnerId?: string } {
    // Japan game doesn't have a specific victory condition
    // It's typically played for a set time or until manual end
    return { isGameOver: false };
  }
  
  hasCustomLogic(): boolean {
    return true;
  }
  
  // Handle next rack - calculate current rack results and move to next rack
  handleNextRack(game: Game): Game {
    // Calculate current rack results
    const currentRackResults = JapanScoreCalculator.calculateCurrentRackResults(game);
    
    // Add to rack history
    const newRackHistory = [...(game.japanRackHistory || []), currentRackResults];
    
    // Reset current rack data and move to next rack
    const updatedPlayers = game.players.map(player => ({
      ...player,
      ballsPocketed: [], // Clear collected balls for new rack
      score: 0, // Reset score for new rack - accumulation is tracked in rack history
    }));
    
    // Create shot history entry for rack completion
    const rackCompleteShot = {
      playerId: game.players[game.currentPlayerIndex].id,
      ballNumber: 0, // No specific ball for rack completion
      isSunk: false,
      isFoul: false,
      timestamp: new Date(),
      customData: {
        type: 'rack_complete',
        previousRack: game.currentRack,
        rackResults: currentRackResults,
        previousMultiplier: game.japanCurrentMultiplier, // Store multiplier for undo
        previousPlayerStates: game.players.map(player => ({
          id: player.id,
          ballsPocketed: [...(player.ballsPocketed || [])],
          score: player.score, // Save current rack score for undo
        })),
      }
    };
    
    return {
      ...game,
      players: updatedPlayers,
      currentRack: game.currentRack + 1,
      japanRackHistory: newRackHistory,
      shotHistory: [...game.shotHistory, rackCompleteShot],
      japanCurrentMultiplier: 1, // Reset multiplier to 1 for next rack
    };
  }
  
  // Handle player order change
  private handlePlayerOrderChange(game: Game, selectedPlayerId: string): Game {
    const selectedPlayerIndex = game.players.findIndex(p => p.id === selectedPlayerId);
    if (selectedPlayerIndex === -1) {
      return game;
    }
    
    const newPlayerOrder = PlayerOrderCalculator.calculateNewPlayerOrder(game.players, selectedPlayerId);
    const orderChangeInterval = game.japanSettings?.orderChangeInterval || 10;
    
    // Add new player order period to history
    const newOrderHistory = [...(game.japanPlayerOrderHistory || [])];
    const nextPeriodStart = game.currentRack + 1;
    const nextPeriodEnd = nextPeriodStart + orderChangeInterval - 1;
    
    newOrderHistory.push({
      fromRack: nextPeriodStart,
      toRack: nextPeriodEnd,
      playerOrder: newPlayerOrder.map(p => p.id)
    });
    
    // Update game with new player order
    const updatedGame = {
      ...game,
      players: newPlayerOrder.map((player, index) => ({
        ...player,
        isActive: index === 0, // First player is active
      })),
      currentPlayerIndex: 0, // Start with first player
      japanPlayerOrderHistory: newOrderHistory,
    };
    
    return updatedGame;
  }
  
  // Check if order change is needed (public for testing)
  shouldShowOrderChangeDialog(game: Game): boolean {
    // Order change occurs for 3+ players only
    if (game.players.length <= 2) {
      return false;
    }
    
    const orderChangeInterval = game.japanSettings?.orderChangeInterval || 10;
    return game.currentRack > 0 && game.currentRack % orderChangeInterval === 0;
  }

  handleCustomAction(game: Game, action: string, data?: unknown): Game {
    switch (action) {
      case 'rackComplete': {
        return this.handleRackComplete(game, data as RackData);
      }
      case 'nextRack': {
        return this.handleNextRack(game);
      }
      case 'playerOrderChange': {
        const { selectedPlayerId } = data as { selectedPlayerId: string };
        return this.handlePlayerOrderChange(game, selectedPlayerId);
      }
      case 'UNDO_LAST_SHOT': {
        return JapanUndoHandler.handleUndo(game);
      }
      default:
        return game;
    }
  }
  
  handleUndo(game: Game): Game {
    return JapanUndoHandler.handleUndo(game);
  }
  
  // Handle game end - calculate final rack results without moving to next rack
  handleGameEnd(game: Game): Game {
    // Find the last rack completion shot
    let lastRackCompleteIndex = -1;
    for (let i = game.shotHistory.length - 1; i >= 0; i--) {
      if (game.shotHistory[i].customData?.type === 'rack_complete') {
        lastRackCompleteIndex = i;
        break;
      }
    }
    
    // Check if there are ball clicks after the last rack completion
    const currentRackShots = game.shotHistory.slice(lastRackCompleteIndex + 1);
    const hasCurrentRackShots = currentRackShots.some(s => s.customData?.type === 'ball_click');
    
    if (!hasCurrentRackShots) {
      return game; // No shots in current rack, return as is
    }
    
    // Calculate current rack results
    const currentRackResults = JapanScoreCalculator.calculateCurrentRackResults(game);
    
    // Add to rack history without advancing to next rack
    const newRackHistory = [...(game.japanRackHistory || []), currentRackResults];
    
    // Create shot history entry for game completion
    const gameCompleteShot = {
      playerId: game.players[game.currentPlayerIndex].id,
      ballNumber: 0, // No specific ball for game completion
      isSunk: false,
      isFoul: false,
      timestamp: new Date(),
      customData: {
        type: 'game_complete',
        finalRack: game.currentRack,
        rackResults: currentRackResults,
        finalMultiplier: game.japanCurrentMultiplier,
        finalPlayerStates: game.players.map(player => ({
          id: player.id,
          ballsPocketed: [...(player.ballsPocketed || [])],
          score: player.score,
        })),
      }
    };
    
    return {
      ...game,
      japanRackHistory: newRackHistory,
      shotHistory: [...game.shotHistory, gameCompleteShot],
    };
  }
}