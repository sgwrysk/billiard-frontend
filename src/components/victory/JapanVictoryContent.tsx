import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Stack,
  Grid,
} from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { NumberInputStepper } from '../common';
import JapanCumulativePointsTable from '../games/japan/JapanCumulativePointsTable';
import JapanScoreChart from '../games/japan/JapanScoreChart';
import { AppStyles } from '../../constants/colors';
import type { GameVictoryContentProps } from './common';

const JapanVictoryContent: React.FC<GameVictoryContentProps> = ({ game }) => {
  const { t } = useLanguage();
  
  // Multiplier state for Japan Rule final score calculation
  const [multiplier, setMultiplier] = useState(1);

  // Get final cumulative points for Japan games
  const getJapanFinalScore = (playerId: string) => {
    // If there's no rack history, return 0
    if (!game.japanRackHistory || game.japanRackHistory.length === 0) {
      return 0;
    }
    
    // Get the latest rack result
    const lastRackResult = game.japanRackHistory[game.japanRackHistory.length - 1];
    const playerResult = lastRackResult?.playerResults.find(result => result.playerId === playerId);
    
    const baseScore = playerResult?.totalPoints || 0;
    return Math.round(baseScore * multiplier);
  };

  return (
    <Box>
      {/* Game Details with Japan-specific final scores */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            ゲーム詳細
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                  ゲーム情報
                </Typography>
                <Stack spacing={1}>
                  <Typography><strong>種目:</strong> {t('setup.gameType.japan')}</Typography>
                  <Typography>
                    <strong>プレイ時間:</strong> 
                    {(() => {
                      if (!game.endTime) return '不明';
                      const duration = game.endTime.getTime() - game.startTime.getTime();
                      const minutes = Math.floor(duration / 60000);
                      const seconds = Math.floor((duration % 60000) / 1000);
                      return <span style={AppStyles.monoFont}>{minutes}分{seconds}秒</span>;
                    })()}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    最終スコア
                  </Typography>
                  <NumberInputStepper
                    value={multiplier}
                    onChange={setMultiplier}
                    min={1}
                    max={999}
                    step={1}
                  />
                </Box>
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
                        {(() => {
                          const finalScore = getJapanFinalScore(player.id);
                          return (
                            <span 
                              style={{
                                ...AppStyles.monoFont, 
                                color: finalScore > 0 ? '#1976d2' : finalScore < 0 ? '#d32f2f' : 'inherit'
                              }}
                            >
                              {finalScore}点
                            </span>
                          );
                        })()}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Japan Cumulative Points Table */}
      <Box sx={{ mb: 4 }}>
        <JapanCumulativePointsTable 
          game={game} 
          shouldShowCumulativePoints={() => true}
          defaultDisplayMode="fullDisplay"
        />
      </Box>

      {/* Japan Score Chart */}
      <Box sx={{ mb: 3 }}>
        <JapanScoreChart 
          game={game} 
          height={300}
          showTitle={false}
          showCard={true}
        />
      </Box>
    </Box>
  );
};

export default JapanVictoryContent;