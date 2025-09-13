import { describe, it, expect } from 'vitest';
import { JapanUndoHandler } from '../JapanUndoHandler';
import type { Game, Shot } from '../../../types/index';
import { GameType, GameStatus } from '../../../types/index';

// Helper function to create a basic Japan game for testing
const createTestGame = (): Game => ({
  id: 'test-game',
  type: GameType.JAPAN,
  players: [
    { id: 'player-1', name: 'Player 1', score: 10, isActive: true, ballsPocketed: [5, 9] },
    { id: 'player-2', name: 'Player 2', score: 5, isActive: false, ballsPocketed: [1] }
  ],
  currentPlayerIndex: 0,
  currentRack: 2,
  totalRacks: 2,
  rackInProgress: false,
  shotHistory: [],
  scoreHistory: [],
  status: GameStatus.IN_PROGRESS,
  startTime: new Date(),
  japanSettings: {
    handicapBalls: [5, 9],
    orderChangeInterval: 10,
    orderChangeEnabled: true
  },
  japanCurrentMultiplier: 2,
  japanRackHistory: [
    {
      rackNumber: 1,
      playerResults: [
        { playerId: 'player-1', earnedPoints: 10, deltaPoints: 5, totalPoints: 15 },
        { playerId: 'player-2', earnedPoints: 5, deltaPoints: -5, totalPoints: -5 }
      ]
    }
  ]
});

const createBallClickShot = (playerId: string, ballNumber: number, points: number): Shot => ({
  playerId,
  ballNumber,
  isSunk: true,
  isFoul: false,
  timestamp: new Date(),
  customData: {
    type: 'ball_click',
    points
  }
});

const createRackCompleteShot = (previousRack: number, previousMultiplier: number, previousPlayerStates: Array<{id: string; ballsPocketed: number[]; score: number}>): Shot => ({
  playerId: 'player-1',
  ballNumber: 0,
  isSunk: false,
  isFoul: false,
  timestamp: new Date(),
  customData: {
    type: 'rack_complete',
    previousRack,
    previousMultiplier,
    previousPlayerStates
  }
});

