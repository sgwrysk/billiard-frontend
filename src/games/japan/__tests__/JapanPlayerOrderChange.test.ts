import { describe, it, expect } from 'vitest';
import { JapanEngine } from '../JapanEngine';

describe('Japan Game Player Order Change', () => {
  it('should handle 3-player order change correctly', () => {
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
      orderChangeInterval: 10,
      orderChangeEnabled: true,
      multipliersEnabled: false
    };
    
    let game = engine.initializeGame(playerSetups, japanSettings);
    
    // Original order: player-1, player-2, player-3 (auto-generated IDs)
    expect(game.players[0].id).toBe('player-1');
    expect(game.players[1].id).toBe('player-2');
    expect(game.players[2].id).toBe('player-3');
    
    // Select player-2 as first player - should result in: player-2, player-3, player-1 (reverse order of remaining)
    game = engine.handleCustomAction(game, 'playerOrderChange', { selectedPlayerId: 'player-2' });
    
    expect(game.players[0].id).toBe('player-2'); // Selected player first
    expect(game.players[1].id).toBe('player-3'); // Remaining players in reverse order
    expect(game.players[2].id).toBe('player-1');
    
    // First player should be active
    expect(game.players[0].isActive).toBe(true);
    expect(game.players[1].isActive).toBe(false);
    expect(game.players[2].isActive).toBe(false);
    expect(game.currentPlayerIndex).toBe(0);
  });

  it('should handle all 3-player order change patterns correctly', () => {
    const engine = new JapanEngine();
    
    const japanSettings = {
      handicapBalls: [5, 9],
      multipliers: [{ label: 'x2', value: 2 }],
      deductionEnabled: false,
      deductions: [],
      orderChangeInterval: 10,
      orderChangeEnabled: false,
      multipliersEnabled: false
    };
    
    // Test case 1: A→B→C (select A) → A→C→B
    let game1 = engine.initializeGame([
      { name: 'Player A' },
      { name: 'Player B' },
      { name: 'Player C' }
    ], japanSettings);
    
    game1 = engine.handleCustomAction(game1, 'playerOrderChange', { selectedPlayerId: 'player-1' });
    expect(game1.players.map(p => p.id)).toEqual(['player-1', 'player-3', 'player-2']);
    
    // Test case 2: A→B→C (select B) → B→A→C  
    let game2 = engine.initializeGame([
      { name: 'Player A' },
      { name: 'Player B' },
      { name: 'Player C' }
    ], japanSettings);
    
    game2 = engine.handleCustomAction(game2, 'playerOrderChange', { selectedPlayerId: 'player-2' });
    expect(game2.players.map(p => p.id)).toEqual(['player-2', 'player-3', 'player-1']);
    
    // Test case 3: A→B→C (select C) → C→B→A
    let game3 = engine.initializeGame([
      { name: 'Player A' },
      { name: 'Player B' },
      { name: 'Player C' }
    ], japanSettings);
    
    game3 = engine.handleCustomAction(game3, 'playerOrderChange', { selectedPlayerId: 'player-3' });
    expect(game3.players.map(p => p.id)).toEqual(['player-3', 'player-2', 'player-1']);
  });
  
  it('should handle 4-player order change and avoid same cycle', () => {
    const engine = new JapanEngine();
    
    // Create a game with 4 players: A, B, C, D
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
    
    // Should not create same cycle as original
    const newOrder = game.players.map(p => p.id);
    
    // Create cycle maps for comparison
    const originalCycle = new Map();
    const newCycle = new Map();
    
    for (let i = 0; i < originalOrder.length; i++) {
      const nextIndex = (i + 1) % originalOrder.length;
      originalCycle.set(originalOrder[i], originalOrder[nextIndex]);
      newCycle.set(newOrder[i], newOrder[nextIndex]);
    }
    
    // Cycles should be different
    let cyclesSame = true;
    for (const [player, nextPlayer] of originalCycle) {
      if (newCycle.get(player) !== nextPlayer) {
        cyclesSame = false;
        break;
      }
    }
    
    expect(cyclesSame).toBe(false);
    
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
      deductionEnabled: false,
      deductions: [],
      orderChangeInterval: 10,
      orderChangeEnabled: true,
      multipliersEnabled: false
    };
    
    let game = engine.initializeGame(playerSetups, japanSettings);
    
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
      deductionEnabled: false,
      deductions: [],
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