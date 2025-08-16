import { useState, useCallback, useEffect } from 'react';
import type { Game, Player, Shot, PlayerStats, ScoreHistory } from '../types/index';
import { GameType, GameStatus } from '../types/index';

export const useGame = () => {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [gameHistory, setGameHistory] = useState<Game[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);

  // Load player statistics from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('billiardPlayerStats');
    if (savedStats) {
      try {
        setPlayerStats(JSON.parse(savedStats));
      } catch (error) {
        console.error('Failed to load player stats:', error);
      }
    }
  }, []);

  // Save player statistics to localStorage
  const savePlayerStats = useCallback((stats: PlayerStats[]) => {
    setPlayerStats(stats);
    localStorage.setItem('billiardPlayerStats', JSON.stringify(stats));
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
    const players: Player[] = playerSetups.map((setup, index) => ({
      id: `player-${index + 1}`,
      name: setup.name,
      score: 0,
      ballsPocketed: [],
      isActive: index === 0, // First player is active
      targetScore: setup.targetScore,
      targetSets: setup.targetSets,
    }));

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

    setCurrentGame(prev => {
      if (!prev) return prev;

      const activePlayer = prev.players[prev.currentPlayerIndex];
      
      // Record in shot history
      const newShot: Shot = {
        playerId: activePlayer.id,
        ballNumber,
        isSunk: true,
        isFoul: false,
        timestamp: new Date(),
      };

      const updatedPlayers = prev.players.map(player => {
        if (player.isActive) {
          return {
            ...player,
            ballsPocketed: [...player.ballsPocketed, ballNumber],
            score: player.score + getBallScore(ballNumber, prev.type),
          };
        }
        return player;
      });

      // Update score history
      const newScoreEntry: ScoreHistory = {
        playerId: activePlayer.id,
        score: updatedPlayers.find(p => p.id === activePlayer.id)?.score || 0,
        timestamp: new Date(),
        ballNumber,
      };

      return {
        ...prev,
        players: updatedPlayers,
        shotHistory: [...prev.shotHistory, newShot],
        scoreHistory: [...prev.scoreHistory, newScoreEntry],
      };
    });
  }, [currentGame]);

  // Switch player
  const switchPlayer = useCallback(() => {
    if (!currentGame) return;

    setCurrentGame(prev => {
      if (!prev) return prev;

      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const updatedPlayers = prev.players.map((player, index) => ({
        ...player,
        isActive: index === nextPlayerIndex,
      }));

      return {
        ...prev,
        currentPlayerIndex: nextPlayerIndex,
        players: updatedPlayers,
      };
    });
  }, [currentGame]);

  // Switch to specified player
  const switchToPlayer = useCallback((playerIndex: number) => {
    if (!currentGame || playerIndex < 0 || playerIndex >= currentGame.players.length) return;

    setCurrentGame(prev => {
      if (!prev) return prev;

      const updatedPlayers = prev.players.map((player, index) => ({
        ...player,
        isActive: index === playerIndex,
      }));

      return {
        ...prev,
        currentPlayerIndex: playerIndex,
        players: updatedPlayers,
      };
    });
  }, [currentGame]);

  // End game
  const endGame = useCallback((winnerId?: string) => {
    if (!currentGame) return;

    const endedGame: Game = {
      ...currentGame,
      status: GameStatus.FINISHED,
      endTime: new Date(),
      winner: winnerId,
    };

    setGameHistory(prev => [...prev, endedGame]);
    updatePlayerStats(endedGame);
    setCurrentGame(null);
  }, [currentGame, updatePlayerStats]);

  // Rematch functionality
  const startRematch = useCallback(() => {
    if (!currentGame) return;

    const rematchPlayers = currentGame.players.map((player) => ({
      name: player.name,
      targetScore: player.targetScore,
      targetSets: player.targetSets,
    }));

    startGame(rematchPlayers, currentGame.type);
  }, [currentGame, startGame]);



  // Re-rack (for Rotation game)
  const resetRack = useCallback(() => {
    if (!currentGame || currentGame.type !== GameType.ROTATION) return;

    setCurrentGame(prev => {
      if (!prev) return prev;

      // Clear ballsPocketed for all players
      const updatedPlayers = prev.players.map(player => ({
        ...player,
        ballsPocketed: [],
      }));

      return {
        ...prev,
        players: updatedPlayers,
        currentRack: prev.currentRack + 1,
        totalRacks: prev.totalRacks + 1,
        rackInProgress: true,
        shotHistory: [], // Clear shot history when re-racking
        // scoreHistory is cumulative so don't clear it
      };
    });
  }, [currentGame]);

  // Undo last shot or set
  const undoLastShot = useCallback(() => {
    if (!currentGame) return;

    setCurrentGame(prev => {
      if (!prev) return prev;

      if (prev.type === GameType.SET_MATCH) {
        // For Set Match: Undo from score history
        if (prev.scoreHistory.length === 0) return prev;

        const lastScoreEntry = prev.scoreHistory[prev.scoreHistory.length - 1];
        const updatedScoreHistory = prev.scoreHistory.slice(0, -1);

        // Find player who gained the last set
        const updatedPlayers = prev.players.map(player => {
          if (player.id === lastScoreEntry.playerId) {
            return {
              ...player,
              score: Math.max(0, player.score - 1), // Subtract one set
            };
          }
          return player;
        });

        return {
          ...prev,
          players: updatedPlayers,
          scoreHistory: updatedScoreHistory,
        };
      } else {
        // For other game types: Undo from shot history
        if (prev.shotHistory.length === 0) return prev;

        const lastShot = prev.shotHistory[prev.shotHistory.length - 1];
        const updatedShotHistory = prev.shotHistory.slice(0, -1);

        // Find player who made the last shot
        const updatedPlayers = prev.players.map(player => {
          if (player.id === lastShot.playerId) {
            // Remove ball and subtract score
            const updatedBallsPocketed = player.ballsPocketed.filter(
              ball => ball !== lastShot.ballNumber
            );
            const scoreReduction = getBallScore(lastShot.ballNumber, prev.type);
            
            return {
              ...player,
              ballsPocketed: updatedBallsPocketed,
              score: Math.max(0, player.score - scoreReduction),
            };
          }
          return player;
        });

        return {
          ...prev,
          players: updatedPlayers,
          shotHistory: updatedShotHistory,
        };
      }
    });
  }, [currentGame]);

  // Check if all balls are pocketed
  const checkAllBallsPocketed = useCallback(() => {
    if (!currentGame) return false;
    
    const totalBalls = currentGame.type === GameType.SET_MATCH ? 9 : 15;
    const pocketedBalls = currentGame.players.flatMap(player => player.ballsPocketed);
    return pocketedBalls.length >= totalBalls;
  }, [currentGame]);

  // Win a set in Set Match game
  const winSet = useCallback((playerId: string) => {
    if (!currentGame || currentGame.type !== GameType.SET_MATCH) return;

    setCurrentGame(prev => {
      if (!prev) return prev;

      const updatedPlayers = prev.players.map(player => {
        if (player.id === playerId) {
          return {
            ...player,
            score: player.score + 1, // Increment set count
          };
        }
        return player;
      });

      // Record in score history
      const winner = updatedPlayers.find(p => p.id === playerId);
      if (winner) {
        const newScoreEntry: ScoreHistory = {
          playerId: winner.id,
          score: winner.score,
          timestamp: new Date(),
          ballNumber: 0, // Not applicable for set match
        };

        return {
          ...prev,
          players: updatedPlayers,
          scoreHistory: [...prev.scoreHistory, newScoreEntry],
        };
      }

      return prev;
    });
  }, [currentGame]);

  // Reset game
  const resetGame = useCallback(() => {
    setCurrentGame(null);
  }, []);

  return {
    currentGame,
    gameHistory,
    playerStats,
    startGame,
    startRematch,
    pocketBall,
    switchPlayer,
    switchToPlayer,
    endGame,
    resetGame,
    resetRack,
    checkAllBallsPocketed,
    undoLastShot,
    winSet,
  };
};

// Function to calculate ball score
const getBallScore = (ballNumber: number, gameType: GameType): number => {
  switch (gameType) {
    case GameType.SET_MATCH:
      return ballNumber === 9 ? 10 : 1; // 9-ball is 10 points, others are 1 point
    case GameType.ROTATION:
      return ballNumber; // Rotation: ball number equals points
    default:
      return 1;
  }
};
