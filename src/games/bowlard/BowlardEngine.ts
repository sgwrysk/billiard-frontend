import { GameBase } from '../base/GameBase';
import type { Game, Player, BowlingFrame } from '../../types/index';
import { GameType } from '../../types/index';
import { initializeBowlingFrames, calculateBowlingScores, updateFrameStatus } from '../../utils/bowlingUtils';

export class BowlardEngine extends GameBase {
  getGameType(): GameType {
    return GameType.BOWLARD;
  }
  
  getBallNumbers(): number[] {
    // Bowlardではボールは使用しない
    return [];
  }
  
  initializePlayers(playerSetups: {name: string, targetScore?: number, targetSets?: number}[]): Player[] {
    // 単一プレイヤーのみ
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
    // Bowlardではボールポケットは使用しない
    return game;
  }
  
  handleSwitchPlayer(game: Game): Game {
    // Bowlardは単一プレイヤーのみなので交代なし
    return game;
  }
  
  checkVictoryCondition(game: Game): { isGameOver: boolean; winnerId?: string } {
    const player = game.players[0];
    if (!player.bowlingFrames) return { isGameOver: false };
    
    // 10フレーム目が完了しているかチェック
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
    
    // 現在のフレームを見つける
    const currentFrameIndex = frames.findIndex(frame => !frame.isComplete);
    if (currentFrameIndex === -1) return game; // 全て完了している場合
    
    const currentFrame = { 
      ...frames[currentFrameIndex],
      rolls: [...frames[currentFrameIndex].rolls]
    };
    
    // 投球数を追加
    currentFrame.rolls.push(pins);
    
    // フレーム状態を更新
    const updatedFrame = updateFrameStatus(currentFrame, currentFrameIndex);
    frames[currentFrameIndex] = updatedFrame;
    
    // スコア計算
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
    
    // 最後に投球したフレームを見つける
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
    
    // 最後の投球を削除
    const updatedFrame = { ...lastFrameWithRolls };
    updatedFrame.rolls = updatedFrame.rolls.slice(0, -1);
    
    // フレーム状態をリセット
    updatedFrame.isComplete = false;
    updatedFrame.isStrike = false;
    updatedFrame.isSpare = false;
    updatedFrame.score = undefined;
    
    frames[lastFrameIndex] = updatedFrame;
    
    // その後のフレームのスコアもリセット
    for (let i = lastFrameIndex; i < frames.length; i++) {
      frames[i].score = undefined;
    }
    
    // スコア再計算
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
    // BowlardではhandleUndoBowlingRollを使用
    return this.handleUndoBowlingRoll(game);
  }
}