describe('JapanUndoHandler', () => {
  describe('handleUndo', () => {
    it('should return unchanged game when shot history is empty', () => {
      const game = createTestGame();
      game.shotHistory = [];
      
      const result = JapanUndoHandler.handleUndo(game);
      
      expect(result).toEqual(game);
    });

    it('should handle ball click undo correctly', () => {
      const game = createTestGame();
      const ballClickShot = createBallClickShot('player-1', 5, 5);
      game.shotHistory = [ballClickShot];
      
      const result = JapanUndoHandler.handleUndo(game);
      
      // Score should be reduced by the points
      expect(result.players[0].score).toBe(5); // 10 - 5
      expect(result.players[1].score).toBe(5); // unchanged
      
      // Ball should be removed from pocketed balls (most recent pocket)
      expect(result.players[0].ballsPocketed).toEqual([5]); // Last ball (9) removed from [5, 9]
      expect(result.players[1].ballsPocketed).toEqual([1]); // unchanged
      
      // Shot history should be shortened
      expect(result.shotHistory).toHaveLength(0);
    });

    it('should handle rack complete undo correctly', () => {
      const game = createTestGame();
      const previousPlayerStates = [
        { id: 'player-1', ballsPocketed: [1, 2], score: 3 },
        { id: 'player-2', ballsPocketed: [3], score: 1 }
      ];
      
      const rackCompleteShot = createRackCompleteShot(1, 1, previousPlayerStates);
      game.shotHistory = [rackCompleteShot];
      
      const result = JapanUndoHandler.handleUndo(game);
      
      // Rack should be restored to previous value
      expect(result.currentRack).toBe(1);
      
      // Multiplier should be restored
      expect(result.japanCurrentMultiplier).toBe(1);
      
      // Rack history should be shortened
      expect(result.japanRackHistory).toHaveLength(0);
      
      // Player states should be restored
      expect(result.players[0].ballsPocketed).toEqual([1, 2]);
      expect(result.players[0].score).toBe(3);
      expect(result.players[1].ballsPocketed).toEqual([3]);
      expect(result.players[1].score).toBe(1);
      
      // Shot history should be shortened
      expect(result.shotHistory).toHaveLength(0);
    });

    it('should handle rack complete undo with partial previous states', () => {
      const game = createTestGame();
      const previousPlayerStates = [
        { id: 'player-1', ballsPocketed: [1], score: 5 }
        // Missing player-2 state
      ];
      
      const rackCompleteShot = createRackCompleteShot(1, 1, previousPlayerStates);
      game.shotHistory = [rackCompleteShot];
      
      const result = JapanUndoHandler.handleUndo(game);
      
      // Player 1 should be restored
      expect(result.players[0].ballsPocketed).toEqual([1]);
      expect(result.players[0].score).toBe(5);
      
      // Player 2 should have empty balls but keep current score (fallback)
      expect(result.players[1].ballsPocketed).toEqual([]);
      expect(result.players[1].score).toBe(5); // Current score as fallback
    });

    it('should handle ball click undo with score not going below 0', () => {
      const game = createTestGame();
      game.players[0].score = 2; // Low score
      
      const ballClickShot = createBallClickShot('player-1', 5, 5); // More points than current score
      game.shotHistory = [ballClickShot];
      
      const result = JapanUndoHandler.handleUndo(game);
      
      // Score should not go below 0
      expect(result.players[0].score).toBe(0); // Math.max(0, 2 - 5)
    });

    it('should handle ball click undo and remove most recent ball', () => {
      const game = createTestGame();
      game.players[0].ballsPocketed = [1, 2]; // Different balls
      
      const ballClickShot = createBallClickShot('player-1', 5, 5); // Ball 5 not originally in list
      game.shotHistory = [ballClickShot];
      
      const result = JapanUndoHandler.handleUndo(game);
      
      // Most recent ball (last in array) should be removed
      expect(result.players[0].ballsPocketed).toEqual([1]); // Last ball (2) removed
      
      // Score should still be reduced
      expect(result.players[0].score).toBe(5); // 10 - 5
    });

    it('should handle ball click undo with duplicate balls (removes most recent ball)', () => {
      const game = createTestGame();
      game.players[0].ballsPocketed = [5, 1, 5, 9]; // Ball 5 appears twice
      
      const ballClickShot = createBallClickShot('player-1', 5, 5);
      game.shotHistory = [ballClickShot];
      
      const result = JapanUndoHandler.handleUndo(game);
      
      // Should remove the most recent ball (last in array)
      expect(result.players[0].ballsPocketed).toEqual([5, 1, 5]); // Last ball (9) removed
    });

    it('should handle ball click undo for different player', () => {
      const game = createTestGame();
      
      const ballClickShot = createBallClickShot('player-2', 1, 1);
      game.shotHistory = [ballClickShot];
      
      const result = JapanUndoHandler.handleUndo(game);
      
      // Player 1 should be unchanged
      expect(result.players[0].score).toBe(10);
      expect(result.players[0].ballsPocketed).toEqual([5, 9]);
      
      // Player 2 should have changes undone
      expect(result.players[1].score).toBe(4); // 5 - 1
      expect(result.players[1].ballsPocketed).toEqual([]); // Last ball removed
    });

    it('should handle unknown action type gracefully', () => {
      const game = createTestGame();
      
      const unknownShot: Shot = {
        playerId: 'player-1',
        ballNumber: 1,
        isSunk: true,
        isFoul: false,
        timestamp: new Date(),
        customData: {
          type: 'unknown_action'
        }
      };
      
      game.shotHistory = [unknownShot];
      
      const result = JapanUndoHandler.handleUndo(game);
      
      // Should only remove the shot from history
      expect(result.shotHistory).toHaveLength(0);
      
      // Game state should be otherwise unchanged
      expect(result.players[0].score).toBe(10);
      expect(result.players[1].score).toBe(5);
    });
  });
});