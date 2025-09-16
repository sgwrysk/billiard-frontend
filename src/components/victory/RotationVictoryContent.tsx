import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
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
import { useLanguage } from '../../contexts/LanguageContext';
import { getBallColor } from '../../utils/ballUtils';
import { UIColors, AppStyles, AppColors } from '../../constants/colors';
import { getBaseChartOptions } from '../../utils/victoryScreenUtils';
import type { GameVictoryContentProps } from './common';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RotationVictoryContent: React.FC<GameVictoryContentProps> = ({ game }) => {
  const { t } = useLanguage();
  const winner = game.players.find(p => p.id === game.winner);

  // Generate complete pocketed balls data from scoreHistory for ROTATION games, organized by rack
  const getCompletePocketedBallsByRack = () => {
    if (!game.scoreHistory) {
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

  // Generate chart data for Rotation game
  const generateRotationChartData = () => {
    // Check if we have score history data (works across all racks)
    if (!game.scoreHistory || game.scoreHistory.length === 0) {
      return null;
    }

    // Sort score entries by timestamp to get chronological order
    const sortedScoreHistory = [...game.scoreHistory].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Group consecutive shots by the same player into innings
    type InningType = { playerId: string; shots: Array<{ playerId: string; score: number; timestamp: Date }>; startTime: Date };
    const innings: { playerId: string; totalScore: number; timestamp: Date }[] = [];
    let currentInning: InningType | null = null;

    sortedScoreHistory.forEach(entry => {
      // For rotation, each entry represents a pocketed ball
      if (!currentInning || currentInning.playerId !== entry.playerId) {
        // Finalize previous inning if exists
        if (currentInning && currentInning.shots.length > 0) {
          const inningTotal = currentInning.shots.reduce((sum: number, shot: { score: number }) => sum + shot.score, 0);
          innings.push({
            playerId: currentInning.playerId,
            totalScore: inningTotal,
            timestamp: currentInning.startTime,
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
    if (currentInning) {
      const finalInning = currentInning as InningType;
      if (finalInning.shots.length > 0) {
        const inningTotal = finalInning.shots.reduce((sum: number, shot: { score: number }) => sum + shot.score, 0);
        innings.push({
          playerId: finalInning.playerId,
          totalScore: inningTotal,
          timestamp: finalInning.startTime,
        });
      }
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
    const labels = ['Start', ...Array.from({ length: innings.length }, (_, i) => `Inning ${i + 1}`)];

    return {
      labels,
      datasets,
    };
  };

  const rackData = getCompletePocketedBallsByRack();
  const chartData = generateRotationChartData();
  const chartOptions = getBaseChartOptions(t, game);

  return (
    <Box>
      {/* Victory announcement */}
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

      {/* Score Progression Chart */}
      {chartData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('victory.scoreProgression')}
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Pocketed Balls Details */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ポケットしたボール
          </Typography>
          {rackData.map(rack => (
            <Box key={rack.rackNumber} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                ラック <span style={AppStyles.monoFont}>{rack.rackNumber}</span>
              </Typography>
              {rack.players.map(playerData => (
                <Box key={playerData.playerId} sx={{ mb: 2, ml: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {playerData.playerName} (<span style={AppStyles.monoFont}>{playerData.ballsPocketed.length}</span>個)
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
                            
                            boxShadow: `0 3px 8px ${AppColors.effects.shadow.dark}, inset -1px -1px 2px ${AppColors.effects.shadow.light}, inset 1px 1px 2px rgba(255,255,255,0.3)`,
                            
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
                              boxShadow: UIColors.shadow.inset,
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
    </Box>
  );
};

export default RotationVictoryContent;