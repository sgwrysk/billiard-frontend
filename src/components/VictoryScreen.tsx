import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { 
  EmojiEvents, 
  Refresh, 
  Home, 
  AccessTime,
  SportsEsports
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useLanguage } from '../contexts/LanguageContext';
import type { Game } from '../types/index';
import { GameType } from '../types/index';
import { getBallColor } from '../utils/ballUtils';
import { UIColors, BowlardColors } from '../constants/colors';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface VictoryScreenProps {
  game: Game;
  onRematch: () => void;
  onBackToMenu: () => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({
  game,
  onRematch,
  onBackToMenu,
}) => {
  const { t, language } = useLanguage();
  const winner = game.players.find(p => p.id === game.winner);

  
  const getGameTypeLabel = (type: GameType) => {
    switch (type) {
      case GameType.SET_MATCH:
        return t('setup.gameType.setmatch');
      case GameType.ROTATION:
        return t('setup.gameType.rotation');
      case GameType.BOWLARD:
        return t('setup.gameType.bowlard');
      default:
        return type;
    }
  };

  const getGameDuration = () => {
    if (!game.endTime) return language === 'en' ? 'Unknown' : '不明';
    const duration = game.endTime.getTime() - game.startTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return language === 'en' ? `${minutes}m ${seconds}s` : `${minutes}分${seconds}秒`;
  };



  // Generate complete pocketed balls data from scoreHistory for ROTATION games, organized by rack
  const getCompletePocketedBallsByRack = () => {
    if (game.type !== GameType.ROTATION || !game.scoreHistory) {
      return [{
        rackNumber: 1,
        players: game.players.map(player => ({
          playerId: player.id,
          playerName: player.name,
          ballsPocketed: player.ballsPocketed || [],
        }))
      }];
    }

    // Sort score history by timestamp to get chronological order
    const sortedScoreHistory = [...game.scoreHistory].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Group balls by rack - we'll use ball number ranges to determine racks
    // Rack 1: balls 1-15, Rack 2: balls 1-15 again, etc.
    const rackData: { [rackNumber: number]: { [playerId: string]: number[] } } = {};
    let currentRack = 1;
    const ballsInCurrentRack = new Set<number>();
    
    // Initialize first rack
    rackData[currentRack] = {};
    game.players.forEach(player => {
      rackData[currentRack][player.id] = [];
    });

    sortedScoreHistory.forEach(entry => {
      const ballNumber = entry.score;
      if (ballNumber >= 1 && ballNumber <= 15) {
        // Check if this ball was already pocketed in current rack
        if (ballsInCurrentRack.has(ballNumber)) {
          // Start new rack
          currentRack++;
          ballsInCurrentRack.clear();
          rackData[currentRack] = {};
          game.players.forEach(player => {
            rackData[currentRack][player.id] = [];
          });
        }
        
        // Add ball to current rack
        ballsInCurrentRack.add(ballNumber);
        if (!rackData[currentRack][entry.playerId]) {
          rackData[currentRack][entry.playerId] = [];
        }
        rackData[currentRack][entry.playerId].push(ballNumber);
      }
    });

    // Convert to display format
    return Object.keys(rackData).map(rackNum => ({
      rackNumber: parseInt(rackNum),
      players: game.players.map(player => ({
        playerId: player.id,
        playerName: player.name,
        ballsPocketed: rackData[parseInt(rackNum)][player.id] || [],
      }))
    }));
  };




  const generateChartData = () => {
    if (game.type === GameType.BOWLARD) {
      return generateBowlardChartData();
    }

    if (game.type === GameType.ROTATION) {
      return generateRotationChartData();
    }

    if (!game.scoreHistory || game.scoreHistory.length === 0) {
      return null;
    }

    // For SET_MATCH games - use scoreHistory
    const playerColors = UIColors.chart.playerColors;
    const datasets = game.players.map((player, index) => {
      const playerScoreHistory = game.scoreHistory
        .filter(entry => entry.playerId === player.id)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      return {
        label: player.name,
        data: playerScoreHistory.map(entry => entry.score),
        borderColor: playerColors[index % playerColors.length],
        backgroundColor: playerColors[index % playerColors.length] + '20',
        tension: 0.1,
      };
    });

    // X-axis labels (shot numbers)
    const maxDataLength = Math.max(...datasets.map(d => d.data.length));
    const labels = Array.from({ length: maxDataLength }, (_, i) => `${i + 1}`);

    return {
      labels,
      datasets,
    };
  };

  // Generate chart data for Rotation game
  const generateRotationChartData = () => {
    // Check if we have score history data (works across all racks)
    if (!game.scoreHistory || game.scoreHistory.length === 0) {
      return null;
    }

    // Sort score entries by timestamp to get chronological order
    const sortedScoreHistory = [...game.scoreHistory].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Group consecutive shots by the same player into innings
    const innings: { playerId: string; totalScore: number; timestamp: Date }[] = [];
    let currentInning: { playerId: string; shots: Array<{ playerId: string; score: number; timestamp: Date }>; startTime: Date } | null = null;

    sortedScoreHistory.forEach(entry => {
      // For rotation, each entry represents a pocketed ball
      if (!currentInning || currentInning.playerId !== entry.playerId) {
        // Finalize previous inning if exists
        if (currentInning && (currentInning as any).shots.length > 0) {
          const inningTotal = (currentInning as any).shots.reduce((sum: number, shot: { score: number }) => sum + shot.score, 0);
          innings.push({
            playerId: (currentInning as any).playerId,
            totalScore: inningTotal,
            timestamp: (currentInning as any).startTime,
          });
        }
        
        // Start new inning
        currentInning = { 
          playerId: entry.playerId, 
          shots: [entry],
          startTime: entry.timestamp
        };
      } else {
        // Continue current inning
        currentInning.shots.push(entry);
      }
    });

    // Add the last inning if exists
    if (currentInning && (currentInning as any).shots.length > 0) {
      const inningTotal = (currentInning as any).shots.reduce((sum: number, shot: { score: number }) => sum + shot.score, 0);
      innings.push({
        playerId: (currentInning as any).playerId,
        totalScore: inningTotal,
        timestamp: (currentInning as any).startTime,
      });
    }

    if (innings.length === 0) {
      return null;
    }

    // Calculate cumulative scores for each player by inning
    const playerColors = UIColors.chart.playerColors;
    const playerCumulativeScores: { [playerId: string]: number[] } = {};
    const playerLabels: { [playerId: string]: string } = {};
    
    // Initialize scores and labels for all players
    game.players.forEach(player => {
      playerCumulativeScores[player.id] = [0]; // Start with 0 score
      playerLabels[player.id] = player.name;
    });

    // Calculate scores for each inning
    innings.forEach((inning) => {
      game.players.forEach(player => {
        const lastScore = playerCumulativeScores[player.id][playerCumulativeScores[player.id].length - 1] || 0;
        
        if (player.id === inning.playerId) {
          // This player scored in this inning
          playerCumulativeScores[player.id].push(lastScore + inning.totalScore);
        } else {
          // Other players keep their previous score
          playerCumulativeScores[player.id].push(lastScore);
        }
      });
    });

    // Create datasets for Chart.js
    const datasets = game.players.map((player, index) => ({
      label: playerLabels[player.id],
      data: playerCumulativeScores[player.id],
      borderColor: playerColors[index % playerColors.length],
      backgroundColor: playerColors[index % playerColors.length] + '20',
      tension: 0.1,
    }));

    // Create labels (inning numbers)
    const labels = ['Start', ...Array.from({ length: innings.length }, (_, i) => `イニング${i + 1}`)];

    return {
      labels,
      datasets,
    };
  };

  // Generate chart data for Bowlard game
  const generateBowlardChartData = () => {
    const player = game.players[0];
    if (!player?.bowlingFrames) {
      return null;
    }

    const completedFrames = player.bowlingFrames.filter(frame => frame.isComplete);
    if (completedFrames.length === 0) {
      return null;
    }

    // Create data points for completed frames
    const labels = completedFrames.map(frame => `${frame.frameNumber}`);
    const scores = completedFrames.map(frame => frame.score || 0);

    return {
      labels,
      datasets: [
        {
          label: player.name,
          data: scores,
          borderColor: UIColors.chart.primary,
          backgroundColor: UIColors.chart.primaryBackground,
          tension: 0.1,
          fill: true,
        },
      ],
    };
  };

  // Calculate actual sets won for a player from scoreHistory
  const calculateActualSetsWon = (playerId: string) => {
    if (game.type !== GameType.SET_MATCH || !game.scoreHistory || game.scoreHistory.length === 0) {
      return game.players.find(p => p.id === playerId)?.setsWon || 0;
    }
    
    // Count set wins from scoreHistory for this player
    return game.scoreHistory
      .filter(entry => entry.score === 1 && entry.playerId === playerId)
      .length;
  };

  // Generate set history table for Set Match
  const generateSetHistoryTable = () => {
    if (game.type !== GameType.SET_MATCH || !game.scoreHistory || game.scoreHistory.length === 0) {
      return null;
    }

    // Get all set wins in chronological order
    // Set match entries are those with score: 1 (indicating a set win)
    const setWins = game.scoreHistory
      .filter(entry => entry.score === 1) // Set match entries have score: 1
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const totalSetsPlayed = setWins.length; // Total number of sets played
    
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.50' }}>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>
                {t('victory.player')}
              </TableCell>
              {Array.from({ length: totalSetsPlayed }, (_, i) => (
                <TableCell key={i + 1} align="center" sx={{ fontWeight: 'bold', minWidth: 50 }}>
                  {i + 1}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {game.players.map(player => (
              <TableRow key={player.id}>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                  {player.name}
                </TableCell>
                {Array.from({ length: totalSetsPlayed }, (_, setIndex) => {
                  const setNumber = setIndex + 1;
                  const isWinner = setWins[setIndex]?.playerId === player.id;
                  
                  return (
                    <TableCell key={setNumber} align="center">
                      {isWinner ? (
                        <Typography variant="h6" color="success.main">
                          ⭕
                        </Typography>
                      ) : (
                        <Typography variant="h6" color="grey.300">
                          ⚪
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        display: game.type !== GameType.BOWLARD, // Hide legend for single-player Bowlard
      },
      title: {
        display: true,
        text: t('victory.scoreProgression'),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: t('game.score'),
        },
      },
      x: {
        title: {
          display: true,
          text: game.type === GameType.BOWLARD ? 'フレーム' : game.type === GameType.ROTATION ? 'イニング' : 'ショット数',
        },
      },
    },
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* 勝利アナウンス（ボーラード以外のみ） */}
      {game.type !== GameType.BOWLARD && (
        <Card sx={{ mb: 3, bgcolor: 'success.50', border: '2px solid', borderColor: 'success.main' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <EmojiEvents sx={{ fontSize: 80, color: 'gold', mb: 2 }} />
            {winner && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'success.main',
                    width: 64,
                    height: 64,
                    fontSize: '2rem'
                  }}
                >
                  {winner.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h2">
                    {winner.name}
                  </Typography>

                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* ボーラード用のボーリングスコア詳細（ゲーム詳細の上に移動） */}
      {game.type === GameType.BOWLARD && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('setup.gameType.bowlard')} - {t('victory.finalScore')}: {game.players[0]?.score || 0}
            </Typography>
            
            {/* ボーリングスコアシート（表形式） */}
            {/* Desktop Layout */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1.5fr',
                border: `2px solid ${UIColors.border.dark}`
              }}>
                {/* Frame headers */}
                {Array.from({ length: 10 }, (_, i) => (
                  <Box 
                    key={`frame-${i}`}
                    sx={{ 
                      borderRight: i === 9 ? 'none' : `1px solid ${UIColors.border.dark}`,
                      borderBottom: `1px solid ${UIColors.border.dark}`,
                      padding: '8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      backgroundColor: BowlardColors.number.background
                    }}
                  >
                    {i + 1}
                  </Box>
                ))}
                
                {/* Roll results */}
                {Array.from({ length: 10 }, (_, frameIndex) => {
                  const frame = game.players[0]?.bowlingFrames?.[frameIndex];
                  
                  const renderRollResult = (frame: any, rollIndex: number) => {
                    const roll = frame?.rolls[rollIndex];
                    if (roll === undefined) return '';
                    
                    if (frameIndex === 9) {
                      // 10フレーム目
                      if (rollIndex === 0) {
                        return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
                      } else if (rollIndex === 1) {
                        if (frame.rolls[0] === 10) {
                          return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
                        } else {
                          return (frame.rolls[0] + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
                        }
                      } else {
                        const firstRoll = frame.rolls[0];
                        const secondRoll = frame.rolls[1];
                        
                        if (firstRoll === 10) {
                          if (secondRoll === 10) {
                            return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
                          } else {
                            return (secondRoll + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
                          }
                        } else {
                          return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
                        }
                      }
                    } else {
                      // 1-9フレーム
                      if (rollIndex === 0) {
                        return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
                      } else {
                        return (frame.rolls[0] + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
                      }
                    }
                  };
                  
                  return (
                    <Box 
                      key={`rolls-${frameIndex}`}
                      sx={{ 
                        borderRight: frameIndex === 9 ? 'none' : `1px solid ${UIColors.border.dark}`,
                        display: 'flex',
                        minHeight: '40px'
                      }}
                    >
                      {frameIndex === 9 ? (
                        // 10フレーム目 (3投分)
                        <>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${UIColors.border.dark}` }}>
                            {frame ? renderRollResult(frame, 0) : ''}
                          </Box>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${UIColors.border.dark}` }}>
                            {frame ? renderRollResult(frame, 1) : ''}
                          </Box>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {frame ? renderRollResult(frame, 2) : ''}
                          </Box>
                        </>
                      ) : (
                        // 1-9フレーム目 (2投分)
                        <>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${UIColors.border.dark}` }}>
                            {frame ? renderRollResult(frame, 0) : ''}
                          </Box>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {frame ? renderRollResult(frame, 1) : ''}
                          </Box>
                        </>
                      )}
                    </Box>
                  );
                })}
                
                {/* Cumulative scores */}
                {Array.from({ length: 10 }, (_, i) => {
                  const frame = game.players[0]?.bowlingFrames?.[i];
                  return (
                    <Box 
                      key={`score-${i}`}
                      sx={{ 
                        borderRight: i === 9 ? 'none' : `1px solid ${UIColors.border.dark}`,
                        padding: '8px',
                        textAlign: 'center',
                        borderTop: `1px solid ${UIColors.border.dark}`,
                        fontWeight: 'bold',
                        minHeight: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {frame?.isComplete && frame?.score !== undefined ? frame.score : ''}
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Mobile Layout (2 rows) */}
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              {/* 1-5 frames */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                  border: `2px solid ${UIColors.border.dark}`
                }}>
                  {/* Frame headers 1-5 */}
                  {Array.from({ length: 5 }, (_, i) => (
                    <Box 
                      key={`frame-${i}`}
                      sx={{ 
                        borderRight: i === 4 ? 'none' : `1px solid ${UIColors.border.dark}`,
                        borderBottom: `1px solid ${UIColors.border.dark}`,
                        padding: '8px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        backgroundColor: BowlardColors.number.background
                      }}
                    >
                      {i + 1}
                    </Box>
                  ))}
                  
                  {/* Roll results 1-5 */}
                  {Array.from({ length: 5 }, (_, frameIndex) => {
                    const frame = game.players[0]?.bowlingFrames?.[frameIndex];
                    
                    const renderRollResult = (frame: any, rollIndex: number) => {
                      const roll = frame?.rolls[rollIndex];
                      if (roll === undefined) return '';
                      
                      if (rollIndex === 0) {
                        return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
                      } else {
                        return (frame.rolls[0] + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
                      }
                    };
                    
                    return (
                      <Box 
                        key={`rolls-${frameIndex}`}
                        sx={{ 
                          borderRight: frameIndex === 4 ? 'none' : `1px solid ${UIColors.border.dark}`,
                          display: 'flex',
                          minHeight: '40px'
                        }}
                      >
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${UIColors.border.dark}` }}>
                          {frame ? renderRollResult(frame, 0) : ''}
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {frame ? renderRollResult(frame, 1) : ''}
                        </Box>
                      </Box>
                    );
                  })}
                  
                  {/* Cumulative scores 1-5 */}
                  {Array.from({ length: 5 }, (_, i) => {
                    const frame = game.players[0]?.bowlingFrames?.[i];
                    return (
                      <Box 
                        key={`score-${i}`}
                        sx={{ 
                          borderRight: i === 4 ? 'none' : `1px solid ${UIColors.border.dark}`,
                          padding: '8px',
                          textAlign: 'center',
                          borderTop: `1px solid ${UIColors.border.dark}`,
                          fontWeight: 'bold',
                          minHeight: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {frame?.isComplete && frame?.score !== undefined ? frame.score : ''}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
              
              {/* 6-10 frames */}
              <Box>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr 1.5fr',
                  border: `2px solid ${UIColors.border.dark}`
                }}>
                  {/* Frame headers 6-10 */}
                  {Array.from({ length: 5 }, (_, i) => (
                    <Box 
                      key={`frame-${i + 5}`}
                      sx={{ 
                        borderRight: i === 4 ? 'none' : `1px solid ${UIColors.border.dark}`,
                        borderBottom: `1px solid ${UIColors.border.dark}`,
                        padding: '8px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        backgroundColor: BowlardColors.number.background
                      }}
                    >
                      {i + 6}
                    </Box>
                  ))}
                  
                  {/* Roll results 6-10 */}
                  {Array.from({ length: 5 }, (_, i) => {
                    const frameIndex = i + 5;
                    const frame = game.players[0]?.bowlingFrames?.[frameIndex];
                    
                    const renderRollResult = (frame: any, rollIndex: number) => {
                      const roll = frame?.rolls[rollIndex];
                      if (roll === undefined) return '';
                      
                      if (frameIndex === 9) {
                        // 10フレーム目
                        if (rollIndex === 0) {
                          return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
                        } else if (rollIndex === 1) {
                          if (frame.rolls[0] === 10) {
                            return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
                          } else {
                            return (frame.rolls[0] + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
                          }
                        } else {
                          const firstRoll = frame.rolls[0];
                          const secondRoll = frame.rolls[1];
                          
                          if (firstRoll === 10) {
                            if (secondRoll === 10) {
                              return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
                            } else {
                              return (secondRoll + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
                            }
                          } else {
                            return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
                          }
                        }
                      } else {
                        // 6-9フレーム
                        if (rollIndex === 0) {
                          return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
                        } else {
                          return (frame.rolls[0] + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
                        }
                      }
                    };
                    
                    return (
                      <Box 
                        key={`rolls-${frameIndex}`}
                        sx={{ 
                          borderRight: i === 4 ? 'none' : `1px solid ${UIColors.border.dark}`,
                          display: 'flex',
                          minHeight: '40px'
                        }}
                      >
                        {frameIndex === 9 ? (
                          // 10フレーム目 (3投分)
                          <>
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${UIColors.border.dark}` }}>
                              {frame ? renderRollResult(frame, 0) : ''}
                            </Box>
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${UIColors.border.dark}` }}>
                              {frame ? renderRollResult(frame, 1) : ''}
                            </Box>
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {frame ? renderRollResult(frame, 2) : ''}
                            </Box>
                          </>
                        ) : (
                          // 6-9フレーム目 (2投分)
                          <>
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${UIColors.border.dark}` }}>
                              {frame ? renderRollResult(frame, 0) : ''}
                            </Box>
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {frame ? renderRollResult(frame, 1) : ''}
                            </Box>
                          </>
                        )}
                      </Box>
                    );
                  })}
                  
                  {/* Cumulative scores 6-10 */}
                  {Array.from({ length: 5 }, (_, i) => {
                    const frameIndex = i + 5;
                    const frame = game.players[0]?.bowlingFrames?.[frameIndex];
                    return (
                      <Box 
                        key={`score-${frameIndex}`}
                        sx={{ 
                          borderRight: i === 4 ? 'none' : `1px solid ${UIColors.border.dark}`,
                          padding: '8px',
                          textAlign: 'center',
                          borderTop: `1px solid ${UIColors.border.dark}`,
                          fontWeight: 'bold',
                          minHeight: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {frame?.isComplete && frame?.score !== undefined ? frame.score : ''}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ゲーム詳細情報 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            ゲーム詳細
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={game.type === GameType.BOWLARD ? 12 : 6}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                  ゲーム情報
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SportsEsports color="primary" />
                    <Typography><strong>種目:</strong> {getGameTypeLabel(game.type)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime color="primary" />
                    <Typography><strong>プレイ時間:</strong> {getGameDuration()}</Typography>
                  </Box>
                  {game.type === GameType.ROTATION && (
                    <Typography><strong>ラック数:</strong> {game.totalRacks}</Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>

            {/* 最終スコア枠（ボーラード以外のみ） */}
            {game.type !== GameType.BOWLARD && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" gutterBottom>
                    最終スコア
                  </Typography>
                  <Stack spacing={2}>
                    {game.players.map(player => (
                        <Box 
                          key={player.id}
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1,
                            borderRadius: 1,
                            bgcolor: player.id === game.winner ? 'success.100' : 'white',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6">
                              {player.name}
                              {player.id === game.winner && ' 👑'}
                            </Typography>
                          </Box>
                          <Typography variant="h6" color="primary">
                            {game.type === GameType.SET_MATCH 
                              ? `${calculateActualSetsWon(player.id)}セット` 
                              : `${player.score}点`
                            }
                          </Typography>
                        </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* セットマッチ: セット獲得履歴テーブル */}
      {game.type === GameType.SET_MATCH && generateSetHistoryTable() && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('victory.setHistory')}
            </Typography>
            {generateSetHistoryTable()}
          </CardContent>
        </Card>
      )}

      {/* その他のゲーム: スコア推移グラフ */}
      {game.type !== GameType.SET_MATCH && generateChartData() && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('victory.scoreProgression')}
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={generateChartData()!} options={chartOptions} />
            </Box>
          </CardContent>
        </Card>
      )}



      {/* ポケットしたボール詳細（セットマッチ・ボーラード以外） */}
      {game.type !== GameType.SET_MATCH && game.type !== GameType.BOWLARD && (() => {
        const rackData = getCompletePocketedBallsByRack();
        return (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ポケットしたボール
              </Typography>
              {rackData.map(rack => (
                <Box key={rack.rackNumber} sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    ラック {rack.rackNumber}
                  </Typography>
                  {rack.players.map(playerData => (
                    <Box key={playerData.playerId} sx={{ mb: 2, ml: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {playerData.playerName} ({playerData.ballsPocketed.length}個)
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, ml: 1 }}>
                        {playerData.ballsPocketed.length > 0 ? (
                          playerData.ballsPocketed.map(ball => (
                            <Chip
                              key={ball}
                              label={ball}
                              sx={{
                                width: 36,
                                height: 36,
                          borderRadius: '50%',
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          position: 'relative',
                          overflow: 'hidden',
                          border: 'none',
                          
                          // Base background for all balls
                          background: ball > 8 
                            ? `linear-gradient(to bottom, white 0%, white 20%, ${getBallColor(ball)} 20%, ${getBallColor(ball)} 80%, white 80%, white 100%)`
                            : `radial-gradient(circle at 30% 30%, ${getBallColor(ball)}dd, ${getBallColor(ball)} 70%)`,
                          
                          boxShadow: '0 3px 8px rgba(0,0,0,0.3), inset -1px -1px 2px rgba(0,0,0,0.1), inset 1px 1px 2px rgba(255,255,255,0.3)',
                          
                          // White circle background for number
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
                            zIndex: 1,
                          },
                          
                          '& .MuiChip-label': {
                            padding: 0,
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            position: 'relative',
                            zIndex: 2,
                            color: UIColors.text.black,
                          },
                          
                          // Prevent hover color changes - keep original background
                          '&:hover': {
                            background: ball > 8 
                              ? `linear-gradient(to bottom, white 0%, white 20%, ${getBallColor(ball)} 20%, ${getBallColor(ball)} 80%, white 80%, white 100%) !important`
                              : `radial-gradient(circle at 30% 30%, ${getBallColor(ball)}dd, ${getBallColor(ball)} 70%) !important`,
                            '& .MuiChip-label': {
                              color: `${UIColors.text.black} !important`,
                            }
                          },
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      ポケットしたボールなし
                    </Typography>
                  )}
                                        </Box>
                      </Box>
                    ))}
                  {rack !== rackData[rackData.length - 1] && <Divider sx={{ mt: 3 }} />}
                </Box>
              ))}
          </CardContent>
        </Card>
        );
      })()}

      {/* アクションボタン */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Refresh />}
              onClick={onRematch}
            >
              再戦する
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              size="large"
              startIcon={<Home />}
              onClick={onBackToMenu}
            >
              メニューに戻る
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default VictoryScreen;
