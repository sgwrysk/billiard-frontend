import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGame } from '../useGame';
import { GameType, GameStatus } from '../../types/index';

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
      // SET_MATCHでは最初は誰も選択されていない
      expect(result.current.currentGame?.players[0].isActive).toBe(false);
      expect(result.current.currentGame?.players[1].isActive).toBe(false);
      // setsWonが初期化されている
      expect(result.current.currentGame?.players[0].setsWon).toBe(0);
      expect(result.current.currentGame?.players[1].setsWon).toBe(0);
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

      // SET_MATCHでは現在のプレイヤー（currentPlayerIndex）のスコアが更新される
      const currentPlayer = result.current.currentGame?.players[result.current.currentGame.currentPlayerIndex];
      expect(currentPlayer?.ballsPocketed).toContain(5);
      expect(currentPlayer?.score).toBe(1); // SET_MATCH: all balls except 9-ball are 1 point
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

      const currentPlayer = result.current.currentGame?.players[result.current.currentGame.currentPlayerIndex];
      expect(currentPlayer?.score).toBe(10);
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
      expect(player?.setsWon).toBe(1);
      expect(result.current.currentGame?.scoreHistory).toHaveLength(1); // SET_MATCHではセット勝利のみ記録
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

      // Pocket all 9 balls one by one
      for (let i = 1; i <= 9; i++) {
        act(() => {
          result.current.pocketBall(i);
        });
      }

      expect(result.current.checkAllBallsPocketed()).toBe(true);
    });

    it('should undo set win in SET_MATCH game', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1' }, { name: 'Player 2' }],
          GameType.SET_MATCH
        );
      });

      const playerId = result.current.currentGame!.players[0].id;
      
      // セット勝利
      act(() => {
        result.current.winSet(playerId);
      });

      let player = result.current.currentGame?.players.find(p => p.id === playerId);
      expect(player?.setsWon).toBe(1);
      expect(result.current.currentGame?.scoreHistory).toHaveLength(1);

      // セット勝利を取り消し
      act(() => {
        result.current.undoLastShot();
      });

      player = result.current.currentGame?.players.find(p => p.id === playerId);
      expect(player?.setsWon).toBe(0);
      expect(result.current.currentGame?.scoreHistory).toHaveLength(0);
    });

    it('should not undo when no sets won in SET_MATCH', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1' }, { name: 'Player 2' }],
          GameType.SET_MATCH
        );
      });

      // 初期状態を記録（現在は使用しないが、将来的なテスト拡張のため残す）
      // const initialState = result.current.currentGame;

      // 何もセットを勝っていない状態でアンドゥ
      act(() => {
        result.current.undoLastShot();
      });

      // 何も変わらない
      expect(result.current.currentGame?.scoreHistory).toHaveLength(0);
      expect(result.current.currentGame?.players[0].setsWon).toBe(0);
      expect(result.current.currentGame?.players[1].setsWon).toBe(0);
    });

    it('should initialize players with no active state in SET_MATCH', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1', targetSets: 5 }, { name: 'Player 2', targetSets: 5 }],
          GameType.SET_MATCH
        );
      });

      // SET_MATCHでは最初は誰もアクティブでない
      const players = result.current.currentGame?.players;
      expect(players?.every(p => !p.isActive)).toBe(true);
      expect(players?.[0].setsWon).toBe(0);
      expect(players?.[1].setsWon).toBe(0);
    });

    it('should end game when target sets reached in SET_MATCH', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1', targetSets: 2 }, { name: 'Player 2', targetSets: 2 }],
          GameType.SET_MATCH
        );
      });

      const playerId = result.current.currentGame!.players[0].id;

      // 1セット目勝利
      act(() => {
        result.current.winSet(playerId);
      });

      expect(result.current.currentGame?.status).toBe(GameStatus.IN_PROGRESS);
      expect(result.current.currentGame?.players[0].setsWon).toBe(1);

      // 2セット目勝利（目標達成）
      act(() => {
        result.current.winSet(playerId);
      });

      expect(result.current.currentGame?.status).toBe(GameStatus.COMPLETED);
      expect(result.current.currentGame?.players[0].setsWon).toBe(2);
    });

    it('should create correct scoreHistory for set wins in SET_MATCH', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1', targetSets: 3 }, { name: 'Player 2', targetSets: 3 }],
          GameType.SET_MATCH
        );
      });

      const player1Id = result.current.currentGame!.players[0].id;
      const player2Id = result.current.currentGame!.players[1].id;

      // Player 1 wins set 1
      act(() => {
        result.current.winSet(player1Id);
      });

      expect(result.current.currentGame?.scoreHistory).toHaveLength(1);
      expect(result.current.currentGame?.scoreHistory[0]).toMatchObject({
        playerId: player1Id,
        score: 1,
      });

      // Player 2 wins set 2
      act(() => {
        result.current.winSet(player2Id);
      });

      expect(result.current.currentGame?.scoreHistory).toHaveLength(2);
      expect(result.current.currentGame?.scoreHistory[1]).toMatchObject({
        playerId: player2Id,
        score: 1,
      });

      // Player 1 wins set 3
      act(() => {
        result.current.winSet(player1Id);
      });

      expect(result.current.currentGame?.scoreHistory).toHaveLength(3);
      expect(result.current.currentGame?.scoreHistory[2]).toMatchObject({
        playerId: player1Id,
        score: 1,
      });

      // Verify scoreHistory entries are properly formatted for VictoryScreen
      const setWins = result.current.currentGame?.scoreHistory.filter(entry => entry.score === 1);
      expect(setWins).toHaveLength(3);
      expect(setWins?.[0].playerId).toBe(player1Id);
      expect(setWins?.[1].playerId).toBe(player2Id);
      expect(setWins?.[2].playerId).toBe(player1Id);
    });

    it('should properly handle undo functionality with scoreHistory in SET_MATCH', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1', targetSets: 2 }, { name: 'Player 2', targetSets: 2 }],
          GameType.SET_MATCH
        );
      });

      const player1Id = result.current.currentGame!.players[0].id;
      const player2Id = result.current.currentGame!.players[1].id;

      // Initial state - scoreHistory should be empty
      expect(result.current.currentGame?.scoreHistory).toHaveLength(0);

      // Player 1 wins first set
      act(() => {
        result.current.winSet(player1Id);
      });

      expect(result.current.currentGame?.scoreHistory).toHaveLength(1);
      expect(result.current.currentGame?.players.find(p => p.id === player1Id)?.setsWon).toBe(1);

      // Player 2 wins second set
      act(() => {
        result.current.winSet(player2Id);
      });

      expect(result.current.currentGame?.scoreHistory).toHaveLength(2);
      expect(result.current.currentGame?.players.find(p => p.id === player2Id)?.setsWon).toBe(1);

      // Undo last set win (Player 2's win)
      act(() => {
        result.current.undoLastShot();
      });

      expect(result.current.currentGame?.scoreHistory).toHaveLength(1);
      expect(result.current.currentGame?.players.find(p => p.id === player2Id)?.setsWon).toBe(0);
      expect(result.current.currentGame?.players.find(p => p.id === player1Id)?.setsWon).toBe(1);

      // Undo again (Player 1's win)
      act(() => {
        result.current.undoLastShot();
      });

      expect(result.current.currentGame?.scoreHistory).toHaveLength(0);
      expect(result.current.currentGame?.players.find(p => p.id === player1Id)?.setsWon).toBe(0);
      expect(result.current.currentGame?.players.find(p => p.id === player2Id)?.setsWon).toBe(0);

      // Try to undo when no history exists - should not crash
      act(() => {
        result.current.undoLastShot();
      });

      expect(result.current.currentGame?.scoreHistory).toHaveLength(0);
      expect(result.current.currentGame?.players.find(p => p.id === player1Id)?.setsWon).toBe(0);
      expect(result.current.currentGame?.players.find(p => p.id === player2Id)?.setsWon).toBe(0);
    });

    it('should automatically end SET_MATCH game when target sets are reached', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1', targetSets: 2 }, { name: 'Player 2', targetSets: 2 }],
          GameType.SET_MATCH
        );
      });

      const player1Id = result.current.currentGame!.players[0].id;
      
      // Win first set
      act(() => {
        result.current.winSet(player1Id);
      });

      expect(result.current.currentGame?.players[0].setsWon).toBe(1);
      expect(result.current.currentGame?.status).toBe(GameStatus.IN_PROGRESS);

      // Win second set (should trigger game completion)
      act(() => {
        result.current.winSet(player1Id);
      });

      expect(result.current.currentGame?.players[0].setsWon).toBe(2);
      expect(result.current.currentGame?.status).toBe(GameStatus.COMPLETED);
      expect(result.current.gameHistory).toHaveLength(1);
      expect(result.current.gameHistory[0].winner).toBe(player1Id);
    });

    it('should not end SET_MATCH game when target sets are not reached', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1', targetSets: 5 }, { name: 'Player 2', targetSets: 5 }],
          GameType.SET_MATCH
        );
      });

      const player1Id = result.current.currentGame!.players[0].id;
      const player2Id = result.current.currentGame!.players[1].id;
      
      // Win sets alternately
      act(() => {
        result.current.winSet(player1Id);
      });
      act(() => {
        result.current.winSet(player2Id);
      });
      act(() => {
        result.current.winSet(player1Id);
      });

      expect(result.current.currentGame?.players[0].setsWon).toBe(2);
      expect(result.current.currentGame?.players[1].setsWon).toBe(1);
      expect(result.current.currentGame?.status).toBe(GameStatus.IN_PROGRESS);
      expect(result.current.gameHistory).toHaveLength(0);
    });

    it('should update game history and player stats when SET_MATCH game ends', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Winner Player', targetSets: 1 }, { name: 'Loser Player', targetSets: 1 }],
          GameType.SET_MATCH
        );
      });

      const winnerId = result.current.currentGame!.players[0].id;
      
      // Win the required set
      act(() => {
        result.current.winSet(winnerId);
      });

      // Check game is completed and added to history
      expect(result.current.currentGame?.status).toBe(GameStatus.COMPLETED);
      expect(result.current.gameHistory).toHaveLength(1);
      expect(result.current.gameHistory[0].winner).toBe(winnerId);
      expect(result.current.gameHistory[0].type).toBe(GameType.SET_MATCH);
      expect(result.current.gameHistory[0].endTime).toBeInstanceOf(Date);

      // Check player stats are updated
      expect(result.current.playerStats).toHaveLength(2);
      const winnerStats = result.current.playerStats.find(stat => stat.name === 'Winner Player');
      const loserStats = result.current.playerStats.find(stat => stat.name === 'Loser Player');
      
      expect(winnerStats?.totalGames).toBe(1);
      expect(winnerStats?.totalWins).toBe(1);
      expect(loserStats?.totalGames).toBe(1);
      expect(loserStats?.totalWins).toBe(0);
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

      // First roll: 7 pins
      act(() => {
        result.current.addPins(7);
      });

      let frame = result.current.currentGame?.players[0].bowlingFrames?.[0];
      expect(frame?.rolls).toEqual([7]);
      expect(frame?.isComplete).toBe(false);

      // Second roll: 3 pins (spare)
      act(() => {
        result.current.addPins(3);
      });

      frame = result.current.currentGame?.players[0].bowlingFrames?.[0];
      expect(frame?.rolls).toEqual([7, 3]);
      expect(frame?.isSpare).toBe(true);
      expect(frame?.isComplete).toBe(true);
    });

    it('should handle basic bowling scoring', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame([{ name: 'Player 1' }], GameType.BOWLARD);
      });

      // Add a simple roll
      act(() => {
        result.current.addPins(3);
      });

      const frames = result.current.currentGame?.players[0].bowlingFrames;
      expect(frames?.[0].rolls).toEqual([3]);
      expect(frames?.[0].isComplete).toBe(false);
    });

    it('should undo bowling roll correctly', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame([{ name: 'Player 1' }], GameType.BOWLARD);
      });

      // First roll: 7 pins
      act(() => {
        result.current.addPins(7);
      });

      let frame = result.current.currentGame?.players[0].bowlingFrames?.[0];
      expect(frame?.rolls).toEqual([7]);
      expect(frame?.isComplete).toBe(false);

      // Second roll: 2 pins
      act(() => {
        result.current.addPins(2);
      });

      frame = result.current.currentGame?.players[0].bowlingFrames?.[0];
      expect(frame?.rolls).toEqual([7, 2]);
      expect(frame?.isComplete).toBe(true);

      // Undo the last roll
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
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load billiardPlayerStats from localStorage:', expect.any(Error));
      
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

      const finishedGame = result.current.currentGame!;
      
      act(() => {
        result.current.startRematch(finishedGame);
      });

      expect(result.current.currentGame?.type).toBe(originalGameType);
      expect(result.current.currentGame?.players[0].name).toBe(originalPlayers?.[0].name);
      expect(result.current.currentGame?.players[0].targetScore).toBe(originalPlayers?.[0].targetScore);
    });
  });

  describe('ROTATION game mechanics', () => {
    it('should end game when target score is reached in ROTATION', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1', targetScore: 20 }, { name: 'Player 2', targetScore: 20 }],
          GameType.ROTATION
        );
      });

      expect(result.current.currentGame?.status).toBe(GameStatus.IN_PROGRESS);

      // Player 1 pockets ball 1 (1 point) -> total 1
      act(() => {
        result.current.pocketBall(1);
      });
      expect(result.current.currentGame?.status).toBe(GameStatus.IN_PROGRESS);
      expect(result.current.currentGame?.players[0].score).toBe(1);

      // Player 1 pockets ball 15 (15 points) -> total 16
      act(() => {
        result.current.pocketBall(15);
      });
      expect(result.current.currentGame?.status).toBe(GameStatus.IN_PROGRESS);
      expect(result.current.currentGame?.players[0].score).toBe(16);

      // Player 1 pockets ball 14 (14 points) -> total 30 (exceeds target 20)
      act(() => {
        result.current.pocketBall(14);
      });
      
      expect(result.current.currentGame?.status).toBe(GameStatus.COMPLETED);
      expect(result.current.currentGame?.players[0].score).toBe(30);
      expect(result.current.currentGame?.winner).toBe(result.current.currentGame?.players[0].id);
    });

    it('should auto-reset rack when all balls are pocketed in ROTATION', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1', targetScore: 200 }, { name: 'Player 2', targetScore: 200 }],
          GameType.ROTATION
        );
      });

      const initialRack = result.current.currentGame?.currentRack;
      const initialTotalRacks = result.current.currentGame?.totalRacks;

      // Pocket all 15 balls
      for (let i = 1; i <= 15; i++) {
        act(() => {
          result.current.pocketBall(i);
        });
      }

      // Should auto-reset rack after all balls are pocketed
      expect(result.current.currentGame?.currentRack).toBe((initialRack || 1) + 1);
      expect(result.current.currentGame?.totalRacks).toBe((initialTotalRacks || 1) + 1);
      
      // All players should have empty ballsPocketed after reset
      expect(result.current.currentGame?.players[0].ballsPocketed).toEqual([]);
      expect(result.current.currentGame?.players[1].ballsPocketed).toEqual([]);
      
      // Shot history should be cleared
      expect(result.current.currentGame?.shotHistory).toEqual([]);
      
      // Game should still be in progress (not ended)
      expect(result.current.currentGame?.status).toBe(GameStatus.IN_PROGRESS);
    });

    it('should correctly calculate total score from multiple racks in ROTATION', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.startGame(
          [{ name: 'Player 1', targetScore: 200 }, { name: 'Player 2', targetScore: 200 }],
          GameType.ROTATION
        );
      });

      // Player 1 pockets balls 1, 2, 3 in first rack (total: 6 points)
      act(() => {
        result.current.pocketBall(1);
      });
      act(() => {
        result.current.pocketBall(2);
      });
      act(() => {
        result.current.pocketBall(3);
      });

      expect(result.current.currentGame?.players[0].score).toBe(6);

      // Switch to Player 2 and pocket remaining balls to trigger rack reset
      act(() => {
        result.current.switchPlayer();
      });
      
      for (let i = 4; i <= 15; i++) {
        act(() => {
          result.current.pocketBall(i);
        });
      }

      // After rack reset, scores should be preserved
      expect(result.current.currentGame?.players[0].score).toBe(6); // Player 1's score preserved
      expect(result.current.currentGame?.players[1].score).toBe(4 + 5 + 6 + 7 + 8 + 9 + 10 + 11 + 12 + 13 + 14 + 15); // Player 2's total

      // New rack should be ready for next round
      expect(result.current.currentGame?.currentRack).toBe(2);
      expect(result.current.currentGame?.players[0].ballsPocketed).toEqual([]);
      expect(result.current.currentGame?.players[1].ballsPocketed).toEqual([]);
    });
  });
});