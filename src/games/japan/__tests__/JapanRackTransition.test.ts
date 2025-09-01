import { describe, it, expect } from 'vitest';
import { JapanEngine } from '../JapanEngine';

describe('Japan Game Rack Transition', () => {
  it('should not carry over score from previous rack', () => {
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
    expect(game.players[0].score).toBe(0);
    expect(game.shotHistory.length).toBe(0);
    
    // Pocket ball 5 in rack 1 (should give 1 point)
    game = engine.handlePocketBall(game, 5);
    expect(game.players[0].score).toBe(1);
    expect(game.shotHistory.length).toBe(1);
    expect(game.shotHistory[0].customData?.type).toBe('ball_click');
    expect(game.shotHistory[0].customData?.points).toBe(1);
    
    // Move to next rack
    game = engine.handleNextRack(game);
    expect(game.currentRack).toBe(2);
    expect(game.players[0].score).toBe(0); // Score should be reset to 0
    expect(game.shotHistory.length).toBe(2); // ball_click + rack_complete
    expect(game.shotHistory[1].customData?.type).toBe('rack_complete');
    
    // Verify rack history was created
    expect(game.japanRackHistory?.length).toBe(1);
    expect(game.japanRackHistory?.[0].rackNumber).toBe(1);
    
    // Pocket ball 9 in rack 2
    game = engine.handlePocketBall(game, 9);
    expect(game.currentRack).toBe(2);
    expect(game.players[0].score).toBe(1); // Should only show current rack score
    expect(game.shotHistory.length).toBe(3); // ball_click + rack_complete + ball_click
    
    // The last shot should be the ball click for rack 2
    const lastShot = game.shotHistory[game.shotHistory.length - 1];
    expect(lastShot.customData?.type).toBe('ball_click');
    expect(lastShot.ballNumber).toBe(9);
    
    // Verify that the cumulative score is tracked in rack history
    const rack1Result = game.japanRackHistory?.[0];
    const player1Rack1Result = rack1Result?.playerResults.find(pr => pr.playerId === 'player-1');
    expect(player1Rack1Result?.earnedPoints).toBeGreaterThan(0); // Player earned points in rack 1
  });
  
  it('should correctly calculate current rack points across multiple racks', () => {
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
    
    // Rack 1: Pocket ball 5 (1 point)
    game = engine.handlePocketBall(game, 5);
    expect(game.players[0].score).toBe(1);
    
    // Move to rack 2
    game = engine.handleNextRack(game);
    expect(game.players[0].score).toBe(0); // Reset for rack 2
    
    // Rack 2: Pocket ball 5 again (1 point)
    game = engine.handlePocketBall(game, 5);
    expect(game.players[0].score).toBe(1); // Only current rack score
    
    // Rack 2: Pocket ball 9 (1 point)
    game = engine.handlePocketBall(game, 9);
    expect(game.players[0].score).toBe(2); // 1 + 1 = 2 for current rack only
    
    // Move to rack 3
    game = engine.handleNextRack(game);
    expect(game.players[0].score).toBe(0); // Reset again for rack 3
    expect(game.japanRackHistory?.length).toBe(2); // Rack 1 and 2 completed
    
    // Rack 3: Pocket ball 9 (1 point)
    game = engine.handlePocketBall(game, 9);
    expect(game.players[0].score).toBe(1); // Only current rack score, not accumulated
  });
});