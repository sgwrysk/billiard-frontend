import { useState, useCallback } from 'react';
import type { Game, ChessClockSettings } from '../types/index';
import { GameType, GameStatus } from '../types/index';
import { GameEngineFactory } from '../games/GameEngineFactory';


export const useGame = () => {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);









  // Start a new game
  const startGame = useCallback((playerSetups: {name: string, targetScore?: number, targetSets?: number}[], gameType: GameType, chessClock?: ChessClockSettings) => {
    const engine = GameEngineFactory.getEngine(gameType);
    const newGame = engine.initializeGame(playerSetups);
    
    // Add chess clock settings if provided
    if (chessClock) {
      newGame.chessClock = chessClock;
    }

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
    if (!currentGame || playerIndex < 0 || playerIndex >= currentGame.players.length) {
      return;
    }

    const updatedPlayers = currentGame.players.map((player, index) => ({
      ...player,
      isActive: index === playerIndex,
    }));

    const updatedGame = {
      ...currentGame,
      players: updatedPlayers,
      currentPlayerIndex: playerIndex,
    };
    
    setCurrentGame(updatedGame);
  }, [currentGame]);

  // End game
  const endGame = useCallback(() => {
    if (!currentGame) return;

    setCurrentGame(null); // Set to null after game ends
  }, [currentGame]);

  // Reset game
  const resetGame = useCallback(() => {
    setCurrentGame(null);
  }, []);

  // Check if game is in initial state (can swap players or undo actions)
  const isGameInInitialState = useCallback(() => {
    if (!currentGame) return false;

    switch (currentGame.type) {
      case GameType.SET_MATCH:
        // Set Match: state where no sets have been won yet
        return currentGame.players.reduce((sum, p) => sum + (p.setsWon || 0), 0) === 0;
      
      case GameType.ROTATION:
        // Rotation: state where both players haven't scored yet
        return currentGame.players.every(p => p.score === 0);
      
      case GameType.BOWLARD:
        // Bowlard: consider initial state until first roll is made
        return currentGame.players.every(p => 
          !p.bowlingFrames || 
          p.bowlingFrames.every(frame => frame.rolls.length === 0)
        );
      
      default:
        return false;
    }
  }, [currentGame]);

  // Check if players can be swapped (same as isGameInInitialState)
  const canSwapPlayers = useCallback(() => {
    return isGameInInitialState();
  }, [isGameInInitialState]);

  // Check if undo is available (opposite of isGameInInitialState)
  const canUndoLastShot = useCallback(() => {
    return !isGameInInitialState();
  }, [isGameInInitialState]);

  // Swap players (only before game starts)
  const swapPlayers = useCallback(() => {
    if (!currentGame || !canSwapPlayers()) return;

    const updatedPlayers = [...currentGame.players];
    const temp = updatedPlayers[0];
    updatedPlayers[0] = updatedPlayers[1];
    updatedPlayers[1] = temp;

    setCurrentGame({
      ...currentGame,
      players: updatedPlayers,
    });
  }, [currentGame, canSwapPlayers]);

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
      // Handle undo as custom action
      const updatedGame = engine.handleCustomAction(currentGame, 'UNDO_LAST_SHOT');
      setCurrentGame(updatedGame);
    } else {
      // Use default undo processing
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
    
    // Get ball numbers directly from engine
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
    swapPlayers,
    canSwapPlayers,
    canUndoLastShot,
    
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
