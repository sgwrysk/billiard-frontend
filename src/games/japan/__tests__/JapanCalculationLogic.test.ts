import { describe, it, expect } from 'vitest';
import { JapanEngine } from '../JapanEngine';

describe('Japan Game Calculation Logic', () => {
  it('should calculate delta points correctly for example 3', () => {
    const engine = new JapanEngine();
    
    // Create a game with 3 players
    const playerSetups = [
      { name: 'AAA', id: 'player-1' },
      { name: 'BBB', id: 'player-2' },
      { name: 'CCC', id: 'player-3' }
    ];
    
    let game = engine.initializeGame(playerSetups);
    
    // AAA gets 4 points (4 balls)
    for (let i = 0; i < 4; i++) {
      game = engine.handlePocketBall(game, 5); // Using ball 5
    }
    
    // Switch to BBB and get 2 points (2 balls)
    game = engine.handleSwitchPlayer(game);
    for (let i = 0; i < 2; i++) {
      game = engine.handlePocketBall(game, 5);
    }
    
    // CCC gets 0 points (no balls)
    game = engine.handleSwitchPlayer(game);
    
    // Now complete the rack
    game = engine.handleCustomAction(game, 'nextRack');
    
    // Check the rack results
    const rackResult = game.japanRackHistory?.[0];
    expect(rackResult).toBeDefined();
    expect(rackResult!.rackNumber).toBe(1);
    
    const aaaResult = rackResult!.playerResults.find(p => p.playerId === 'player-1');
    const bbbResult = rackResult!.playerResults.find(p => p.playerId === 'player-2');
    const cccResult = rackResult!.playerResults.find(p => p.playerId === 'player-3');
    
    expect(aaaResult).toBeDefined();
    expect(bbbResult).toBeDefined();
    expect(cccResult).toBeDefined();
    
    // AAA: earned 4, delta should be +6
    expect(aaaResult!.earnedPoints).toBe(4);
    expect(aaaResult!.deltaPoints).toBe(6); // 4*2 (from others) - 2 (to BBB) - 0 (to CCC) = 8 - 2 = 6
    expect(aaaResult!.totalPoints).toBe(6);
    
    // BBB: earned 2, delta should be 0
    expect(bbbResult!.earnedPoints).toBe(2);
    expect(bbbResult!.deltaPoints).toBe(0); // 2*2 (from others) - 4 (to AAA) - 0 (to CCC) = 4 - 4 = 0
    expect(bbbResult!.totalPoints).toBe(0);
    
    // CCC: earned 0, delta should be -6
    expect(cccResult!.earnedPoints).toBe(0);
    expect(cccResult!.deltaPoints).toBe(-6); // 0*2 (from others) - 4 (to AAA) - 2 (to BBB) = 0 - 6 = -6
    expect(cccResult!.totalPoints).toBe(-6);
    
    // Verify sum is 0
    const totalDelta = aaaResult!.deltaPoints + bbbResult!.deltaPoints + cccResult!.deltaPoints;
    expect(totalDelta).toBe(0);
    
    const totalPoints = aaaResult!.totalPoints + bbbResult!.totalPoints + cccResult!.totalPoints;
    expect(totalPoints).toBe(0);
  });
  
  it('should calculate delta points correctly for example 4 (with multiplier)', () => {
    const engine = new JapanEngine();
    
    // Create a game with 3 players
    const playerSetups = [
      { name: 'AAA', id: 'player-1' },
      { name: 'BBB', id: 'player-2' },
      { name: 'CCC', id: 'player-3' }
    ];
    
    let game = engine.initializeGame(playerSetups);
    
    // AAA gets 4 points (4 balls)
    for (let i = 0; i < 4; i++) {
      game = engine.handlePocketBall(game, 5);
    }
    
    // Switch to BBB and get 2 points (2 balls)
    game = engine.handleSwitchPlayer(game);
    for (let i = 0; i < 2; i++) {
      game = engine.handlePocketBall(game, 5);
    }
    
    // CCC gets 0 points
    game = engine.handleSwitchPlayer(game);
    
    // Set multiplier to 2 (will be applied in UI display layer)
    game = engine.handleMultiplierChange(game, 2);
    
    // Complete the rack
    game = engine.handleCustomAction(game, 'nextRack');
    
    // Check the rack results
    const rackResult = game.japanRackHistory?.[0];
    expect(rackResult).toBeDefined();
    
    const aaaResult = rackResult!.playerResults.find(p => p.playerId === 'player-1');
    const bbbResult = rackResult!.playerResults.find(p => p.playerId === 'player-2');
    const cccResult = rackResult!.playerResults.find(p => p.playerId === 'player-3');
    
    // AAA: base 4 points * multiplier 2 = 8 earned points
    expect(aaaResult!.earnedPoints).toBe(8);
    expect(aaaResult!.deltaPoints).toBe(12); // 8*2 (from others) - (4 + 0) (to others) = 16 - 4 = 12
    expect(aaaResult!.totalPoints).toBe(12);
    
    // BBB: base 2 points * multiplier 2 = 4 earned points
    expect(bbbResult!.earnedPoints).toBe(4);
    expect(bbbResult!.deltaPoints).toBe(0); // 4*2 (from others) - (8 + 0) (to others) = 8 - 8 = 0
    expect(bbbResult!.totalPoints).toBe(0);
    
    // CCC: 0 points * multiplier 2 = 0 earned points
    expect(cccResult!.earnedPoints).toBe(0);
    expect(cccResult!.deltaPoints).toBe(-12); // 0*2 (from others) - (8 + 4) (to others) = 0 - 12 = -12
    expect(cccResult!.totalPoints).toBe(-12);
    
    // Verify sum is 0
    const totalDelta = aaaResult!.deltaPoints + bbbResult!.deltaPoints + cccResult!.deltaPoints;
    expect(totalDelta).toBe(0);
    
    const totalPoints = aaaResult!.totalPoints + bbbResult!.totalPoints + cccResult!.totalPoints;
    expect(totalPoints).toBe(0);
  });
});