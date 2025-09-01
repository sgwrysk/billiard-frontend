import { describe, it, expect } from 'vitest';
import { JapanEngine } from '../JapanEngine';

describe('Japan Game Cross-Rack Undo', () => {
  it('should allow undo across racks', () => {
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
    
    // Initial state: Rack 1
    expect(game.currentRack).toBe(1);
    expect(game.shotHistory.length).toBe(0);
    
    // Pocket ball 5 in rack 1
    game = engine.handlePocketBall(game, 5);
    expect(game.shotHistory.length).toBe(1);
    expect(game.players[0].score).toBeGreaterThan(0);
    expect(game.players[0].ballsPocketed).toContain(5);
    
    // const scoreAfterBall5 = game.players[0].score; // Unused after fixing test logic
    
    // Move to next rack
    game = engine.handleNextRack(game);
    expect(game.currentRack).toBe(2);
    expect(game.shotHistory.length).toBe(2); // ball_click + rack_complete
    expect(game.players[0].ballsPocketed).toEqual([]); // Cleared for new rack
    expect(game.players[0].score).toBe(0); // Score reset for new rack
    
    // Pocket ball 9 in rack 2
    game = engine.handlePocketBall(game, 9);
    expect(game.shotHistory.length).toBe(3);
    expect(game.players[0].ballsPocketed).toContain(9);
    
    const scoreAfterBall9 = game.players[0].score;
    expect(scoreAfterBall9).toBeGreaterThan(0); // Should have points from ball 9
    
    // Undo ball 9 (same rack undo)
    game = engine.handleCustomAction(game, 'UNDO_LAST_SHOT');
    expect(game.currentRack).toBe(2);
    expect(game.shotHistory.length).toBe(2);
    expect(game.players[0].score).toBe(0); // Score is 0 in rack 2 after ball 9 undo
    expect(game.players[0].ballsPocketed).toEqual([]); // No balls in rack 2
    
    // Undo rack completion (cross-rack undo)
    game = engine.handleCustomAction(game, 'UNDO_LAST_SHOT');
    expect(game.currentRack).toBe(1); // Back to rack 1
    expect(game.shotHistory.length).toBe(1); // Only ball_click remains
    expect(game.players[0].ballsPocketed).toContain(5); // Ball 5 restored in rack 1
    expect(game.japanRackHistory?.length || 0).toBe(0); // No completed racks
    
    // Undo ball 5 (back to initial state)
    game = engine.handleCustomAction(game, 'UNDO_LAST_SHOT');
    expect(game.currentRack).toBe(1);
    expect(game.shotHistory.length).toBe(0);
    expect(game.players[0].score).toBe(0);
    expect(game.players[0].ballsPocketed).toEqual([]);
  });
  
  it('should handle multiple rack completions and undos correctly', () => {
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
    
    // Complete rack 1
    game = engine.handlePocketBall(game, 5);
    game = engine.handleNextRack(game);
    expect(game.currentRack).toBe(2);
    expect(game.japanRackHistory?.length).toBe(1);
    
    // Complete rack 2
    game = engine.handlePocketBall(game, 9);
    game = engine.handleNextRack(game);
    expect(game.currentRack).toBe(3);
    expect(game.japanRackHistory?.length).toBe(2);
    
    // Start rack 3
    game = engine.handlePocketBall(game, 5);
    expect(game.currentRack).toBe(3);
    
    // Undo ball in rack 3
    game = engine.handleCustomAction(game, 'UNDO_LAST_SHOT');
    expect(game.currentRack).toBe(3);
    expect(game.japanRackHistory?.length).toBe(2);
    
    // Undo rack 2 completion
    game = engine.handleCustomAction(game, 'UNDO_LAST_SHOT');
    expect(game.currentRack).toBe(2);
    expect(game.japanRackHistory?.length).toBe(1);
    expect(game.players[0].ballsPocketed).toContain(9); // Ball 9 restored
    
    // Undo ball 9 in rack 2
    game = engine.handleCustomAction(game, 'UNDO_LAST_SHOT');
    expect(game.currentRack).toBe(2);
    expect(game.players[0].ballsPocketed).toEqual([]);
    
    // Undo rack 1 completion
    game = engine.handleCustomAction(game, 'UNDO_LAST_SHOT');
    expect(game.currentRack).toBe(1);
    expect(game.japanRackHistory?.length).toBe(0);
    expect(game.players[0].ballsPocketed).toContain(5); // Ball 5 restored
  });
  
  it('should not allow undo when no shot history exists', () => {
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
    
    const game = engine.initializeGame(playerSetups, japanSettings);
    
    // Try to undo with no history
    const undoResult = engine.handleCustomAction(game, 'UNDO_LAST_SHOT');
    
    // Game should remain unchanged
    expect(undoResult).toEqual(game);
    expect(undoResult.currentRack).toBe(1);
    expect(undoResult.shotHistory.length).toBe(0);
  });
  
  it('should reset player scores when moving to next rack', () => {
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
    
    // Pocket ball 5 in rack 1
    game = engine.handlePocketBall(game, 5);
    const scoreInRack1 = game.players[0].score;
    expect(scoreInRack1).toBeGreaterThan(0);
    
    // Move to next rack - scores should reset to 0
    game = engine.handleNextRack(game);
    expect(game.currentRack).toBe(2);
    expect(game.players[0].score).toBe(0); // Score reset for new rack
    expect(game.players[1].score).toBe(0); // All players reset
    
    // Pocket ball 9 in rack 2  
    game = engine.handlePocketBall(game, 9);
    const scoreInRack2 = game.players[0].score;
    expect(scoreInRack2).toBeGreaterThan(0);
    // Both balls are worth 1 point, so scores should be equal
    expect(scoreInRack2).toBe(1); // Ball 9 gives 1 point
    
    // Move to rack 3 - scores reset again
    game = engine.handleNextRack(game);
    expect(game.currentRack).toBe(3);
    expect(game.players[0].score).toBe(0); // Score reset again
    expect(game.players[1].score).toBe(0);
    
    // Verify rack history contains the completed racks
    expect(game.japanRackHistory?.length).toBe(2); // Rack 1 and Rack 2 completed
  });
});