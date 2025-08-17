import { describe, it, expect, beforeEach } from 'vitest';
import { BowlardEngine } from '../BowlardEngine';
import { GameType, GameStatus } from '../../../types/index';
import type { Game } from '../../../types/index';

describe('BowlardEngine', () => {
  let engine: BowlardEngine;
  let mockGame: Game;

  beforeEach(() => {
    engine = new BowlardEngine();
    mockGame = {
      id: 'test-game',
      type: GameType.BOWLARD,
      status: GameStatus.IN_PROGRESS,
      players: engine.initializePlayers([{ name: 'Test Player' }]),
      currentPlayerIndex: 0,
      startTime: new Date(),
      totalRacks: 1,
      currentRack: 1,
      rackInProgress: false,
      shotHistory: [],
      scoreHistory: [],
    };
  });

  describe('handleCustomAction - ADD_PINS', () => {
    it('should handle simple frame correctly', () => {
      // First roll: 3 pins
      let updatedGame = engine.handleCustomAction(mockGame, 'ADD_PINS', { pins: 3 });
      expect(updatedGame.players[0].bowlingFrames![0].rolls).toEqual([3]);
      expect(updatedGame.players[0].bowlingFrames![0].isComplete).toBe(false);

      // Second roll: 4 pins
      updatedGame = engine.handleCustomAction(updatedGame, 'ADD_PINS', { pins: 4 });
      expect(updatedGame.players[0].bowlingFrames![0].rolls).toEqual([3, 4]);
      expect(updatedGame.players[0].bowlingFrames![0].isComplete).toBe(true);
      expect(updatedGame.players[0].bowlingFrames![0].score).toBe(7);
    });

    it('should handle strike correctly', () => {
      // Strike
      const updatedGame = engine.handleCustomAction(mockGame, 'ADD_PINS', { pins: 10 });
      expect(updatedGame.players[0].bowlingFrames![0].rolls).toEqual([10]);
      expect(updatedGame.players[0].bowlingFrames![0].isStrike).toBe(true);
      expect(updatedGame.players[0].bowlingFrames![0].isComplete).toBe(true);
    });

    it('should handle spare correctly', () => {
      // First roll: 7 pins
      let updatedGame = engine.handleCustomAction(mockGame, 'ADD_PINS', { pins: 7 });
      expect(updatedGame.players[0].bowlingFrames![0].rolls).toEqual([7]);
      expect(updatedGame.players[0].bowlingFrames![0].isComplete).toBe(false);

      // Second roll: 3 pins (spare)
      updatedGame = engine.handleCustomAction(updatedGame, 'ADD_PINS', { pins: 3 });
      expect(updatedGame.players[0].bowlingFrames![0].rolls).toEqual([7, 3]);
      expect(updatedGame.players[0].bowlingFrames![0].isSpare).toBe(true);
      expect(updatedGame.players[0].bowlingFrames![0].isComplete).toBe(true);
    });

    it('should calculate 9th frame strike with 10th frame spare bonus correctly', () => {
      // Fill frames 1-8 with simple scores
      let currentGame = mockGame;
      for (let frame = 0; frame < 8; frame++) {
        currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 3 });
        currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 4 });
      }

      // Frame 9: Strike
      currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 10 });
      
      // Frame 10: 3, 7 (spare), 5
      currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 3 });
      currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 7 });
      currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 5 });

      const frames = currentGame.players[0].bowlingFrames!;
      
      // Frame 9 should be: 10 (strike) + 3 + 7 (next two rolls) = 20
      // Frame 9 cumulative score should be: 8 * 7 + 20 = 76
      expect(frames[8].score).toBe(76);
      
      // Frame 10 should be: previous score + 15 (3 + 7 + 5) = 91
      expect(frames[9].score).toBe(91);
      
      // Total score should be 91
      expect(currentGame.players[0].score).toBe(91);
    });

    it('should handle 10th frame strike correctly', () => {
      // Fill frames 1-9 with simple scores
      let currentGame = mockGame;
      for (let frame = 0; frame < 9; frame++) {
        currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 3 });
        currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 4 });
      }

      // Frame 10: Strike, 5, 3
      currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 10 });
      expect(currentGame.players[0].bowlingFrames![9].isComplete).toBe(false);
      
      currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 5 });
      expect(currentGame.players[0].bowlingFrames![9].isComplete).toBe(false);
      
      currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 3 });
      expect(currentGame.players[0].bowlingFrames![9].isComplete).toBe(true);
      expect(currentGame.players[0].bowlingFrames![9].rolls).toEqual([10, 5, 3]);
      
      // Frame 10 should be: previous score + 18 (10 + 5 + 3)
      expect(currentGame.players[0].bowlingFrames![9].score).toBe(9 * 7 + 18); // 63 + 18 = 81
    });

    it('should handle 10th frame spare correctly', () => {
      // Fill frames 1-9 with simple scores
      let currentGame = mockGame;
      for (let frame = 0; frame < 9; frame++) {
        currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 3 });
        currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 4 });
      }

      // Frame 10: 3, 7 (spare), 5
      currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 3 });
      expect(currentGame.players[0].bowlingFrames![9].isComplete).toBe(false);
      
      currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 7 });
      expect(currentGame.players[0].bowlingFrames![9].isSpare).toBe(true);
      expect(currentGame.players[0].bowlingFrames![9].isComplete).toBe(false);
      
      currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 5 });
      expect(currentGame.players[0].bowlingFrames![9].isComplete).toBe(true);
      expect(currentGame.players[0].bowlingFrames![9].rolls).toEqual([3, 7, 5]);
      
      // Frame 10 should be: previous score + 15 (3 + 7 + 5)
      expect(currentGame.players[0].bowlingFrames![9].score).toBe(9 * 7 + 15); // 63 + 15 = 78
    });

    it('should handle 10th frame no bonus correctly', () => {
      // Fill frames 1-9 with simple scores
      let currentGame = mockGame;
      for (let frame = 0; frame < 9; frame++) {
        currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 3 });
        currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 4 });
      }

      // Frame 10: 5, 3 (no strike, no spare)
      currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 5 });
      expect(currentGame.players[0].bowlingFrames![9].isComplete).toBe(false);
      
      currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 3 });
      expect(currentGame.players[0].bowlingFrames![9].isComplete).toBe(true);
      expect(currentGame.players[0].bowlingFrames![9].rolls).toEqual([5, 3]);
      
      // Frame 10 should be: previous score + 8 (5 + 3)
      expect(currentGame.players[0].bowlingFrames![9].score).toBe(9 * 7 + 8); // 63 + 8 = 71
    });
  });

  describe('checkVictoryCondition', () => {
    it('should return game over when 10th frame is complete', () => {
      // Complete all 10 frames
      let currentGame = mockGame;
      for (let frame = 0; frame < 9; frame++) {
        currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 3 });
        currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 4 });
      }
      
      // 10th frame: no bonus
      currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 5 });
      currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 3 });

      const result = engine.checkVictoryCondition(currentGame);
      expect(result.isGameOver).toBe(true);
      expect(result.winnerId).toBe(currentGame.players[0].id);
    });

    it('should not return game over when 10th frame is incomplete', () => {
      // Complete frames 1-9
      let currentGame = mockGame;
      for (let frame = 0; frame < 9; frame++) {
        currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 3 });
        currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 4 });
      }
      
      // 10th frame: only first roll
      currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 5 });

      const result = engine.checkVictoryCondition(currentGame);
      expect(result.isGameOver).toBe(false);
    });
  });

  describe('handleUndoBowlingRoll', () => {
    it('should undo last roll correctly', () => {
      // Add some rolls
      let currentGame = engine.handleCustomAction(mockGame, 'ADD_PINS', { pins: 3 });
      currentGame = engine.handleCustomAction(currentGame, 'ADD_PINS', { pins: 4 });
      
      expect(currentGame.players[0].bowlingFrames![0].rolls).toEqual([3, 4]);
      expect(currentGame.players[0].bowlingFrames![0].isComplete).toBe(true);
      
      // Undo last roll
      const undoGame = engine.handleCustomAction(currentGame, 'UNDO_BOWLING_ROLL', {});
      
      expect(undoGame.players[0].bowlingFrames![0].rolls).toEqual([3]);
      expect(undoGame.players[0].bowlingFrames![0].isComplete).toBe(false);
    });
  });
});
