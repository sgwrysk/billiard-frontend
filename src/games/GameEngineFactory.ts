import type { IGameEngine } from './base/GameBase';
import { GameType } from '../types/index';
import { SetMatchEngine } from './setmatch/SetMatchEngine';
import { RotationEngine } from './rotation/RotationEngine';
import { BowlardEngine } from './bowlard/BowlardEngine';

export class GameEngineFactory {
  private static engines: Map<GameType, IGameEngine> = new Map();
  
  static getEngine(gameType: GameType): IGameEngine {
    if (!this.engines.has(gameType)) {
      this.engines.set(gameType, this.createEngine(gameType));
    }
    
    return this.engines.get(gameType)!;
  }
  
  private static createEngine(gameType: GameType): IGameEngine {
    switch (gameType) {
      case GameType.SET_MATCH:
        return new SetMatchEngine();
      case GameType.ROTATION:
        return new RotationEngine();
      case GameType.BOWLARD:
        return new BowlardEngine();
      default:
        throw new Error(`Unsupported game type: ${gameType}`);
    }
  }
  
  static getAllSupportedGameTypes(): GameType[] {
    return [GameType.SET_MATCH, GameType.ROTATION, GameType.BOWLARD];
  }
  
  static isGameTypeSupported(gameType: GameType): boolean {
    return this.getAllSupportedGameTypes().includes(gameType);
  }
}
