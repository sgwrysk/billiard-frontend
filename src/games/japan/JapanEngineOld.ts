import { GameBase } from '../base/GameBase';
import { GameType } from '../../types/index';
import type { Game, Shot } from '../../types/index';
import type { JapanGameSettings, JapanBallAction } from '../../types/japan';

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
        multipliers: [{ label: 'x2', value: 2 }],
        deductionEnabled: false,
        deductions: [],
        orderChangeInterval: 10,
        orderChangeEnabled: false,
        multipliersEnabled: false
      }
    };
  }
  
  handleBallAction(game: Game, action: JapanBallAction): Game {
    const currentPlayer = game.players[game.currentPlayerIndex];
    let scoreChange = 0;
    let shot: Shot | null = null;
    
    switch (action.type) {
      case 'ball':
        scoreChange = action.value;
        // Double points for handicap balls
        if (game.japanSettings?.handicapBalls.includes(action.ball)) {
          scoreChange *= 2;
        }
        
        shot = {
          playerId: currentPlayer.id,
          ballNumber: action.ball,
          isSunk: true,
          isFoul: false,
          timestamp: new Date(),
        };
        break;
        
      case 'multiplier':
        scoreChange = currentPlayer.score * (action.value - 1); // Multiply current score
        
        shot = {
          playerId: currentPlayer.id,
          ballNumber: 0, // No specific ball
          isSunk: false,
          isFoul: false,
          timestamp: new Date(),
          customData: { type: 'multiplier', value: action.value, label: action.label }
        };
        break;
        
      case 'deduction':
        scoreChange = -action.value;
        
        shot = {
          playerId: currentPlayer.id,
          ballNumber: 0, // No specific ball
          isSunk: false,
          isFoul: true, // Mark as foul for deduction
          timestamp: new Date(),
          customData: { type: 'deduction', value: action.value, label: action.label }
        };
        break;
    }
    
    // Update player score (don't allow negative scores)
    const updatedPlayers = game.players.map((player, index) => {
      if (index === game.currentPlayerIndex) {
        return {
          ...player,
          score: Math.max(0, player.score + scoreChange),
          isActive: false, // Will be switched
        };
      }
      return player;
    });
    
    // Switch to next player
    const nextPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    updatedPlayers[nextPlayerIndex].isActive = true;
    
    // Add shot to history
    const shotHistory = shot ? [...game.shotHistory, shot] : game.shotHistory;
    
    return {
      ...game,
      players: updatedPlayers,
      currentPlayerIndex: nextPlayerIndex,
      shotHistory,
    };
  }
  
  handlePocketBall(game: Game, ballNumber: number): Game {
    const ballAction: JapanBallAction = {
      ball: ballNumber,
      type: 'ball',
      value: ballNumber,
      label: undefined
    };
    
    return this.handleBallAction(game, ballAction);
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
  
  checkVictoryCondition(_game: Game): { isGameOver: boolean; winnerId?: string } {
    // Japan game doesn't have a specific victory condition
    // It's typically played for a set time or until manual end
    return { isGameOver: false };
  }
  
  hasCustomLogic(): boolean {
    return true;
  }
  
  handleCustomAction(game: Game, action: string, data?: unknown): Game {
    if (action === 'ballAction' && data) {
      return this.handleBallAction(game, data as JapanBallAction);
    }
    return game;
  }
  
  handleUndo(game: Game): Game {
    if (game.shotHistory.length === 0) {
      return game;
    }
    
    const lastShot = game.shotHistory[game.shotHistory.length - 1];
    let scoreToRevert = 0;
    
    // Calculate score to revert based on shot type
    if (lastShot.customData?.type === 'multiplier') {
      const multiplierValue = lastShot.customData.value as number;
      const currentScore = game.players.find(p => p.id === lastShot.playerId)?.score || 0;
      scoreToRevert = -(currentScore * (multiplierValue - 1)) / multiplierValue; // Reverse multiplication
    } else if (lastShot.customData?.type === 'deduction') {
      scoreToRevert = lastShot.customData.value as number; // Add back the deducted points
    } else if (lastShot.ballNumber > 0) {
      scoreToRevert = lastShot.ballNumber;
      // Check if it was a handicap ball (double points)
      if (game.japanSettings?.handicapBalls.includes(lastShot.ballNumber)) {
        scoreToRevert *= 2;
      }
      scoreToRevert = -scoreToRevert; // Subtract the points
    }
    
    // Update players
    const updatedPlayers = game.players.map(player => {
      if (player.id === lastShot.playerId) {
        return {
          ...player,
          score: Math.max(0, player.score + scoreToRevert),
        };
      }
      return player;
    });
    
    // Remove last shot from history
    const updatedShotHistory = game.shotHistory.slice(0, -1);
    
    return {
      ...game,
      players: updatedPlayers,
      shotHistory: updatedShotHistory,
    };
  }
}