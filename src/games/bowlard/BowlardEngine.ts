import { GameBase } from '../base/GameBase';
import type { Game, Player, BowlingFrame } from '../../types/index';
import { GameType } from '../../types/index';
import { initializeBowlingFrames, calculateBowlingScores, updateFrameStatus } from '../../utils/bowlingUtils';

export class BowlardEngine extends GameBase {
  getGameType(): GameType {
    return GameType.BOWLARD;
  }
  
  getBallNumbers(): number[] {
    // Bowlard doesn't use balls
    return [];
  }
  
  initializePlayers(playerSetups: {name: string, targetScore?: number, targetSets?: number}[]): Player[] {
    // Single player only
    const setup = playerSetups[0];
    return [{
      id: 'player-1',
      name: setup.name,
      score: 0,
      ballsPocketed: [],
      isActive: true,
      bowlingFrames: initializeBowlingFrames(),
    }];
  }
  
  handlePocketBall(game: Game, _ballNumber: number): Game {
    // Bowlard doesn't use ball pockets
    return game;
  }
  
  handleSwitchPlayer(game: Game): Game {
    // Bowlard is single player only, no switching
    return game;
  }
  
  checkVictoryCondition(game: Game): { isGameOver: boolean; winnerId?: string } {
    const player = game.players[0];
    if (!player.bowlingFrames) return { isGameOver: false };
    
    // Check if 10th frame is completed
    const tenthFrame = player.bowlingFrames[9];
    if (tenthFrame && tenthFrame.isComplete) {
      return { isGameOver: true, winnerId: player.id };
    }
    
    return { isGameOver: false };
  }
  
  hasCustomLogic(): boolean {
    return true;
  }
  
  handleCustomAction(game: Game, action: string, data?: any): Game {
    switch (action) {
      case 'ADD_PINS':
        return this.handleAddPins(game, data.pins);
      case 'UNDO_BOWLING_ROLL':
        return this.handleUndoBowlingRoll(game);
      default:
        return game;
    }
  }
  
  private handleAddPins(game: Game, pins: number): Game {
    const player = game.players[0];
    if (!player.bowlingFrames) return game;
    
    const frames = [...player.bowlingFrames];
    
    // Find current frame
    const currentFrameIndex = frames.findIndex(frame => !frame.isComplete);
    if (currentFrameIndex === -1) return game; // All completed
    
    const currentFrame = { 
      ...frames[currentFrameIndex],
      rolls: [...frames[currentFrameIndex].rolls]
    };
    
    // Add pin count
    currentFrame.rolls.push(pins);
    
    // Update frame status
    const updatedFrame = updateFrameStatus(currentFrame, currentFrameIndex);
    frames[currentFrameIndex] = updatedFrame;
    
    // Calculate scores
    const calculatedFrames = calculateBowlingScores(frames);
    
    const updatedPlayer = {
      ...player,
      bowlingFrames: calculatedFrames,
      score: calculatedFrames[calculatedFrames.length - 1]?.score || 0,
    };
    
    return {
      ...game,
      players: [updatedPlayer],
    };
  }
  
  private handleUndoBowlingRoll(game: Game): Game {
    const player = game.players[0];
    if (!player.bowlingFrames) return game;
    
    const frames = [...player.bowlingFrames];
    
    // Find the last frame with rolls
    let lastFrameWithRolls: BowlingFrame | null = null;
    let lastFrameIndex = -1;
    
    for (let i = frames.length - 1; i >= 0; i--) {
      if (frames[i].rolls.length > 0) {
        lastFrameWithRolls = frames[i];
        lastFrameIndex = i;
        break;
      }
    }
    
    if (!lastFrameWithRolls || lastFrameIndex === -1) return game;
    
    // Remove last roll
    const updatedFrame = { ...lastFrameWithRolls };
    updatedFrame.rolls = updatedFrame.rolls.slice(0, -1);
    
    // Reset frame status
    updatedFrame.isComplete = false;
    updatedFrame.isStrike = false;
    updatedFrame.isSpare = false;
    updatedFrame.score = undefined;
    
    frames[lastFrameIndex] = updatedFrame;
    
    // Reset scores for subsequent frames too
    for (let i = lastFrameIndex; i < frames.length; i++) {
      frames[i].score = undefined;
    }
    
    // Recalculate scores
    const recalculatedFrames = calculateBowlingScores(frames);
    
    const updatedPlayer = {
      ...player,
      bowlingFrames: recalculatedFrames,
      score: recalculatedFrames[recalculatedFrames.length - 1]?.score || 0,
    };
    
    return {
      ...game,
      players: [updatedPlayer],
    };
  }
  
  handleUndo(game: Game): Game {
    // Use handleUndoBowlingRoll for Bowlard
    return this.handleUndoBowlingRoll(game);
  }
}
