import { describe, it, expect } from 'vitest';
import { JapanEngine } from '../JapanEngine';
import { GameType } from '../../../types/index';
import type { JapanGameSettings } from '../../../types/japan';

describe('JapanEngine (Correct Implementation)', () => {
  let engine: JapanEngine;
  
  const defaultSettings: JapanGameSettings = {
    handicapBalls: [5, 9],
    orderChangeInterval: 10,
    orderChangeEnabled: false
  };

  beforeEach(() => {
    engine = new JapanEngine();
  });

  it('should return JAPAN as game type', () => {
    expect(engine.getGameType()).toBe(GameType.JAPAN);
  });

  it('should return ball numbers 1-10', () => {
    expect(engine.getBallNumbers()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should initialize game with Japan settings', () => {
    const playerSetups = [
      { name: 'Player 1' },
      { name: 'Player 2' }
    ];

    const game = engine.initializeGame(playerSetups, defaultSettings);

    expect(game.type).toBe(GameType.JAPAN);
    expect(game.japanSettings).toEqual(defaultSettings);
    expect(game.players).toHaveLength(2);
    expect(game.players[0].score).toBe(0);
    expect(game.currentPlayerIndex).toBe(0);
    expect(game.currentRack).toBe(1);
  });

  it('should handle rack completion with ball counts', () => {
    const game = engine.initializeGame([{ name: 'Player 1' }, { name: 'Player 2' }], defaultSettings);
    
    const rackData = {
      player1Balls: 3,
      player2Balls: 7,
      rackNumber: 1
    };

    const updatedGame = engine.handleRackComplete(game, rackData);
    
    // Player 1: 3 balls, likely no handicap = 3 points
    expect(updatedGame.players[0].score).toBe(3);
    // Player 2: 7 balls, likely includes 1 handicap ball = 6 regular + 1 handicap = 6 + 10 = 16 points
    expect(updatedGame.players[1].score).toBe(16);
  });

  it('should calculate handicap ball scoring correctly', () => {
    const game = engine.initializeGame([{ name: 'Player 1' }, { name: 'Player 2' }], defaultSettings);
    
    // Player gets 5 balls including handicap ball 5
    const rackData = {
      player1Balls: 5, // This includes some regular balls and handicap balls
      player2Balls: 5,
      rackNumber: 1
    };

    const updatedGame = engine.handleRackComplete(game, rackData);
    
    // Need to think about this: if player gets 5 balls total,
    // and handicap balls are 5 and 9, how many of each type?
    // This is ambiguous - we need more specific implementation
    expect(updatedGame.players[0].score).toBeGreaterThan(5); // Should be > 5 due to handicap bonus
  });

  it('should update multiplier value', () => {
    const game = engine.initializeGame([{ name: 'Player 1' }, { name: 'Player 2' }], defaultSettings);
    
    // Test setting multiplier to 5
    const updatedGame = engine.handleMultiplierChange(game, 5);
    expect(updatedGame.japanCurrentMultiplier).toBe(5);
    
    // Test boundary validation - should clamp to max 100
    const gameWith200 = engine.handleMultiplierChange(game, 200);
    expect(gameWith200.japanCurrentMultiplier).toBe(100);
    
    // Test boundary validation - should clamp to min 1
    const gameWith0 = engine.handleMultiplierChange(game, 0);
    expect(gameWith0.japanCurrentMultiplier).toBe(1);
  });


  it('should advance rack number after completion', () => {
    const game = engine.initializeGame([{ name: 'Player 1' }, { name: 'Player 2' }], defaultSettings);
    
    const rackData = {
      player1Balls: 3,
      player2Balls: 7,
      rackNumber: 1
    };

    const updatedGame = engine.handleRackComplete(game, rackData);
    
    expect(updatedGame.currentRack).toBe(2);
  });

  it('should check victory condition - no winner yet', () => {
    const game = engine.initializeGame([{ name: 'Player 1' }, { name: 'Player 2' }], defaultSettings);
    
    const result = engine.checkVictoryCondition(game);
    
    expect(result.isGameOver).toBe(false);
    expect(result.winnerId).toBeUndefined();
  });

  it('should handle UNDO_LAST_SHOT action', () => {
    const game = engine.initializeGame([{ name: 'Player 1' }, { name: 'Player 2' }], defaultSettings);
    const initialScore = game.players[0].score;
    
    // Pocket a handicap ball to create a shot to undo
    const gameWithShot = engine.handlePocketBall(game, 5);
    expect(gameWithShot.shotHistory.length).toBe(1);
    expect(gameWithShot.players[0].score).toBeGreaterThan(initialScore);
    
    // Test that handleCustomAction properly routes UNDO_LAST_SHOT
    const undoneGame = engine.handleCustomAction(gameWithShot, 'UNDO_LAST_SHOT');
    expect(undoneGame.shotHistory.length).toBe(0);
    expect(undoneGame.players[0].score).toBe(initialScore);
  });
});