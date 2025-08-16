import { GameBase } from '../base/GameBase';
import type { Game, Player, BowlingFrame } from '../../types/index';
import { GameType } from '../../types/index';
import { initializeBowlingFrames, calculateBowlingScores } from '../../utils/bowlingUtils';

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
    let currentFrame = frames.find(frame => !frame.isComplete);
    if (!currentFrame) return game; // 全て完了している場合
    
    const frameIndex = currentFrame.frameNumber - 1;
    
    // 投球数を追加
    if (frameIndex < 9) {
      // 1-9フレーム
      if (currentFrame.rolls.length === 0) {
        // 1投目
        currentFrame.rolls.push(pins);
        if (pins === 10) {
          // ストライク
          currentFrame.isStrike = true;
          currentFrame.isComplete = true;
        }
      } else if (currentFrame.rolls.length === 1) {
        // 2投目
        currentFrame.rolls.push(pins);
        if (currentFrame.rolls[0] + pins === 10) {
          currentFrame.isSpare = true;
        }
        currentFrame.isComplete = true;
      }
    } else {
      // 10フレーム目
      currentFrame.rolls.push(pins);
      
      if (currentFrame.rolls.length === 2) {
        const firstRoll = currentFrame.rolls[0];
        const secondRoll = currentFrame.rolls[1];
        
        if (firstRoll === 10 || firstRoll + secondRoll === 10) {
          // ストライクまたはスペアの場合、3投目が必要
          // まだ完了しない
        } else {
          // 通常の場合、2投で完了
          currentFrame.isComplete = true;
        }
      } else if (currentFrame.rolls.length === 3) {
        // 3投目で完了
        currentFrame.isComplete = true;
      }
    }
    
    frames[frameIndex] = currentFrame;
    
    // スコア計算
    const calculatedFrames = calculateBowlingScores(frames);
    
    const updatedPlayer = {
      ...player,
      bowlingFrames: calculatedFrames,
      score: calculatedFrames.reduce((total, frame) => total + (frame.score || 0), 0),
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
      score: recalculatedFrames.reduce((total, frame) => total + (frame.score || 0), 0),
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
