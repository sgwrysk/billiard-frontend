import { useState, useCallback, useEffect } from 'react';
import type { Game, Player, PlayerStats } from '../types/index';
import { GameType, GameStatus } from '../types/index';
import { GameEngineFactory } from '../games/GameEngineFactory';
import { storage } from '../utils/storageUtils';

export const useGame = () => {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [gameHistory, setGameHistory] = useState<Game[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);

  // Load player statistics from localStorage
  useEffect(() => {
    const savedStats = storage.get<PlayerStats[]>('billiardPlayerStats', []);
    setPlayerStats(savedStats);
  }, []);

  // Save player statistics to localStorage
  const savePlayerStats = useCallback((stats: PlayerStats[]) => {
    setPlayerStats(stats);
    storage.set('billiardPlayerStats', stats);
  }, []);

  // Update player statistics
  const updatePlayerStats = useCallback((gameResult: Game) => {
    const updatedStats = [...playerStats];
    
    gameResult.players.forEach(player => {
      let playerStat = updatedStats.find(stat => stat.name === player.name);
      
      if (!playerStat) {
        playerStat = {
          name: player.name,
          totalWins: 0,
          totalGames: 0,
        };
        updatedStats.push(playerStat);
      }
      
      playerStat.totalGames += 1;
      if (player.id === gameResult.winner) {
        playerStat.totalWins += 1;
      }
    });
    
    savePlayerStats(updatedStats);
  }, [playerStats, savePlayerStats]);

  // Start a new game
  const startGame = useCallback((playerSetups: {name: string, targetScore?: number, targetSets?: number}[], gameType: GameType) => {
    const engine = GameEngineFactory.getEngine(gameType);
    const players: Player[] = engine.initializePlayers(playerSetups);

    const newGame: Game = {
      id: `game-${Date.now()}`,
      type: gameType,
      status: GameStatus.IN_PROGRESS,
      players,
      currentPlayerIndex: 0,
      startTime: new Date(),
      totalRacks: 1,
      currentRack: 1,
      rackInProgress: true,
      shotHistory: [],
      scoreHistory: players.map(player => ({
        playerId: player.id,
        score: 0,
        timestamp: new Date(),
      })),
    };

    setCurrentGame(newGame);
  }, []);

  // Pocket a ball
  const pocketBall = useCallback((ballNumber: number) => {
    if (!currentGame) return;

    const engine = GameEngineFactory.getEngine(currentGame.type);
    const updatedGame = engine.handlePocketBall(currentGame, ballNumber);
    
    // Check victory condition
    const { isGameOver, winnerId } = engine.checkVictoryCondition(updatedGame);
    
    if (isGameOver && winnerId) {
      const finalGame = {
        ...updatedGame,
        status: GameStatus.COMPLETED,
        winner: winnerId,
        endTime: new Date(),
      };
      setCurrentGame(finalGame);
    } else {
      setCurrentGame(updatedGame);
    }
  }, [currentGame]);

  // Switch player
  const switchPlayer = useCallback(() => {
    if (!currentGame) return;

    const engine = GameEngineFactory.getEngine(currentGame.type);
    const updatedGame = engine.handleSwitchPlayer(currentGame);
    setCurrentGame(updatedGame);
  }, [currentGame]);

  // Switch to specific player
  const switchToPlayer = useCallback((playerIndex: number) => {
    if (!currentGame || playerIndex < 0 || playerIndex >= currentGame.players.length) return;

    const updatedPlayers = currentGame.players.map((player, index) => ({
      ...player,
      isActive: index === playerIndex,
    }));

    setCurrentGame({
      ...currentGame,
      players: updatedPlayers,
      currentPlayerIndex: playerIndex,
    });
  }, [currentGame]);

  // End game
  const endGame = useCallback((winnerId?: string) => {
    if (!currentGame) return;

    const finalGame: Game = {
      ...currentGame,
      status: GameStatus.COMPLETED,
      winner: winnerId,
      endTime: new Date(),
    };

    setGameHistory(prev => [finalGame, ...prev]);
    updatePlayerStats(finalGame);
    setCurrentGame(null); // ゲーム終了後はnullにする
  }, [currentGame, updatePlayerStats]);

  // Reset game
  const resetGame = useCallback(() => {
    setCurrentGame(null);
  }, []);

  // Start rematch
  const startRematch = useCallback((finishedGame: Game) => {
    if (!finishedGame) return;

    const rematchPlayers = finishedGame.players.map(player => ({
      name: player.name,
      targetScore: player.targetScore,
      targetSets: player.targetSets,
    }));

    startGame(rematchPlayers, finishedGame.type);
  }, [startGame]);

  // Handle game-specific actions
  const handleGameAction = useCallback((action: string, data?: any) => {
    if (!currentGame) return;

    const engine = GameEngineFactory.getEngine(currentGame.type);
    
    if (engine.hasCustomLogic() && engine.handleCustomAction) {
      const updatedGame = engine.handleCustomAction(currentGame, action, data);
      setCurrentGame(updatedGame);
    }
  }, [currentGame]);

  // Undo last action
  const undoLastShot = useCallback(() => {
    if (!currentGame) return;

    const engine = GameEngineFactory.getEngine(currentGame.type);
    const updatedGame = engine.handleUndo(currentGame);
    setCurrentGame(updatedGame);
  }, [currentGame]);

  // Game-specific methods
  const resetRack = useCallback(() => {
    handleGameAction('RESET_RACK');
  }, [handleGameAction]);

  // Get ball numbers for current game
  const getBallNumbers = useCallback((): number[] => {
    if (!currentGame) return [];
    
    const engine = GameEngineFactory.getEngine(currentGame.type);
    return engine.getBallNumbers();
  }, [currentGame]);

  const checkAllBallsPocketed = useCallback((): boolean => {
    if (!currentGame) return false;
    
    // エンジンから直接ボール番号を取得
    const engine = GameEngineFactory.getEngine(currentGame.type);
    const totalBalls = engine.getBallNumbers();
    const pocketedBalls = currentGame.players.reduce((acc, player) => {
      return acc.concat(player.ballsPocketed);
    }, [] as number[]);
    
    return totalBalls.length > 0 && totalBalls.every(ball => pocketedBalls.includes(ball));
  }, [currentGame]);

  const winSet = useCallback((playerId: string) => {
    handleGameAction('WIN_SET', { playerId });
  }, [handleGameAction]);

  // Bowlard-specific methods
  const addPins = useCallback((pins: number) => {
    handleGameAction('ADD_PINS', { pins });
  }, [handleGameAction]);

  const undoBowlingRoll = useCallback(() => {
    handleGameAction('UNDO_BOWLING_ROLL');
  }, [handleGameAction]);

  return {
    // State
    currentGame,
    gameHistory,
    playerStats,
    
    // Core actions
    startGame,
    endGame,
    resetGame,
    startRematch,
    
    // Game actions
    pocketBall,
    switchPlayer,
    switchToPlayer,
    undoLastShot,
    
    // Game-specific actions
    resetRack,
    checkAllBallsPocketed,
    winSet,
    addPins,
    undoBowlingRoll,
    
    // Utilities
    getBallNumbers,
    handleGameAction,
  };
};
