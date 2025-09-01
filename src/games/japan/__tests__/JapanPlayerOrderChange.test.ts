import { describe, it, expect } from 'vitest';
import { JapanEngine } from '../JapanEngine';

describe('Japan Game Player Order Change Integration', () => {
  it('should integrate with player order calculator and update game state correctly', () => {
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
      orderChangeInterval: 10,
      orderChangeEnabled: true,
      multipliersEnabled: false
    };
    
    let game = engine.initializeGame(playerSetups, japanSettings);
    
    // Original order: player-1, player-2, player-3 (auto-generated IDs)
    expect(game.players[0].id).toBe('player-1');
    expect(game.players[1].id).toBe('player-2');
    expect(game.players[2].id).toBe('player-3');
    
    // Select player-2 as first player - should result in: player-2, player-1, player-3 (B→A→C)
    game = engine.handleCustomAction(game, 'playerOrderChange', { selectedPlayerId: 'player-2' });
    
    expect(game.players[0].id).toBe('player-2'); // Selected player first
    expect(game.players[1].id).toBe('player-1'); // Counter-clockwise arrangement
    expect(game.players[2].id).toBe('player-3');
    
    // First player should be active
    expect(game.players[0].isActive).toBe(true);
    expect(game.players[1].isActive).toBe(false);
    expect(game.players[2].isActive).toBe(false);
    expect(game.currentPlayerIndex).toBe(0);
  });

  it('should update player order history correctly', () => {
    const engine = new JapanEngine();
    
    const japanSettings = {
      handicapBalls: [5, 9],
      multipliers: [{ label: 'x2', value: 2 }],
      orderChangeInterval: 10,
      orderChangeEnabled: true,
      multipliersEnabled: false
    };
    
    let game = engine.initializeGame([
      { name: 'Player A' },
      { name: 'Player B' },
      { name: 'Player C' }
    ], japanSettings);
    
    // Set current rack to 10 to trigger order change
    game.currentRack = 10;
    
    // Perform order change
    game = engine.handleCustomAction(game, 'playerOrderChange', { selectedPlayerId: 'player-2' });
    
    // Check that player order history was updated
    expect(game.japanPlayerOrderHistory).toBeDefined();
    expect(game.japanPlayerOrderHistory!.length).toBeGreaterThanOrEqual(1);
    
    // Find the order history entry for the current period
    const orderHistory = game.japanPlayerOrderHistory!.find(h => h.fromRack === 11);
    expect(orderHistory).toBeDefined();
    expect(orderHistory!.fromRack).toBe(11); // Next rack after order change
    expect(orderHistory!.toRack).toBe(20); // Until next order change interval
    expect(orderHistory!.playerOrder).toEqual(['player-2', 'player-1', 'player-3']);
  });
  
  it('should handle 4+ players through integration', () => {
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
      orderChangeInterval: 10,
      orderChangeEnabled: true,
      multipliersEnabled: false
    };
    
    let game = engine.initializeGame(playerSetups, japanSettings);
    
    // Original order: player-1, player-2, player-3, player-4
    const originalOrder = game.players.map(p => p.id);
    expect(originalOrder).toEqual(['player-1', 'player-2', 'player-3', 'player-4']);
    
    // Select player-2 as first player
    game = engine.handleCustomAction(game, 'playerOrderChange', { selectedPlayerId: 'player-2' });
    
    // New order should start with player-2
    expect(game.players[0].id).toBe('player-2');
    
    // All players should still be present
    const newOrderIds = game.players.map(p => p.id).sort();
    const expectedIds = ['player-1', 'player-2', 'player-3', 'player-4'];
    expect(newOrderIds).toEqual(expectedIds);
    
    // First player should be active
    expect(game.players[0].isActive).toBe(true);
    expect(game.currentPlayerIndex).toBe(0);
  });
  
  it('should check shouldShowOrderChangeDialog correctly', () => {
    const engine = new JapanEngine();
    
    const playerSetups = [
      { name: 'Player A' },
      { name: 'Player B' },
      { name: 'Player C' }
    ];
    
    const japanSettings = {
      handicapBalls: [5, 9],
      multipliers: [{ label: 'x2', value: 2 }],
      orderChangeInterval: 10,
      orderChangeEnabled: true,
      multipliersEnabled: false
    };
    
    const game = engine.initializeGame(playerSetups, japanSettings);
    
    // Should not show at rack 1
    game.currentRack = 1;
    expect(engine.shouldShowOrderChangeDialog(game)).toBe(false);
    
    // Should not show at rack 5
    game.currentRack = 5;
    expect(engine.shouldShowOrderChangeDialog(game)).toBe(false);
    
    // Should show at rack 10 (orderChangeInterval)
    game.currentRack = 10;
    expect(engine.shouldShowOrderChangeDialog(game)).toBe(true);
    
    // Should show at rack 20 (2x orderChangeInterval)
    game.currentRack = 20;
    expect(engine.shouldShowOrderChangeDialog(game)).toBe(true);
    
    // Should not show with 2 players
    game.players = game.players.slice(0, 2); // Keep only 2 players
    expect(engine.shouldShowOrderChangeDialog(game)).toBe(false);
  });
  
  it('should not change order for 2 players', () => {
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
    
    // Original order: player-1, player-2
    const originalOrder = game.players.map(p => p.id);
    expect(originalOrder).toEqual(['player-1', 'player-2']);
    
    // Try to change order (should have no effect)
    game = engine.handleCustomAction(game, 'playerOrderChange', { selectedPlayerId: 'player-2' });
    
    // Order should remain the same
    const newOrder = game.players.map(p => p.id);
    expect(newOrder).toEqual(originalOrder);
  });
});