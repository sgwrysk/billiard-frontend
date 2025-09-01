import { describe, it, expect } from 'vitest';
import { JapanScoreCalculator } from '../JapanScoreCalculator';
import type { Game, Shot } from '../../../types/index';
import { GameType, GameStatus } from '../../../types/index';
import type { JapanRackResult } from '../../../types/japan';

// Helper function to create a basic Japan game for testing
const createTestGame = (): Game => ({
  id: 'test-game',
  type: GameType.JAPAN,
  players: [
    { id: 'player-1', name: 'Player 1', score: 0, isActive: true, ballsPocketed: [] },
    { id: 'player-2', name: 'Player 2', score: 0, isActive: false, ballsPocketed: [] }
  ],
  currentPlayerIndex: 0,
  currentRack: 1,
  totalRacks: 1,
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
  japanCurrentMultiplier: 1,
  japanRackHistory: []
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

const createRackCompleteShot = (rackNumber: number): Shot => ({
  playerId: 'player-1',
  ballNumber: 0,
  isSunk: false,
  isFoul: false,
  timestamp: new Date(),
  customData: {
    type: 'rack_complete',
    rackNumber
  }
});

describe('JapanScoreCalculator', () => {
  describe('calculateCurrentRackResults', () => {
    it('should calculate basic rack results correctly', () => {
      const game = createTestGame();
      
      // Add some ball clicks in current rack
      game.shotHistory = [
        createBallClickShot('player-1', 5, 5),
        createBallClickShot('player-1', 9, 9),
        createBallClickShot('player-2', 1, 1)
      ];
      
      const result = JapanScoreCalculator.calculateCurrentRackResults(game);
      
      expect(result.rackNumber).toBe(1);
      expect(result.playerResults).toHaveLength(2);
      
      // Player 1: earned 14 points (5+9), receives 14 from player 2, gives 1 to player 2 = +13
      const player1Result = result.playerResults.find(r => r.playerId === 'player-1')!;
      expect(player1Result.earnedPoints).toBe(14);
      expect(player1Result.deltaPoints).toBe(13);
      expect(player1Result.totalPoints).toBe(13);
      
      // Player 2: earned 1 point, receives 1 from player 1, gives 14 to player 1 = -13  
      const player2Result = result.playerResults.find(r => r.playerId === 'player-2')!;
      expect(player2Result.earnedPoints).toBe(1);
      expect(player2Result.deltaPoints).toBe(-13);
      expect(player2Result.totalPoints).toBe(-13);
    });

    it('should apply multiplier correctly', () => {
      const game = createTestGame();
      game.japanCurrentMultiplier = 2;
      
      game.shotHistory = [
        createBallClickShot('player-1', 5, 5)
      ];
      
      const result = JapanScoreCalculator.calculateCurrentRackResults(game);
      
      const player1Result = result.playerResults.find(r => r.playerId === 'player-1')!;
      expect(player1Result.earnedPoints).toBe(10); // 5 * 2
    });

    it('should only count shots from current rack', () => {
      const game = createTestGame();
      
      // Previous rack shots
      game.shotHistory = [
        createBallClickShot('player-1', 5, 5),
        createRackCompleteShot(1),
        // Current rack shots
        createBallClickShot('player-2', 9, 9)
      ];
      game.currentRack = 2;
      
      const result = JapanScoreCalculator.calculateCurrentRackResults(game);
      
      // Should only count the shot after rack complete
      const player1Result = result.playerResults.find(r => r.playerId === 'player-1')!;
      const player2Result = result.playerResults.find(r => r.playerId === 'player-2')!;
      
      expect(player1Result.earnedPoints).toBe(0);
      expect(player2Result.earnedPoints).toBe(9);
    });

    it('should handle three players correctly', () => {
      const game = createTestGame();
      game.players.push({ id: 'player-3', name: 'Player 3', score: 0, isActive: false, ballsPocketed: [] });
      
      game.shotHistory = [
        createBallClickShot('player-1', 5, 5),
        createBallClickShot('player-2', 9, 9),
        createBallClickShot('player-3', 1, 1)
      ];
      
      const result = JapanScoreCalculator.calculateCurrentRackResults(game);
      
      expect(result.playerResults).toHaveLength(3);
      
      // Player 1: earned 5, receives 5*2=10, gives (9+1)=10, delta = 0
      const player1Result = result.playerResults.find(r => r.playerId === 'player-1')!;
      expect(player1Result.earnedPoints).toBe(5);
      expect(player1Result.deltaPoints).toBe(0);
      
      // Player 2: earned 9, receives 9*2=18, gives (5+1)=6, delta = +12  
      const player2Result = result.playerResults.find(r => r.playerId === 'player-2')!;
      expect(player2Result.earnedPoints).toBe(9);
      expect(player2Result.deltaPoints).toBe(12);
      
      // Player 3: earned 1, receives 1*2=2, gives (5+9)=14, delta = -12
      const player3Result = result.playerResults.find(r => r.playerId === 'player-3')!;
      expect(player3Result.earnedPoints).toBe(1);
      expect(player3Result.deltaPoints).toBe(-12);
    });
  });

  describe('getPreviousRackTotalPoints', () => {
    it('should return 0 when no rack history exists', () => {
      const game = createTestGame();
      
      const points = JapanScoreCalculator.getPreviousRackTotalPoints(game, 'player-1');
      
      expect(points).toBe(0);
    });

    it('should return points from latest rack history', () => {
      const game = createTestGame();
      
      const mockRackResult: JapanRackResult = {
        rackNumber: 1,
        playerResults: [
          { playerId: 'player-1', earnedPoints: 10, deltaPoints: 5, totalPoints: 15 },
          { playerId: 'player-2', earnedPoints: 5, deltaPoints: -5, totalPoints: -5 }
        ]
      };
      
      game.japanRackHistory = [mockRackResult];
      
      const player1Points = JapanScoreCalculator.getPreviousRackTotalPoints(game, 'player-1');
      const player2Points = JapanScoreCalculator.getPreviousRackTotalPoints(game, 'player-2');
      
      expect(player1Points).toBe(15);
      expect(player2Points).toBe(-5);
    });

    it('should return 0 for non-existent player', () => {
      const game = createTestGame();
      
      const mockRackResult: JapanRackResult = {
        rackNumber: 1,
        playerResults: [
          { playerId: 'player-1', earnedPoints: 10, deltaPoints: 5, totalPoints: 15 }
        ]
      };
      
      game.japanRackHistory = [mockRackResult];
      
      const points = JapanScoreCalculator.getPreviousRackTotalPoints(game, 'non-existent-player');
      
      expect(points).toBe(0);
    });
  });

  describe('getCurrentRackPoints', () => {
    it('should calculate current rack points correctly', () => {
      const game = createTestGame();
      
      game.shotHistory = [
        createBallClickShot('player-1', 5, 5),
        createBallClickShot('player-1', 9, 9),
        createBallClickShot('player-2', 1, 1)
      ];
      
      const player1Points = JapanScoreCalculator.getCurrentRackPoints(game, 'player-1');
      const player2Points = JapanScoreCalculator.getCurrentRackPoints(game, 'player-2');
      
      expect(player1Points).toBe(14); // 5 + 9
      expect(player2Points).toBe(1);
    });

    it('should apply multiplier correctly', () => {
      const game = createTestGame();
      game.japanCurrentMultiplier = 3;
      
      game.shotHistory = [
        createBallClickShot('player-1', 5, 5)
      ];
      
      const points = JapanScoreCalculator.getCurrentRackPoints(game, 'player-1');
      
      expect(points).toBe(15); // 5 * 3
    });

    it('should only count shots after last rack complete', () => {
      const game = createTestGame();
      
      game.shotHistory = [
        createBallClickShot('player-1', 5, 5),
        createRackCompleteShot(1),
        createBallClickShot('player-1', 9, 9),
        createBallClickShot('player-1', 1, 1)
      ];
      
      const points = JapanScoreCalculator.getCurrentRackPoints(game, 'player-1');
      
      expect(points).toBe(10); // Only 9 + 1 from after rack complete
    });

    it('should return 0 for player with no current rack shots', () => {
      const game = createTestGame();
      
      game.shotHistory = [
        createBallClickShot('player-1', 5, 5)
      ];
      
      const points = JapanScoreCalculator.getCurrentRackPoints(game, 'player-2');
      
      expect(points).toBe(0);
    });
  });
});