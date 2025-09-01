import { describe, it, expect } from 'vitest';
import { JapanEngine } from '../JapanEngine';
import { JapanScoreCalculator } from '../JapanScoreCalculator';

describe('Japan Game Cumulative Points Table', () => {
  it('should calculate cumulative points correctly after multiple racks', () => {
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
    
    // Rack 1: Player A gets 3 points, Player B gets 1 point
    game = engine.handlePocketBall(game, 5); // Player A: 1 point
    game = engine.handleSwitchPlayer(game);
    game = engine.handlePocketBall(game, 9); // Player B: 1 point  
    game = engine.handleSwitchPlayer(game);
    game = engine.handlePocketBall(game, 5); // Player A: 1 more point (total: 2)
    game = engine.handlePocketBall(game, 9); // Player A: 1 more point (total: 3)
    
    expect(game.players[0].score).toBe(3); // Player A current rack score
    expect(game.players[1].score).toBe(1); // Player B current rack score
    
    // Move to Rack 2
    game = engine.handleNextRack(game);
    
    expect(game.currentRack).toBe(2);
    expect(game.players[0].score).toBe(0); // Player A score reset for new rack
    expect(game.players[1].score).toBe(0); // Player B score reset for new rack
    
    // Verify rack history was created correctly
    expect(game.japanRackHistory).toBeDefined();
    expect(game.japanRackHistory?.length).toBe(1);
    
    const rack1Result = game.japanRackHistory?.[0];
    expect(rack1Result?.rackNumber).toBe(1);
    
    // Check that the totalPoints in rack history are correct
    const player1Rack1 = rack1Result?.playerResults.find(pr => pr.playerId === 'player-1');
    const player2Rack1 = rack1Result?.playerResults.find(pr => pr.playerId === 'player-2');
    
    console.log('Rack 1 results:', {
      player1: player1Rack1,
      player2: player2Rack1
    });
    
    // In Japan Game, deltaPoints are calculated with redistribution system
    // Player A earned 3, gets 3 from Player B, gives 1 to Player B → delta = +2
    // Player B earned 1, gets 1 from Player A, gives 3 to Player A → delta = -2
    expect(player1Rack1?.earnedPoints).toBe(3);
    expect(player2Rack1?.earnedPoints).toBe(1);
    expect(player1Rack1?.deltaPoints).toBe(2); // 3 received - 1 given = +2
    expect(player2Rack1?.deltaPoints).toBe(-2); // 1 received - 3 given = -2
    expect(player1Rack1?.totalPoints).toBe(2); // 0 (previous) + 2 (delta) = 2
    expect(player2Rack1?.totalPoints).toBe(-2); // 0 (previous) + (-2) (delta) = -2
    
    // Rack 2: Player A gets 2 points, Player B gets 3 points
    game = engine.handlePocketBall(game, 5); // Player A: 1 point
    game = engine.handlePocketBall(game, 9); // Player A: 1 more point (total: 2 for this rack)
    game = engine.handleSwitchPlayer(game);
    game = engine.handlePocketBall(game, 5); // Player B: 1 point
    game = engine.handlePocketBall(game, 9); // Player B: 1 more point
    game = engine.handlePocketBall(game, 5); // Player B: 1 more point (total: 3 for this rack)
    
    expect(game.players[0].score).toBe(2); // Player A current rack score
    expect(game.players[1].score).toBe(3); // Player B current rack score
    
    // Move to Rack 3
    game = engine.handleNextRack(game);
    
    expect(game.currentRack).toBe(3);
    expect(game.players[0].score).toBe(0); // Player A score reset for new rack
    expect(game.players[1].score).toBe(0); // Player B score reset for new rack
    
    // Verify rack 2 history was created correctly
    expect(game.japanRackHistory?.length).toBe(2);
    
    const rack2Result = game.japanRackHistory?.[1];
    expect(rack2Result?.rackNumber).toBe(2);
    
    const player1Rack2 = rack2Result?.playerResults.find(pr => pr.playerId === 'player-1');
    const player2Rack2 = rack2Result?.playerResults.find(pr => pr.playerId === 'player-2');
    
    console.log('Rack 2 results:', {
      player1: player1Rack2,
      player2: player2Rack2
    });
    
    // In Rack 2, deltaPoints calculation: 
    // Player A earned 2, gets 2 from Player B, gives 3 to Player B → delta = -1
    // Player B earned 3, gets 3 from Player A, gives 2 to Player A → delta = +1
    expect(player1Rack2?.earnedPoints).toBe(2);
    expect(player2Rack2?.earnedPoints).toBe(3);
    expect(player1Rack2?.deltaPoints).toBe(-1); // 2 received - 3 given = -1
    expect(player2Rack2?.deltaPoints).toBe(1); // 3 received - 2 given = +1
    expect(player1Rack2?.totalPoints).toBe(1); // 2 (from rack 1) + (-1) (delta) = 1
    expect(player2Rack2?.totalPoints).toBe(-1); // -2 (from rack 1) + 1 (delta) = -1
  });

  it('should show correct values in cumulative table during current rack', () => {
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
    
    // Rack 1: Player A gets 2 points
    game = engine.handlePocketBall(game, 5); // 1 point
    game = engine.handlePocketBall(game, 9); // 1 point
    
    // Move to Rack 2
    game = engine.handleNextRack(game);
    
    // In Rack 2, before any points are earned
    // The cumulative table should show totalPoints from previous rack (Rack 1)
    // For current rack (Rack 2), it should show the points from completed racks only
    
    const rack1Result = game.japanRackHistory?.[0];
    const player1Rack1 = rack1Result?.playerResults.find(pr => pr.playerId === 'player-1');
    
    // The cumulative table for current rack should show previous rack's totalPoints
    expect(player1Rack1?.totalPoints).toBe(2);
    
    // Now earn some points in Rack 2
    game = engine.handlePocketBall(game, 5); // Player A: 1 point in current rack
    
    // The current rack display should NOT add this to the cumulative table yet
    // The cumulative table should still show only completed rack totals
    expect(game.players[0].score).toBe(1); // Current rack score
    
    // The getPreviousRackTotalPoints should return points from completed racks only
    const previousTotal = JapanScoreCalculator.getPreviousRackTotalPoints(game, 'player-1');
    expect(previousTotal).toBe(2); // Should be total from Rack 1, not including current rack points
  });
});