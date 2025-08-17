import { useState, useCallback } from 'react';
import type { Game } from '../types/index';
import { GameType, GameStatus } from '../types/index';
import { GameEngineFactory } from '../games/GameEngineFactory';


export const useGame = () => {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);









  // Start a new game
  const startGame = useCallback((playerSetups: {name: string, targetScore?: number, targetSets?: number}[], gameType: GameType) => {
    const engine = GameEngineFactory.getEngine(gameType);
    const newGame = engine.initializeGame(playerSetups);

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
      // Check if all balls are pocketed (for rack reset in games like Rotation)
      if (engine.hasCustomLogic() && 'checkAllBallsPocketed' in engine) {
        const allBallsPocketed = (engine as any).checkAllBallsPocketed(updatedGame);
        if (allBallsPocketed && engine.handleCustomAction) {
          // Auto-reset rack for next round
          const resetGame = engine.handleCustomAction(updatedGame, 'RESET_RACK');
          setCurrentGame(resetGame);
        } else {
          setCurrentGame(updatedGame);
        }
      } else {
        setCurrentGame(updatedGame);
      }
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
  const endGame = useCallback(() => {
    if (!currentGame) return;

    setCurrentGame(null); // ゲーム終了後はnullにする
  }, [currentGame]);

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
    
    if (engine.hasCustomLogic() && engine.handleCustomAction) {
      // カスタムアクションとしてアンドゥを処理
      const updatedGame = engine.handleCustomAction(currentGame, 'UNDO_LAST_SHOT');
      setCurrentGame(updatedGame);
    } else {
      // デフォルトのアンドゥ処理を使用
      const updatedGame = engine.handleUndo(currentGame);
      setCurrentGame(updatedGame);
    }
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
    if (!currentGame) return;

    const engine = GameEngineFactory.getEngine(currentGame.type);
    
    if (engine.hasCustomLogic() && engine.handleCustomAction) {
      const updatedGame = engine.handleCustomAction(currentGame, 'WIN_SET', { playerId });
      setCurrentGame(updatedGame);
      
      // ゲームが終了したかチェック
      if (updatedGame.status === GameStatus.COMPLETED) {

        

      }
    }
  }, [currentGame]);

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
