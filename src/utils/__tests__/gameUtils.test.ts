import { describe, it, expect } from 'vitest';
import { isGameInProgress } from '../gameUtils';
import type { Game } from '../../types/index';
import { GameType, GameStatus } from '../../types/index';

const createBaseGame = (type: GameType): Game => ({
  id: 'test-game',
  type,
  status: GameStatus.IN_PROGRESS,
  players: [
    {
      id: 'player-1',
      name: 'Player 1',
      score: 0,
      ballsPocketed: [],
      isActive: true,
    },
    {
      id: 'player-2',
      name: 'Player 2',
      score: 0,
      ballsPocketed: [],
      isActive: false,
    },
  ],
  currentPlayerIndex: 0,
  startTime: new Date(),
  totalRacks: 1,
  currentRack: 1,
  rackInProgress: false,
  shotHistory: [],
  scoreHistory: [],
});

describe('gameUtils', () => {
  describe('isGameInProgress', () => {
    it('returns false for null or undefined game', () => {
      expect(isGameInProgress(null as unknown as Game)).toBe(false);
      expect(isGameInProgress(undefined as unknown as Game)).toBe(false);
    });

    describe('SET_MATCH game type', () => {
      it('returns true when any player has won sets', () => {
        const game = createBaseGame(GameType.SET_MATCH);
        game.players[0].setsWon = 1;

        expect(isGameInProgress(game)).toBe(true);
      });

      it('returns true when second player has won sets', () => {
        const game = createBaseGame(GameType.SET_MATCH);
        game.players[1].setsWon = 2;

        expect(isGameInProgress(game)).toBe(true);
      });

      it('returns false when no player has won any sets', () => {
        const game = createBaseGame(GameType.SET_MATCH);
        game.players[0].setsWon = 0;
        game.players[1].setsWon = 0;

        expect(isGameInProgress(game)).toBe(false);
      });

      it('returns false when setsWon is undefined for all players', () => {
        const game = createBaseGame(GameType.SET_MATCH);
        // setsWon is undefined by default

        expect(isGameInProgress(game)).toBe(false);
      });

      it('handles mixed setsWon states', () => {
        const game = createBaseGame(GameType.SET_MATCH);
        game.players[0].setsWon = undefined;
        game.players[1].setsWon = 1;

        expect(isGameInProgress(game)).toBe(true);
      });
    });

    describe('ROTATION game type', () => {
      it('returns true when any player has score > 0', () => {
        const game = createBaseGame(GameType.ROTATION);
        game.players[0].score = 5;

        expect(isGameInProgress(game)).toBe(true);
      });

      it('returns true when any player has pocketed balls', () => {
        const game = createBaseGame(GameType.ROTATION);
        game.players[0].ballsPocketed = [1, 2, 3];

        expect(isGameInProgress(game)).toBe(true);
      });

      it('returns true when player has both score and pocketed balls', () => {
        const game = createBaseGame(GameType.ROTATION);
        game.players[0].score = 15;
        game.players[0].ballsPocketed = [1, 5, 9];

        expect(isGameInProgress(game)).toBe(true);
      });

      it('returns true when second player has progress', () => {
        const game = createBaseGame(GameType.ROTATION);
        game.players[1].score = 7;

        expect(isGameInProgress(game)).toBe(true);
      });

      it('returns false when no player has progress', () => {
        const game = createBaseGame(GameType.ROTATION);
        // All scores and ballsPocketed arrays are empty by default

        expect(isGameInProgress(game)).toBe(false);
      });

      it('handles undefined ballsPocketed arrays', () => {
        const game = createBaseGame(GameType.ROTATION);
        game.players[0].ballsPocketed = undefined as unknown as number[];
        game.players[1].ballsPocketed = undefined as unknown as number[];

        expect(isGameInProgress(game)).toBe(false);
      });

      it('returns true when player has empty ballsPocketed but positive score', () => {
        const game = createBaseGame(GameType.ROTATION);
        game.players[0].score = 10;
        game.players[0].ballsPocketed = [];

        expect(isGameInProgress(game)).toBe(true);
      });
    });

    describe('BOWLARD game type', () => {
      it('returns true when player has bowling frames with rolls', () => {
        const game = createBaseGame(GameType.BOWLARD);
        game.players[0].bowlingFrames = [
          {
            frameNumber: 1,
            rolls: [7, 2],
            isStrike: false,
            isSpare: false,
            isComplete: true,
          },
        ];

        expect(isGameInProgress(game)).toBe(true);
      });

      it('returns true when any frame has at least one roll', () => {
        const game = createBaseGame(GameType.BOWLARD);
        game.players[0].bowlingFrames = [
          {
            frameNumber: 1,
            rolls: [10],
            isStrike: true,
            isSpare: false,
            isComplete: true,
          },
          {
            frameNumber: 2,
            rolls: [],
            isStrike: false,
            isSpare: false,
            isComplete: false,
          },
        ];

        expect(isGameInProgress(game)).toBe(true);
      });

      it('returns false when no frames exist', () => {
        const game = createBaseGame(GameType.BOWLARD);
        game.players[0].bowlingFrames = [];

        expect(isGameInProgress(game)).toBe(false);
      });

      it('returns false when bowlingFrames is undefined', () => {
        const game = createBaseGame(GameType.BOWLARD);
        game.players[0].bowlingFrames = undefined;

        expect(isGameInProgress(game)).toBe(false);
      });

      it('returns false when all frames have empty rolls', () => {
        const game = createBaseGame(GameType.BOWLARD);
        game.players[0].bowlingFrames = [
          {
            frameNumber: 1,
            rolls: [],
            isStrike: false,
            isSpare: false,
            isComplete: false,
          },
          {
            frameNumber: 2,
            rolls: [],
            isStrike: false,
            isSpare: false,
            isComplete: false,
          },
        ];

        expect(isGameInProgress(game)).toBe(false);
      });

      it('handles multiple frames with mixed states', () => {
        const game = createBaseGame(GameType.BOWLARD);
        game.players[0].bowlingFrames = [
          {
            frameNumber: 1,
            rolls: [],
            isStrike: false,
            isSpare: false,
            isComplete: false,
          },
          {
            frameNumber: 2,
            rolls: [5],
            isStrike: false,
            isSpare: false,
            isComplete: false,
          },
        ];

        expect(isGameInProgress(game)).toBe(true);
      });

      it('checks only the first player for Bowlard game', () => {
        const game = createBaseGame(GameType.BOWLARD);
        // Second player has frames with rolls, but Bowlard only checks first player
        game.players[1].bowlingFrames = [
          {
            frameNumber: 1,
            rolls: [10],
            isStrike: true,
            isSpare: false,
            isComplete: true,
          },
        ];
        game.players[0].bowlingFrames = [];

        expect(isGameInProgress(game)).toBe(false);
      });
    });

    describe('unknown game type', () => {
      it('returns false for unknown game types', () => {
        const game = createBaseGame('UNKNOWN_TYPE' as GameType);

        expect(isGameInProgress(game)).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('handles empty players array', () => {
        const game = createBaseGame(GameType.SET_MATCH);
        game.players = [];

        expect(isGameInProgress(game)).toBe(false);
      });

      it('handles single player', () => {
        const game = createBaseGame(GameType.ROTATION);
        game.players = [game.players[0]];
        game.players[0].score = 10;

        expect(isGameInProgress(game)).toBe(true);
      });

      it('handles multiple players with mixed game types', () => {
        const game = createBaseGame(GameType.SET_MATCH);
        game.players.push({
          id: 'player-3',
          name: 'Player 3',
          score: 0,
          ballsPocketed: [],
          isActive: false,
          setsWon: 1,
        });

        expect(isGameInProgress(game)).toBe(true);
      });
    });

    describe('integration scenarios', () => {
      it('correctly identifies a fresh SET_MATCH game', () => {
        const game = createBaseGame(GameType.SET_MATCH);
        expect(isGameInProgress(game)).toBe(false);
      });

      it('correctly identifies a started ROTATION game', () => {
        const game = createBaseGame(GameType.ROTATION);
        game.players[0].ballsPocketed = [1];
        game.players[0].score = 1;
        expect(isGameInProgress(game)).toBe(true);
      });

      it('correctly identifies a started BOWLARD game', () => {
        const game = createBaseGame(GameType.BOWLARD);
        game.players[0].bowlingFrames = [
          {
            frameNumber: 1,
            rolls: [7],
            isStrike: false,
            isSpare: false,
            isComplete: false,
          },
        ];
        expect(isGameInProgress(game)).toBe(true);
      });
    });
  });
});