import { describe, it, expect } from 'vitest';
import { JapanEngine } from '../JapanEngine';

describe('Japan Game Duplicate Ball Undo', () => {
  it('should remove ball icons one by one when same ball is pocketed multiple times', () => {
    const engine = new JapanEngine();
    
    const playerSetups = [
      { name: 'Player A' },
      { name: 'Player B' }
    ];
    
    const japanSettings = {
      handicapBalls: [5, 9],
      multipliers: [{ label: 'x2', value: 2 }],
      orderChangeInterval: 10,
      orderChangeEnabled: true,
      multipliersEnabled: false
    };
    
    let game = engine.initializeGame(playerSetups, japanSettings);
    
    // Initial state
    expect(game.players[0].ballsPocketed).toEqual([]);
    expect(game.players[0].score).toBe(0);
    
    // Pocket ball 5 first time (should give 1 point)
    game = engine.handlePocketBall(game, 5);
    expect(game.players[0].ballsPocketed).toEqual([5]);
    expect(game.players[0].score).toBe(1);
    
    // Pocket ball 9 (should give 1 point)
    game = engine.handlePocketBall(game, 9);
    expect(game.players[0].ballsPocketed).toEqual([5, 9]);
    expect(game.players[0].score).toBe(2);
    
    // Pocket ball 5 second time (should give 1 more point)
    game = engine.handlePocketBall(game, 5);
    expect(game.players[0].ballsPocketed).toEqual([5, 9, 5]);
    expect(game.players[0].score).toBe(3);
    
    // Pocket ball 9 second time (should give 1 more point)
    game = engine.handlePocketBall(game, 9);
    expect(game.players[0].ballsPocketed).toEqual([5, 9, 5, 9]);
    expect(game.players[0].score).toBe(4);
    
    // First undo - should remove last ball (most recent, which is 9)
    game = engine.handleUndo(game);
    expect(game.players[0].ballsPocketed).toEqual([5, 9, 5]);
    expect(game.players[0].score).toBe(3);
    
    // Second undo - should remove last ball (most recent, which is 5)
    game = engine.handleUndo(game);
    expect(game.players[0].ballsPocketed).toEqual([5, 9]);
    expect(game.players[0].score).toBe(2);
    
    // Third undo - should remove last ball (most recent, which is 9)
    game = engine.handleUndo(game);
    expect(game.players[0].ballsPocketed).toEqual([5]);
    expect(game.players[0].score).toBe(1);
    
    // Fourth undo - should remove last ball (5) only
    game = engine.handleUndo(game);
    expect(game.players[0].ballsPocketed).toEqual([]);
    expect(game.players[0].score).toBe(0);
  });

  it('should handle complex sequence with multiple same balls', () => {
    const engine = new JapanEngine();
    
    const playerSetups = [
      { name: 'Player A' },
      { name: 'Player B' }
    ];
    
    const japanSettings = {
      handicapBalls: [5, 9],
      multipliers: [{ label: 'x2', value: 2 }],
      orderChangeInterval: 10,
      orderChangeEnabled: true,
      multipliersEnabled: false
    };
    
    let game = engine.initializeGame(playerSetups, japanSettings);
    
    // Create sequence: 5, 5, 9, 5, 9, 9
    game = engine.handlePocketBall(game, 5); // [5]
    game = engine.handlePocketBall(game, 5); // [5, 5]
    game = engine.handlePocketBall(game, 9); // [5, 5, 9]
    game = engine.handlePocketBall(game, 5); // [5, 5, 9, 5]
    game = engine.handlePocketBall(game, 9); // [5, 5, 9, 5, 9]
    game = engine.handlePocketBall(game, 9); // [5, 5, 9, 5, 9, 9]
    
    expect(game.players[0].ballsPocketed).toEqual([5, 5, 9, 5, 9, 9]);
    expect(game.players[0].score).toBe(6);
    
    // Undo sequence should remove from the end (most recent balls)
    game = engine.handleUndo(game); // Remove last ball (most recent 9)
    expect(game.players[0].ballsPocketed).toEqual([5, 5, 9, 5, 9]);
    expect(game.players[0].score).toBe(5);
    
    game = engine.handleUndo(game); // Remove last ball (most recent 9)  
    expect(game.players[0].ballsPocketed).toEqual([5, 5, 9, 5]);
    expect(game.players[0].score).toBe(4);
    
    game = engine.handleUndo(game); // Remove last ball (most recent 5)
    expect(game.players[0].ballsPocketed).toEqual([5, 5, 9]);
    expect(game.players[0].score).toBe(3);
    
    game = engine.handleUndo(game); // Remove last 9
    expect(game.players[0].ballsPocketed).toEqual([5, 5]);
    expect(game.players[0].score).toBe(2);
    
    game = engine.handleUndo(game); // Remove last 5
    expect(game.players[0].ballsPocketed).toEqual([5]);
    expect(game.players[0].score).toBe(1);
    
    game = engine.handleUndo(game); // Remove last 5
    expect(game.players[0].ballsPocketed).toEqual([]);
    expect(game.players[0].score).toBe(0);
  });
});