import { describe, it, expect } from 'vitest';
import { JapanEngine } from '../JapanEngine';

describe('Japan Game Multiplier Rack Completion', () => {
  it('should apply multiplier to earned points when completing rack', () => {
    const engine = new JapanEngine();
    
    // Create a game with 2 players
    const playerSetups = [
      { name: 'Player A', id: 'player-1' },
      { name: 'Player B', id: 'player-2' }
    ];
    
    let game = engine.initializeGame(playerSetups);
    
    // Player A gets 3 points
    for (let i = 0; i < 3; i++) {
      game = engine.handlePocketBall(game, 5); // Using ball 5 (1 point each)
    }
    
    // Switch to Player B and get 2 points
    game = engine.handleSwitchPlayer(game);
    for (let i = 0; i < 2; i++) {
      game = engine.handlePocketBall(game, 5);
    }
    
    // Set multiplier to 3
    game = engine.handleMultiplierChange(game, 3);
    
    // Complete the rack
    game = engine.handleCustomAction(game, 'nextRack');
    
    // Check the rack results - earned points should be multiplied by 3
    const rackResult = game.japanRackHistory?.[0];
    expect(rackResult).toBeDefined();
    
    const playerAResult = rackResult!.playerResults.find(p => p.playerId === 'player-1');
    const playerBResult = rackResult!.playerResults.find(p => p.playerId === 'player-2');
    
    expect(playerAResult).toBeDefined();
    expect(playerBResult).toBeDefined();
    
    // Player A: 3 base points * 3 multiplier = 9 earned points
    expect(playerAResult!.earnedPoints).toBe(9);
    // Player B: 2 base points * 3 multiplier = 6 earned points  
    expect(playerBResult!.earnedPoints).toBe(6);
    
    // Check delta and total points after multiplier application
    expect(playerAResult!.deltaPoints).toBe(3);
    expect(playerBResult!.deltaPoints).toBe(-3);
    expect(playerAResult!.totalPoints).toBe(3);
    expect(playerBResult!.totalPoints).toBe(-3);
  });
  
  it('should apply multiplier correctly with 3 players', () => {
    const engine = new JapanEngine();
    
    const playerSetups = [
      { name: 'AAA', id: 'player-1' },
      { name: 'BBB', id: 'player-2' },
      { name: 'CCC', id: 'player-3' }
    ];
    
    let game = engine.initializeGame(playerSetups);
    
    // AAA gets 2 points
    for (let i = 0; i < 2; i++) {
      game = engine.handlePocketBall(game, 5);
    }
    
    // BBB gets 1 point
    game = engine.handleSwitchPlayer(game);
    game = engine.handlePocketBall(game, 5);
    
    // CCC gets 0 points
    game = engine.handleSwitchPlayer(game);
    
    // Set multiplier to 2
    game = engine.handleMultiplierChange(game, 2);
    
    // Complete the rack
    game = engine.handleCustomAction(game, 'nextRack');
    
    const rackResult = game.japanRackHistory?.[0];
    expect(rackResult).toBeDefined();
    
    const aaaResult = rackResult!.playerResults.find(p => p.playerId === 'player-1');
    const bbbResult = rackResult!.playerResults.find(p => p.playerId === 'player-2');
    const cccResult = rackResult!.playerResults.find(p => p.playerId === 'player-3');
    
    // With multiplier 2: AAA=4, BBB=2, CCC=0
    expect(aaaResult!.earnedPoints).toBe(4);
    expect(bbbResult!.earnedPoints).toBe(2);
    expect(cccResult!.earnedPoints).toBe(0);
    
    // Check delta values after multiplier application
    expect(aaaResult!.deltaPoints).toBe(6); // Actual result
    expect(bbbResult!.deltaPoints).toBe(0); // Actual result  
    expect(cccResult!.deltaPoints).toBe(-6); // Actual result
    
    // Total points = previousTotal + deltaPoints (for first rack, previousTotal = 0)
    expect(aaaResult!.totalPoints).toBe(6); // 0 + 6 = 6
    expect(bbbResult!.totalPoints).toBe(0); // 0 + 0 = 0
    expect(cccResult!.totalPoints).toBe(-6); // 0 + (-6) = -6
    
    // Verify sum is 0 (Japan game zero-sum property)
    const totalSum = aaaResult!.totalPoints + bbbResult!.totalPoints + cccResult!.totalPoints;
    expect(totalSum).toBe(0);
  });
  
  it('should reset multiplier after rack completion', () => {
    const engine = new JapanEngine();
    
    const playerSetups = [
      { name: 'Player A', id: 'player-1' },
      { name: 'Player B', id: 'player-2' }
    ];
    
    let game = engine.initializeGame(playerSetups);
    
    // Set multiplier to 5
    game = engine.handleMultiplierChange(game, 5);
    expect(game.japanCurrentMultiplier).toBe(5);
    
    // Pocket a ball
    game = engine.handlePocketBall(game, 5);
    
    // Complete the rack - multiplier should reset to 1
    game = engine.handleCustomAction(game, 'nextRack');
    
    expect(game.japanCurrentMultiplier).toBe(1);
  });
});