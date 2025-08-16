import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGame } from '../useGame';
import { GameType } from '../../types/index';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useGame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Game initialization', () => {
    it('should start with no current game', () => {
      const { result } = renderHook(() => useGame());
      expect(result.current.currentGame).toBeNull();
    });

    it('should initialize empty game history', () => {
      const { result } = renderHook(() => useGame());
      expect(result.current.gameHistory).toEqual([]);
    });

    it('should start a SET_MATCH game correctly', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1', targetSets: 5 }, { name: 'Player 2', targetSets: 5 }],
          GameType.SET_MATCH
        );
      });

      expect(result.current.currentGame).toBeTruthy();
      expect(result.current.currentGame?.type).toBe(GameType.SET_MATCH);
      expect(result.current.currentGame?.players).toHaveLength(2);
      expect(result.current.currentGame?.players[0].name).toBe('Player 1');
      expect(result.current.currentGame?.players[0].isActive).toBe(true);
      expect(result.current.currentGame?.players[1].isActive).toBe(false);
    });

    it('should start a ROTATION game correctly', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1', targetScore: 120 }, { name: 'Player 2', targetScore: 120 }],
          GameType.ROTATION
        );
      });

      expect(result.current.currentGame?.type).toBe(GameType.ROTATION);
      expect(result.current.currentGame?.players[0].targetScore).toBe(120);
    });

    it('should start a BOWLARD game with bowling frames', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1' }],
          GameType.BOWLARD
        );
      });

      expect(result.current.currentGame?.type).toBe(GameType.BOWLARD);
      expect(result.current.currentGame?.players[0].bowlingFrames).toHaveLength(10);
      expect(result.current.currentGame?.players[0].bowlingFrames?.[0].frameNumber).toBe(1);
    });
  });

  describe('Game actions', () => {
    it('should pocket a ball and update score in SET_MATCH', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1' }, { name: 'Player 2' }],
          GameType.SET_MATCH
        );
      });

      act(() => {
        result.current.pocketBall(5);
      });

      const activePlayer = result.current.currentGame?.players.find(p => p.isActive);
      expect(activePlayer?.ballsPocketed).toContain(5);
      expect(activePlayer?.score).toBe(1); // SET_MATCH: all balls except 9-ball are 1 point
      expect(result.current.currentGame?.shotHistory).toHaveLength(1);
    });

    it('should pocket 9-ball for 10 points in SET_MATCH', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1' }, { name: 'Player 2' }],
          GameType.SET_MATCH
        );
      });

      act(() => {
        result.current.pocketBall(9);
      });

      const activePlayer = result.current.currentGame?.players.find(p => p.isActive);
      expect(activePlayer?.score).toBe(10);
    });

    it('should pocket ball for ball number points in ROTATION', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1' }, { name: 'Player 2' }],
          GameType.ROTATION
        );
      });

      act(() => {
        result.current.pocketBall(7);
      });

      const activePlayer = result.current.currentGame?.players.find(p => p.isActive);
      expect(activePlayer?.score).toBe(7); // ROTATION: ball number equals points
    });

    it('should switch players correctly', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1' }, { name: 'Player 2' }],
          GameType.SET_MATCH
        );
      });

      expect(result.current.currentGame?.currentPlayerIndex).toBe(0);
      
      act(() => {
        result.current.switchPlayer();
      });

      expect(result.current.currentGame?.currentPlayerIndex).toBe(1);
      expect(result.current.currentGame?.players[0].isActive).toBe(false);
      expect(result.current.currentGame?.players[1].isActive).toBe(true);
    });

    it('should switch to specific player', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1' }, { name: 'Player 2' }, { name: 'Player 3' }],
          GameType.SET_MATCH
        );
      });

      act(() => {
        result.current.switchToPlayer(2);
      });

      expect(result.current.currentGame?.currentPlayerIndex).toBe(2);
      expect(result.current.currentGame?.players[2].isActive).toBe(true);
    });

    it('should win a set in SET_MATCH game', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1' }, { name: 'Player 2' }],
          GameType.SET_MATCH
        );
      });

      const playerId = result.current.currentGame!.players[0].id;
      
      act(() => {
        result.current.winSet(playerId);
      });

      const player = result.current.currentGame?.players.find(p => p.id === playerId);
      expect(player?.score).toBe(1);
      expect(result.current.currentGame?.scoreHistory).toHaveLength(3); // 2 initial + 1 new
    });

    it('should end game and update history', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1' }, { name: 'Player 2' }],
          GameType.SET_MATCH
        );
      });

      const winnerId = result.current.currentGame!.players[0].id;
      
      act(() => {
        result.current.endGame(winnerId);
      });

      expect(result.current.currentGame).toBeNull();
      expect(result.current.gameHistory).toHaveLength(1);
      expect(result.current.gameHistory[0].winner).toBe(winnerId);
    });

    it('should reset rack in ROTATION game', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1' }, { name: 'Player 2' }],
          GameType.ROTATION
        );
      });

      act(() => {
        result.current.pocketBall(5);
        result.current.resetRack();
      });

      expect(result.current.currentGame?.currentRack).toBe(2);
      expect(result.current.currentGame?.totalRacks).toBe(2);
      expect(result.current.currentGame?.players[0].ballsPocketed).toEqual([]);
      expect(result.current.currentGame?.shotHistory).toEqual([]);
    });

    it('should undo last shot', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1' }, { name: 'Player 2' }],
          GameType.ROTATION
        );
      });

      act(() => {
        result.current.pocketBall(7);
      });

      const playerBefore = result.current.currentGame?.players[0];
      expect(playerBefore?.score).toBe(7);
      expect(playerBefore?.ballsPocketed).toContain(7);

      act(() => {
        result.current.undoLastShot();
      });

      const playerAfter = result.current.currentGame?.players[0];
      expect(playerAfter?.score).toBe(0);
      expect(playerAfter?.ballsPocketed).toEqual([]);
      expect(result.current.currentGame?.shotHistory).toEqual([]);
    });

    it('should check if all balls are pocketed', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1' }, { name: 'Player 2' }],
          GameType.SET_MATCH
        );
      });

      expect(result.current.checkAllBallsPocketed()).toBe(false);

      // Pocket all 9 balls
      act(() => {
        for (let i = 1; i <= 9; i++) {
          result.current.pocketBall(i);
        }
      });

      expect(result.current.checkAllBallsPocketed()).toBe(true);
    });
  });

  describe('Bowling (BOWLARD) specific functions', () => {
    it('should add pins and calculate strike correctly', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame([{ name: 'Player 1' }], GameType.BOWLARD);
      });

      act(() => {
        result.current.addPins(10); // Strike
      });

      const frame = result.current.currentGame?.players[0].bowlingFrames?.[0];
      expect(frame?.rolls).toEqual([10]);
      expect(frame?.isStrike).toBe(true);
      expect(frame?.isComplete).toBe(true);
    });

    it('should add pins and calculate spare correctly', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame([{ name: 'Player 1' }], GameType.BOWLARD);
      });

      act(() => {
        result.current.addPins(7);
        result.current.addPins(3); // Spare
      });

      const frame = result.current.currentGame?.players[0].bowlingFrames?.[0];
      expect(frame?.rolls).toEqual([7, 3]);
      expect(frame?.isSpare).toBe(true);
      expect(frame?.isComplete).toBe(true);
    });

    it('should handle frame 10 special rules', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame([{ name: 'Player 1' }], GameType.BOWLARD);
      });

      // Complete 9 frames with strikes to get to frame 10
      act(() => {
        for (let i = 0; i < 9; i++) {
          result.current.addPins(10);
        }
      });

      // Frame 10: Strike, then two more rolls
      act(() => {
        result.current.addPins(10); // Strike
        result.current.addPins(10); // Strike
        result.current.addPins(10); // Strike
      });

      const frame10 = result.current.currentGame?.players[0].bowlingFrames?.[9];
      expect(frame10?.rolls).toEqual([10, 10, 10]);
      expect(frame10?.isComplete).toBe(true);
    });

    it('should undo bowling roll correctly', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame([{ name: 'Player 1' }], GameType.BOWLARD);
      });

      act(() => {
        result.current.addPins(7);
        result.current.addPins(2);
      });

      let frame = result.current.currentGame?.players[0].bowlingFrames?.[0];
      expect(frame?.rolls).toEqual([7, 2]);

      act(() => {
        result.current.undoBowlingRoll();
      });

      frame = result.current.currentGame?.players[0].bowlingFrames?.[0];
      expect(frame?.rolls).toEqual([7]);
      expect(frame?.isComplete).toBe(false);
    });
  });

  describe('Player statistics', () => {
    it('should load player stats from localStorage', () => {
      const mockStats = [{ name: 'Player 1', totalWins: 5, totalGames: 10 }];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockStats));

      const { result } = renderHook(() => useGame());
      
      expect(result.current.playerStats).toEqual(mockStats);
    });

    it('should update player stats when game ends', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1' }, { name: 'Player 2' }],
          GameType.SET_MATCH
        );
      });

      const winnerId = result.current.currentGame!.players[0].id;
      
      act(() => {
        result.current.endGame(winnerId);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'billiardPlayerStats',
        expect.stringContaining('Player 1')
      );
    });
  });

  describe('Error handling', () => {
    it('should handle invalid player index in switchToPlayer', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1' }, { name: 'Player 2' }],
          GameType.SET_MATCH
        );
      });

      const initialIndex = result.current.currentGame?.currentPlayerIndex;

      act(() => {
        result.current.switchToPlayer(-1);
      });

      expect(result.current.currentGame?.currentPlayerIndex).toBe(initialIndex);

      act(() => {
        result.current.switchToPlayer(5);
      });

      expect(result.current.currentGame?.currentPlayerIndex).toBe(initialIndex);
    });

    it('should handle pocketing ball when no game is active', () => {
      const { result } = renderHook(() => useGame());
      
      expect(() => {
        act(() => {
          result.current.pocketBall(5);
        });
      }).not.toThrow();
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const { result } = renderHook(() => useGame());
      
      expect(result.current.playerStats).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load player stats:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Game flow', () => {
    it('should reset game correctly', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1' }, { name: 'Player 2' }],
          GameType.SET_MATCH
        );
      });

      expect(result.current.currentGame).toBeTruthy();

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.currentGame).toBeNull();
    });

    it('should start rematch with same players and game type', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1', targetScore: 120 }, { name: 'Player 2', targetScore: 120 }],
          GameType.ROTATION
        );
      });

      const originalGameType = result.current.currentGame?.type;
      const originalPlayers = result.current.currentGame?.players;

      act(() => {
        result.current.startRematch();
      });

      expect(result.current.currentGame?.type).toBe(originalGameType);
      expect(result.current.currentGame?.players[0].name).toBe(originalPlayers?.[0].name);
      expect(result.current.currentGame?.players[0].targetScore).toBe(originalPlayers?.[0].targetScore);
    });
  });
});