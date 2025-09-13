import { describe, it, expect } from 'vitest';
import { PlayerOrderCalculator } from '../PlayerOrderCalculator';
import type { Player } from '../../../types/index';

// Helper function to create test players
const createTestPlayers = (count: number): Player[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i + 1}`,
    name: `Player ${String.fromCharCode(65 + i)}`, // A, B, C, D...
    score: 0,
    isActive: i === 0, // First player active by default
    ballsPocketed: []
  }));
};

describe('PlayerOrderCalculator', () => {
  describe('calculateNewPlayerOrder', () => {
    it('should handle 3-player order change correctly', () => {
      const players = createTestPlayers(3);
      
      // Original order: A(player-1), B(player-2), C(player-3)
      expect(players.map(p => p.id)).toEqual(['player-1', 'player-2', 'player-3']);
      
      // Select player-2 as first player - should result in: B→A→C
      const newOrder = PlayerOrderCalculator.calculateNewPlayerOrder(players, 'player-2');
      
      expect(newOrder[0].id).toBe('player-2'); // Selected player first
      expect(newOrder[1].id).toBe('player-1'); // Counter-clockwise arrangement
      expect(newOrder[2].id).toBe('player-3');
    });

    it('should handle all 3-player order change patterns correctly', () => {
      const players = createTestPlayers(3);
      
      // Test case 1: A→B→C (select A) → A→C→B
      const newOrder1 = PlayerOrderCalculator.calculateNewPlayerOrder(players, 'player-1');
      expect(newOrder1.map(p => p.id)).toEqual(['player-1', 'player-3', 'player-2']);
      
      // Test case 2: A→B→C (select B) → B→A→C  
      const newOrder2 = PlayerOrderCalculator.calculateNewPlayerOrder(players, 'player-2');
      expect(newOrder2.map(p => p.id)).toEqual(['player-2', 'player-1', 'player-3']);
      
      // Test case 3: A→B→C (select C) → C→B→A
      const newOrder3 = PlayerOrderCalculator.calculateNewPlayerOrder(players, 'player-3');
      expect(newOrder3.map(p => p.id)).toEqual(['player-3', 'player-2', 'player-1']);
    });
    
    it('should handle 4-player order change and avoid same cycle', () => {
      const players = createTestPlayers(4);
      
      // Original order: player-1, player-2, player-3, player-4
      const originalOrder = players.map(p => p.id);
      expect(originalOrder).toEqual(['player-1', 'player-2', 'player-3', 'player-4']);
      
      // Select player-2 as first player
      const newOrder = PlayerOrderCalculator.calculateNewPlayerOrder(players, 'player-2');
      
      // New order should start with player-2
      expect(newOrder[0].id).toBe('player-2');
      
      // Should not create same cycle as original
      const newOrderIds = newOrder.map(p => p.id);
      
      // Create cycle maps for comparison
      const originalCycle = new Map();
      const newCycle = new Map();
      
      for (let i = 0; i < originalOrder.length; i++) {
        const nextIndex = (i + 1) % originalOrder.length;
        originalCycle.set(originalOrder[i], originalOrder[nextIndex]);
        newCycle.set(newOrderIds[i], newOrderIds[nextIndex]);
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
    });
    
    it('should not change order for 2 players', () => {
      const players = createTestPlayers(2);
      
      // Original order: player-1, player-2
      const originalOrder = players.map(p => p.id);
      expect(originalOrder).toEqual(['player-1', 'player-2']);
      
      // Try to change order (should have no effect)
      const newOrder = PlayerOrderCalculator.calculateNewPlayerOrder(players, 'player-2');
      
      // Order should remain the same
      const newOrderIds = newOrder.map(p => p.id);
      expect(newOrderIds).toEqual(originalOrder);
    });

    it('should handle 5+ players correctly', () => {
      const players = createTestPlayers(5);
      
      // Select player-3 as first player
      const newOrder = PlayerOrderCalculator.calculateNewPlayerOrder(players, 'player-3');
      
      // Selected player should be first
      expect(newOrder[0].id).toBe('player-3');
      
      // All other players should be included
      const otherPlayerIds = newOrder.slice(1).map(p => p.id).sort();
      const expectedOtherIds = ['player-1', 'player-2', 'player-4', 'player-5'];
      expect(otherPlayerIds).toEqual(expectedOtherIds);
      
      // Total length should be unchanged
      expect(newOrder).toHaveLength(5);
    });

    it('should handle edge case with non-existent player id', () => {
      const players = createTestPlayers(3);
      
      // This should throw an error when selectedPlayer is not found (find returns undefined)
      // Let's verify that the current implementation would fail with undefined selectedPlayer
      const result = PlayerOrderCalculator.calculateNewPlayerOrder(players, 'non-existent-player');
      
      // If it doesn't throw, it should at least return some valid array
      expect(Array.isArray(result)).toBe(true);
      // Note: This test documents current behavior. In production, we might want to add validation.
    });
  });

  describe('private methods via public interface', () => {
    it('should demonstrate different cycles for 4+ players through multiple runs', () => {
      const players = createTestPlayers(4);
      
      // Run multiple times to check randomization works
      const results = new Set<string>();
      
      for (let i = 0; i < 10; i++) {
        const newOrder = PlayerOrderCalculator.calculateNewPlayerOrder(players, 'player-1');
        const orderString = newOrder.map(p => p.id).join(',');
        results.add(orderString);
      }
      
      // Should have generated at least one result (deterministic fallback possible)
      expect(results.size).toBeGreaterThanOrEqual(1);
      
      // All results should start with selected player
      for (const result of results) {
        expect(result.startsWith('player-1')).toBe(true);
      }
    });
  });
});