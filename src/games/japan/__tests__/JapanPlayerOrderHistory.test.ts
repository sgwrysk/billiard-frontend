import { describe, it, expect } from 'vitest';
import { JapanEngine } from '../JapanEngine';

describe('Japan Game Player Order History', () => {
  it('should maintain player order history correctly during order changes', () => {
    const engine = new JapanEngine();
    
    // Create a game with 3 players: A, B, C
    const playerSetups = [
      { name: 'Player A' },
      { name: 'Player B' },
      { name: 'Player C' }
    ];
    
    const japanSettings = {
      handicapBalls: [5, 9],
      multipliers: [{ label: 'x2', value: 2 }],
      deductionEnabled: false,
      deductions: [],
      orderChangeInterval: 5, // Use smaller interval for testing
      orderChangeEnabled: true,
      multipliersEnabled: false
    };
    
    let game = engine.initializeGame(playerSetups, japanSettings);
    
    // Initial state should have first period order history
    expect(game.japanPlayerOrderHistory).toBeDefined();
    expect(game.japanPlayerOrderHistory!.length).toBe(1);
    expect(game.japanPlayerOrderHistory![0]).toEqual({
      fromRack: 1,
      toRack: 5,
      playerOrder: ['player-1', 'player-2', 'player-3']
    });
    
    // Simulate playing to rack 5
    game = { ...game, currentRack: 5 };
    
    // Perform order change at rack 5 (select player-2)
    game = engine.handleCustomAction(game, 'playerOrderChange', { selectedPlayerId: 'player-2' });
    
    // Check that new period was added to history
    expect(game.japanPlayerOrderHistory!.length).toBe(2);
    
    // First period should remain unchanged
    expect(game.japanPlayerOrderHistory![0]).toEqual({
      fromRack: 1,
      toRack: 5,
      playerOrder: ['player-1', 'player-2', 'player-3']
    });
    
    // Second period should have new order (player-2 first, then reverse order of others)
    expect(game.japanPlayerOrderHistory![1]).toEqual({
      fromRack: 6,
      toRack: 10,
      playerOrder: ['player-2', 'player-3', 'player-1']
    });
    
    // Current game player order should match new period
    expect(game.players[0].id).toBe('player-2');
    expect(game.players[1].id).toBe('player-3');
    expect(game.players[2].id).toBe('player-1');
  });
  
  it('should handle multiple order changes correctly', () => {
    const engine = new JapanEngine();
    
    // Create a game with 4 players
    const playerSetups = [
      { name: 'Player A' },
      { name: 'Player B' },
      { name: 'Player C' },
      { name: 'Player D' }
    ];
    
    const japanSettings = {
      handicapBalls: [5, 9],
      multipliers: [{ label: 'x2', value: 2 }],
      deductionEnabled: false,
      deductions: [],
      orderChangeInterval: 3, // Use smaller interval for testing
      orderChangeEnabled: true,
      multipliersEnabled: false
    };
    
    let game = engine.initializeGame(playerSetups, japanSettings);
    
    // First order change at rack 3
    game = { ...game, currentRack: 3 };
    game = engine.handleCustomAction(game, 'playerOrderChange', { selectedPlayerId: 'player-2' });
    
    // Second order change at rack 6
    game = { ...game, currentRack: 6 };
    game = engine.handleCustomAction(game, 'playerOrderChange', { selectedPlayerId: 'player-4' });
    
    // Should have 3 periods in history
    expect(game.japanPlayerOrderHistory!.length).toBe(3);
    
    // Check all periods
    expect(game.japanPlayerOrderHistory![0]).toEqual({
      fromRack: 1,
      toRack: 3,
      playerOrder: ['player-1', 'player-2', 'player-3', 'player-4']
    });
    
    expect(game.japanPlayerOrderHistory![1].fromRack).toBe(4);
    expect(game.japanPlayerOrderHistory![1].toRack).toBe(6);
    expect(game.japanPlayerOrderHistory![1].playerOrder[0]).toBe('player-2'); // Selected player first
    
    expect(game.japanPlayerOrderHistory![2].fromRack).toBe(7);
    expect(game.japanPlayerOrderHistory![2].toRack).toBe(9);
    expect(game.japanPlayerOrderHistory![2].playerOrder[0]).toBe('player-4'); // Selected player first
  });
  
  it('should return correct player order for specific rack periods', () => {
    const engine = new JapanEngine();
    
    const playerSetups = [
      { name: 'Player A' },
      { name: 'Player B' },
      { name: 'Player C' }
    ];
    
    const japanSettings = {
      handicapBalls: [5, 9],
      multipliers: [{ label: 'x2', value: 2 }],
      deductionEnabled: false,
      deductions: [],
      orderChangeInterval: 5,
      orderChangeEnabled: true,
      multipliersEnabled: false
    };
    
    let game = engine.initializeGame(playerSetups, japanSettings);
    
    // Perform order change at rack 5
    game = { ...game, currentRack: 5 };
    game = engine.handleCustomAction(game, 'playerOrderChange', { selectedPlayerId: 'player-3' });
    
    // Test function to get player order (simulating JapanGameScreen logic)
    const getPlayerOrderForRackPeriod = (startRack: number, endRack: number): string[] => {
      if (!game.japanPlayerOrderHistory) {
        return game.players.map(p => p.id);
      }

      const orderHistory = game.japanPlayerOrderHistory.find(history => 
        startRack >= history.fromRack && endRack <= history.toRack
      );

      return orderHistory ? orderHistory.playerOrder : game.players.map(p => p.id);
    };
    
    // First table (racks 1-5) should use original order
    const firstTableOrder = getPlayerOrderForRackPeriod(1, 5);
    expect(firstTableOrder).toEqual(['player-1', 'player-2', 'player-3']);
    
    // Second table (racks 6-10) should use new order (player-3 first, then reverse order of others)
    const secondTableOrder = getPlayerOrderForRackPeriod(6, 10);
    expect(secondTableOrder).toEqual(['player-3', 'player-2', 'player-1']);
  });
});