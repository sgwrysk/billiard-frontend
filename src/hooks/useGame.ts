import { useState, useCallback, useEffect } from 'react';
import type { Game, Player, Shot, PlayerStats, ScoreHistory, BowlingFrame } from '../types/index';
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

  // Initialize bowling frames for a player
  const initializeBowlingFrames = (): BowlingFrame[] => {
    return Array.from({ length: 10 }, (_, index) => ({
      frameNumber: index + 1,
      rolls: [],
      score: undefined,
      isStrike: false,
      isSpare: false,
      isComplete: false,
    }));
  };

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
      // Initialize bowling frames for BOWLARD game
      bowlingFrames: gameType === GameType.BOWLARD ? initializeBowlingFrames() : undefined,
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

  // Add pins to bowling frame
  const addPins = useCallback((pins: number) => {
    if (!currentGame || currentGame.type !== GameType.BOWLARD) return;

    setCurrentGame(prev => {
      if (!prev) return prev;

      const activePlayer = prev.players[prev.currentPlayerIndex];
      const frames = activePlayer.bowlingFrames || [];
      
      // Find current frame
      const currentFrameIndex = frames.findIndex(frame => !frame.isComplete);
      if (currentFrameIndex === -1) return prev; // All frames complete

      const currentFrame = frames[currentFrameIndex];
      const updatedFrames = [...frames];
      const updatedFrame = { ...currentFrame };

      // Add pins to current roll
      updatedFrame.rolls.push(pins);

      // Check for strike (frame 1-9)
      if (currentFrameIndex < 9 && updatedFrame.rolls.length === 1 && pins === 10) {
        updatedFrame.isStrike = true;
        updatedFrame.isComplete = true;
      }
      // Check for spare (frame 1-9)
      else if (currentFrameIndex < 9 && updatedFrame.rolls.length === 2) {
        const total = updatedFrame.rolls.reduce((sum, roll) => sum + roll, 0);
        updatedFrame.isSpare = total === 10;
        updatedFrame.isComplete = true;
      }
      // Frame 10 special rules
      else if (currentFrameIndex === 9) {
        // Check for first roll strike
        if (updatedFrame.rolls.length === 1 && pins === 10) {
          updatedFrame.isStrike = true;
        }
        // Check for spare (only if first roll wasn't a strike)
        else if (updatedFrame.rolls.length === 2 && updatedFrame.rolls[0] !== 10) {
          const total = updatedFrame.rolls[0] + updatedFrame.rolls[1];
          if (total === 10) {
            updatedFrame.isSpare = true;
          }
        }
        
        // Frame 10 completion rules
        if (updatedFrame.rolls.length === 3) {
          // Always complete with 3 rolls
          updatedFrame.isComplete = true;
        } else if (updatedFrame.rolls.length === 2) {
          // Complete with 2 rolls only if no strike and no spare
          const firstRoll = updatedFrame.rolls[0];
          const secondRoll = updatedFrame.rolls[1];
          
          // If first roll is strike, need 3rd roll
          if (firstRoll === 10) {
            updatedFrame.isComplete = false;
          }
          // If spare, need 3rd roll
          else if (firstRoll + secondRoll === 10) {
            updatedFrame.isComplete = false;
          }
          // No strike, no spare - complete
          else {
            updatedFrame.isComplete = true;
          }
        }
      }

      updatedFrames[currentFrameIndex] = updatedFrame;

      // Calculate scores
      const calculatedFrames = calculateBowlingScores(updatedFrames);
      const totalScore = calculatedFrames[calculatedFrames.length - 1]?.score || 0;

      const updatedPlayer = {
        ...activePlayer,
        bowlingFrames: calculatedFrames,
        score: totalScore,
      };

      const updatedPlayers = prev.players.map(player => 
        player.id === activePlayer.id ? updatedPlayer : player
      );

      // Check if game is complete (all 10 frames done)
      const gameComplete = calculatedFrames[9]?.isComplete || false;

      return {
        ...prev,
        players: updatedPlayers,
        status: gameComplete ? GameStatus.FINISHED : prev.status,
        winner: gameComplete ? activePlayer.id : prev.winner,
        endTime: gameComplete ? new Date() : prev.endTime,
      };
    });
  }, [currentGame]);

  // Calculate bowling scores with proper strike/spare logic
  const calculateBowlingScores = (frames: BowlingFrame[]): BowlingFrame[] => {
    const calculatedFrames = [...frames];
    
    for (let i = 0; i < 10; i++) {
      const frame = calculatedFrames[i];
      
      // Frame 10 special calculation
      if (i === 9) {
        // For frame 10, just sum all rolls (no bonus calculation needed)
        const frameScore = frame.rolls.reduce((sum, roll) => sum + roll, 0);
        const previousScore = i > 0 ? (calculatedFrames[i - 1].score || 0) : 0;
        calculatedFrames[i] = {
          ...frame,
          score: previousScore + frameScore,
        };
      } else {
        // Frames 1-9
        let frameScore = frame.rolls.reduce((sum, roll) => sum + roll, 0);
        
        // Strike bonus (frames 1-9)
        if (frame.isStrike) {
          // Add next two rolls
          if (i + 1 === 9) {
            // Next frame is frame 10
            const frame10 = calculatedFrames[9];
            if (frame10.rolls.length >= 1) {
              frameScore += frame10.rolls[0];
            }
            if (frame10.rolls.length >= 2) {
              frameScore += frame10.rolls[1];
            }
          } else if (i + 1 < 9) {
            // Next frame is frames 1-8
            const nextFrame = calculatedFrames[i + 1];
            if (nextFrame.rolls.length >= 1) {
              frameScore += nextFrame.rolls[0];
            }
            if (nextFrame.rolls.length >= 2) {
              frameScore += nextFrame.rolls[1];
            } else if (nextFrame.isStrike && i + 2 < 10) {
              // Next frame is also strike
              if (i + 2 === 9) {
                // Frame after next is frame 10
                const frame10 = calculatedFrames[9];
                if (frame10.rolls.length >= 1) {
                  frameScore += frame10.rolls[0];
                }
              } else {
                // Frame after next is frames 1-8
                const frameAfterNext = calculatedFrames[i + 2];
                if (frameAfterNext.rolls.length >= 1) {
                  frameScore += frameAfterNext.rolls[0];
                }
              }
            }
          }
        }
        // Spare bonus (frames 1-9)
        else if (frame.isSpare) {
          // Add next one roll
          if (i + 1 === 9) {
            // Next frame is frame 10
            const frame10 = calculatedFrames[9];
            if (frame10.rolls.length >= 1) {
              frameScore += frame10.rolls[0];
            }
          } else if (i + 1 < 9) {
            // Next frame is frames 1-8
            const nextFrame = calculatedFrames[i + 1];
            if (nextFrame.rolls.length >= 1) {
              frameScore += nextFrame.rolls[0];
            }
          }
        }
        
        // Set cumulative score
        const previousScore = i > 0 ? (calculatedFrames[i - 1].score || 0) : 0;
        calculatedFrames[i] = {
          ...frame,
          score: previousScore + frameScore,
        };
      }
    }
    
    return calculatedFrames;
  };

  // Undo bowling pin input
  const undoBowlingRoll = useCallback(() => {
    if (!currentGame || currentGame.type !== GameType.BOWLARD) return;

    setCurrentGame(prev => {
      if (!prev) return prev;

      const activePlayer = prev.players[prev.currentPlayerIndex];
      const frames = activePlayer.bowlingFrames || [];
      
      // Find current frame or last frame with rolls
      let targetFrameIndex = -1;
      for (let i = frames.length - 1; i >= 0; i--) {
        if (frames[i].rolls.length > 0) {
          targetFrameIndex = i;
          break;
        }
      }
      
      if (targetFrameIndex === -1) return prev; // No rolls to undo

      const updatedFrames = [...frames];
      const targetFrame = { ...updatedFrames[targetFrameIndex] };
      
      // Remove last roll
      targetFrame.rolls = targetFrame.rolls.slice(0, -1);
      
      // Reset frame state
      targetFrame.isStrike = false;
      targetFrame.isSpare = false;
      targetFrame.isComplete = false;
      
      // Recalculate frame state based on remaining rolls
      if (targetFrameIndex < 9) {
        // Frames 1-9
        if (targetFrame.rolls.length === 1 && targetFrame.rolls[0] === 10) {
          targetFrame.isStrike = true;
          targetFrame.isComplete = true;
        } else if (targetFrame.rolls.length === 2) {
          const total = targetFrame.rolls.reduce((sum, roll) => sum + roll, 0);
          targetFrame.isSpare = total === 10;
          targetFrame.isComplete = true;
        }
      } else {
        // Frame 10
        if (targetFrame.rolls.length === 1 && targetFrame.rolls[0] === 10) {
          targetFrame.isStrike = true;
        } else if (targetFrame.rolls.length === 2 && targetFrame.rolls[0] !== 10) {
          const total = targetFrame.rolls[0] + targetFrame.rolls[1];
          if (total === 10) {
            targetFrame.isSpare = true;
          }
        }
        
        // Frame 10 completion rules
        if (targetFrame.rolls.length === 3) {
          targetFrame.isComplete = true;
        } else if (targetFrame.rolls.length === 2) {
          const firstRoll = targetFrame.rolls[0];
          const secondRoll = targetFrame.rolls[1];
          
          if (firstRoll === 10 || firstRoll + secondRoll === 10) {
            targetFrame.isComplete = false;
          } else {
            targetFrame.isComplete = true;
          }
        }
      }
      
      updatedFrames[targetFrameIndex] = targetFrame;
      
      // Recalculate scores
      const calculatedFrames = calculateBowlingScores(updatedFrames);
      const totalScore = calculatedFrames[calculatedFrames.length - 1]?.score || 0;

      const updatedPlayer = {
        ...activePlayer,
        bowlingFrames: calculatedFrames,
        score: totalScore,
      };

      const updatedPlayers = prev.players.map(player => 
        player.id === activePlayer.id ? updatedPlayer : player
      );

      // Check if game is still complete
      const gameComplete = calculatedFrames[9]?.isComplete || false;

      return {
        ...prev,
        players: updatedPlayers,
        status: gameComplete ? GameStatus.FINISHED : GameStatus.IN_PROGRESS,
        winner: gameComplete ? activePlayer.id : undefined,
        endTime: gameComplete ? new Date() : undefined,
      };
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
    addPins,
    undoBowlingRoll,
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
