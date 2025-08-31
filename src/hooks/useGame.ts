import { useState, useCallback } from 'react';
import type { Game, ChessClockSettings, ChessClockState } from '../types/index';
import { GameType, GameStatus } from '../types/index';
import { GameEngineFactory } from '../games/GameEngineFactory';
import type { JapanGameSettings } from '../types/japan';
import { JapanEngine } from '../games/japan/JapanEngine';


export const useGame = () => {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);









  // Start a new game
  const startGame = useCallback((playerSetups: {name: string, targetScore?: number, targetSets?: number}[], gameType: GameType, chessClock?: ChessClockSettings, japanSettings?: JapanGameSettings) => {
    const engine = GameEngineFactory.getEngine(gameType);
    
    let newGame: Game;
    if (gameType === GameType.JAPAN && engine instanceof JapanEngine) {
      newGame = engine.initializeGame(playerSetups, japanSettings);
    } else {
      newGame = engine.initializeGame(playerSetups);
    }
    
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
        const allBallsPocketed = 'checkAllBallsPocketed' in engine && 
          typeof (engine as unknown as { checkAllBallsPocketed: (game: Game) => boolean }).checkAllBallsPocketed === 'function' ?
          (engine as unknown as { checkAllBallsPocketed: (game: Game) => boolean }).checkAllBallsPocketed(updatedGame) : false;
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

  // Restore game from completed state
  const restoreGame = useCallback((game: Game) => {
    setCurrentGame(game);
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

  // Check if undo is available
  const canUndoLastShot = useCallback(() => {
    if (!currentGame) return false;

    // For undo to be available, there must be actual game actions taken
    // Shot history is the most reliable indicator of actions taken
    const hasShotHistory = currentGame.shotHistory && currentGame.shotHistory.length > 0;
    
    // For games that don't use shotHistory (like SET_MATCH), check if score history
    // has more entries than the initial player entries, or if any player has non-zero score
    const hasNonInitialScoreHistory = currentGame.scoreHistory && 
      currentGame.scoreHistory.length > currentGame.players.length;
    
    // Also check if any player has made progress (non-zero score)
    const hasPlayerProgress = currentGame.players.some(player => 
      player.score > 0 || 
      (player.ballsPocketed && player.ballsPocketed.length > 0) ||
      (player.setsWon && player.setsWon > 0)
    );

    // For ROTATION game, if we're on rack 2 or higher, there must have been previous actions
    // even if current shotHistory is empty due to rack reset
    const isAdvancedRack = currentGame.type === GameType.ROTATION && 
      currentGame.currentRack > 1;



    return hasShotHistory || hasNonInitialScoreHistory || hasPlayerProgress || isAdvancedRack;
  }, [currentGame]);

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
  const handleGameAction = useCallback((action: string, data?: unknown) => {
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
      const updatedGame = engine.handleCustomAction(currentGame, 'UNDO_LAST_SHOT');
      setCurrentGame(updatedGame);
    } else {
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
      
      // Check if game has ended
      if (updatedGame.status === GameStatus.COMPLETED) {
        // Game completion logic handled by game engines
        // Additional completion handling can be added here if needed
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

  // Update chess clock state
  const updateChessClockState = useCallback((chessClockState: ChessClockState) => {
    if (!currentGame) return;

    const updatedGame = {
      ...currentGame,
      chessClockState,
    };
    setCurrentGame(updatedGame);
  }, [currentGame]);

  // Japan-specific handlers
  const handleRackComplete = useCallback((rackData: { player1Balls: number; player2Balls: number; rackNumber: number }) => {
    if (!currentGame || currentGame.type !== GameType.JAPAN) return;

    const engine = GameEngineFactory.getEngine(currentGame.type) as JapanEngine;
    const updatedGame = engine.handleCustomAction(currentGame, 'rackComplete', rackData);
    
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

  const handleApplyMultiplier = useCallback((playerId: string, multiplier: number) => {
    if (!currentGame || currentGame.type !== GameType.JAPAN) return;

    const engine = GameEngineFactory.getEngine(currentGame.type) as JapanEngine;
    const updatedGame = engine.handleCustomAction(currentGame, 'multiplier', { playerId, value: multiplier });
    setCurrentGame(updatedGame);
  }, [currentGame]);

  const handleApplyDeduction = useCallback((playerId: string, deduction: number) => {
    if (!currentGame || currentGame.type !== GameType.JAPAN) return;

    const engine = GameEngineFactory.getEngine(currentGame.type) as JapanEngine;
    const updatedGame = engine.handleCustomAction(currentGame, 'deduction', { playerId, value: deduction });
    setCurrentGame(updatedGame);
  }, [currentGame]);

  const handleApplyMultiplierAll = useCallback((multiplier: number) => {
    if (!currentGame || currentGame.type !== GameType.JAPAN) return;

    const engine = GameEngineFactory.getEngine(currentGame.type) as JapanEngine;
    const updatedGame = engine.handleCustomAction(currentGame, 'multiplier_all', { value: multiplier });
    setCurrentGame(updatedGame);
  }, [currentGame]);

  const handleNextRack = useCallback(() => {
    if (!currentGame || currentGame.type !== GameType.JAPAN) return;

    const engine = GameEngineFactory.getEngine(currentGame.type) as JapanEngine;
    const updatedGame = engine.handleCustomAction(currentGame, 'nextRack');
    setCurrentGame(updatedGame);
  }, [currentGame]);

  const handlePlayerOrderChange = useCallback((selectedPlayerId: string) => {
    if (!currentGame || currentGame.type !== GameType.JAPAN) return;

    const engine = GameEngineFactory.getEngine(currentGame.type) as JapanEngine;
    let updatedGame = engine.handleCustomAction(currentGame, 'playerOrderChange', { selectedPlayerId });
    
    // After order change, proceed to next rack
    updatedGame = engine.handleCustomAction(updatedGame, 'nextRack');
    setCurrentGame(updatedGame);
  }, [currentGame]);

  return {
    // State
    currentGame,
    
    // Core actions
    startGame,
    endGame,
    resetGame,
    restoreGame,
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
    handleRackComplete,
    handleApplyMultiplier,
    handleApplyDeduction,
    handleApplyMultiplierAll,
    handleNextRack,
    handlePlayerOrderChange,
    
    // Utilities
    getBallNumbers,
    handleGameAction,
    updateChessClockState,
  };
};
