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
    setCurrentGame(prevGame => {
      if (!prevGame) return prevGame;

      const engine = GameEngineFactory.getEngine(prevGame.type);
      const updatedGame = engine.handlePocketBall(prevGame, ballNumber);

      // Check victory condition
      const { isGameOver, winnerId } = engine.checkVictoryCondition(updatedGame);

      if (isGameOver && winnerId) {
        return {
          ...updatedGame,
          status: GameStatus.COMPLETED,
          winner: winnerId,
          endTime: new Date(),
        };
      } else {
        // Check if all balls are pocketed (for rack reset in games like Rotation)
        if (engine.hasCustomLogic() && 'checkAllBallsPocketed' in engine) {
          const allBallsPocketed = 'checkAllBallsPocketed' in engine &&
            typeof (engine as unknown as { checkAllBallsPocketed: (game: Game) => boolean }).checkAllBallsPocketed === 'function' ?
            (engine as unknown as { checkAllBallsPocketed: (game: Game) => boolean }).checkAllBallsPocketed(updatedGame) : false;
          if (allBallsPocketed && engine.handleCustomAction) {
            // Auto-reset rack for next round
            return engine.handleCustomAction(updatedGame, 'RESET_RACK');
          } else {
            return updatedGame;
          }
        } else {
          return updatedGame;
        }
      }
    });
  }, []);

  // Switch player
  const switchPlayer = useCallback(() => {
    setCurrentGame(prevGame => {
      if (!prevGame) return prevGame;

      const engine = GameEngineFactory.getEngine(prevGame.type);
      return engine.handleSwitchPlayer(prevGame);
    });
  }, []);

  // Switch to specific player
  const switchToPlayer = useCallback((playerIndex: number) => {
    setCurrentGame(prevGame => {
      if (!prevGame || playerIndex < 0 || playerIndex >= prevGame.players.length) {
        return prevGame;
      }

      const updatedPlayers = prevGame.players.map((player, index) => ({
        ...player,
        isActive: index === playerIndex,
      }));

      return {
        ...prevGame,
        players: updatedPlayers,
        currentPlayerIndex: playerIndex,
      };
    });
  }, []);

  // End game
  const endGame = useCallback(() => {
    setCurrentGame(null); // Set to null after game ends
  }, []);

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
    setCurrentGame(prevGame => {
      if (!prevGame) return prevGame;

      // Check if swap is allowed inline to avoid dependency
      const canSwap = (() => {
        switch (prevGame.type) {
          case GameType.SET_MATCH:
            return prevGame.players.reduce((sum, p) => sum + (p.setsWon || 0), 0) === 0;
          case GameType.ROTATION:
            return prevGame.players.every(p => p.score === 0);
          case GameType.BOWLARD:
            return prevGame.players.every(p =>
              !p.bowlingFrames ||
              p.bowlingFrames.every(frame => frame.rolls.length === 0)
            );
          default:
            return false;
        }
      })();

      if (!canSwap) return prevGame;

      const updatedPlayers = [...prevGame.players];
      const temp = updatedPlayers[0];
      updatedPlayers[0] = updatedPlayers[1];
      updatedPlayers[1] = temp;

      return {
        ...prevGame,
        players: updatedPlayers,
      };
    });
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
  const handleGameAction = useCallback((action: string, data?: unknown) => {
    setCurrentGame(prevGame => {
      if (!prevGame) return prevGame;

      const engine = GameEngineFactory.getEngine(prevGame.type);

      if (engine.hasCustomLogic() && engine.handleCustomAction) {
        return engine.handleCustomAction(prevGame, action, data);
      }
      return prevGame;
    });
  }, []);

  // Undo last action
  const undoLastShot = useCallback(() => {
    setCurrentGame(prevGame => {
      if (!prevGame) return prevGame;

      const engine = GameEngineFactory.getEngine(prevGame.type);

      if (engine.hasCustomLogic() && engine.handleCustomAction) {
        return engine.handleCustomAction(prevGame, 'UNDO_LAST_SHOT');
      } else {
        return engine.handleUndo(prevGame);
      }
    });
  }, []);

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
    setCurrentGame(prevGame => {
      if (!prevGame) return prevGame;

      const engine = GameEngineFactory.getEngine(prevGame.type);

      if (engine.hasCustomLogic() && engine.handleCustomAction) {
        const updatedGame = engine.handleCustomAction(prevGame, 'WIN_SET', { playerId });

        // Check if game has ended
        if (updatedGame.status === GameStatus.COMPLETED) {
          // Game completion logic handled by game engines
          // Additional completion handling can be added here if needed
        }
        return updatedGame;
      }
      return prevGame;
    });
  }, []);

  // Bowlard-specific methods
  const addPins = useCallback((pins: number) => {
    handleGameAction('ADD_PINS', { pins });
  }, [handleGameAction]);

  const undoBowlingRoll = useCallback(() => {
    handleGameAction('UNDO_BOWLING_ROLL');
  }, [handleGameAction]);

  // Update chess clock state
  const updateChessClockState = useCallback((chessClockState: ChessClockState) => {
    setCurrentGame(prevGame => {
      if (!prevGame) return prevGame;

      return {
        ...prevGame,
        chessClockState,
      };
    });
  }, []);

  // Japan-specific handlers
  const handleRackComplete = useCallback((rackData: { player1Balls: number; player2Balls: number; rackNumber: number }) => {
    setCurrentGame(prevGame => {
      if (!prevGame || prevGame.type !== GameType.JAPAN) return prevGame;

      const engine = GameEngineFactory.getEngine(prevGame.type) as JapanEngine;
      const updatedGame = engine.handleCustomAction(prevGame, 'rackComplete', rackData);

      // Check victory condition
      const { isGameOver, winnerId } = engine.checkVictoryCondition(updatedGame);

      if (isGameOver && winnerId) {
        return {
          ...updatedGame,
          status: GameStatus.COMPLETED,
          winner: winnerId,
          endTime: new Date(),
        };
      } else {
        return updatedGame;
      }
    });
  }, []);

  const handleMultiplierChange = useCallback((multiplier: number) => {
    setCurrentGame(prevGame => {
      if (!prevGame || prevGame.type !== GameType.JAPAN) return prevGame;

      const engine = GameEngineFactory.getEngine(prevGame.type) as JapanEngine;
      return engine.handleMultiplierChange(prevGame, multiplier);
    });
  }, []);

  const handleNextRack = useCallback(() => {
    setCurrentGame(prevGame => {
      if (!prevGame || prevGame.type !== GameType.JAPAN) return prevGame;

      const engine = GameEngineFactory.getEngine(prevGame.type) as JapanEngine;
      return engine.handleCustomAction(prevGame, 'nextRack');
    });
  }, []);

  const handlePlayerOrderChange = useCallback((selectedPlayerId: string) => {
    setCurrentGame(prevGame => {
      if (!prevGame || prevGame.type !== GameType.JAPAN) return prevGame;

      const engine = GameEngineFactory.getEngine(prevGame.type) as JapanEngine;
      const updatedGame = engine.handleCustomAction(prevGame, 'playerOrderChange', { selectedPlayerId });

      // After order change, proceed to next rack
      return engine.handleCustomAction(updatedGame, 'nextRack');
    });
  }, []);

  return {
    // State
    currentGame,
    setCurrentGame,
    
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
    handleMultiplierChange,
    handleNextRack,
    handlePlayerOrderChange,
    
    // Utilities
    getBallNumbers,
    handleGameAction,
    updateChessClockState,
  };
};
