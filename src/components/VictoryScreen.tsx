import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Stack,
} from '@mui/material';
import { 
  AccessTime,
  SportsEsports,
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import type { Game } from '../types/index';
import { GameType } from '../types/index';
import { AppStyles } from '../constants/colors';
import BowlardVictoryContent from './victory/BowlardVictoryContent';
import SetMatchVictoryContent from './victory/SetMatchVictoryContent';
import RotationVictoryContent from './victory/RotationVictoryContent';
import JapanVictoryContent from './victory/JapanVictoryContent';
import { ActionButtons } from './victory/common';

interface VictoryScreenProps {
  game: Game;
  onRematch: () => void;
  onBackToMenu: () => void;
  onReturnToGame: () => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({
  game,
  onRematch,
  onBackToMenu,
  onReturnToGame,
}) => {
  const { t, language } = useLanguage();
  
  const getGameTypeLabel = (type: GameType) => {
    switch (type) {
      case GameType.SET_MATCH:
        return t('setup.gameType.setmatch');
      case GameType.ROTATION:
        return t('setup.gameType.rotation');
      case GameType.BOWLARD:
        return t('setup.gameType.bowlard');
      case GameType.JAPAN:
        return t('setup.gameType.japan');
      default:
        return type;
    }
  };

  const getGameDuration = () => {
    if (!game.endTime) return language === 'en' ? 'Unknown' : '不明';
    const duration = game.endTime.getTime() - game.startTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return language === 'en' ? (<span style={AppStyles.monoFont}>{minutes}m {seconds}s</span>) : (<span style={AppStyles.monoFont}>{minutes}分{seconds}秒</span>);
  };


  const calculateActualSetsWon = (playerId: string) => {
    if (game.type !== GameType.SET_MATCH || !game.scoreHistory) {
      return 0;
    }
    
    return game.scoreHistory
      .filter(entry => entry.score === 1 && entry.playerId === playerId)
      .length;
  };


  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* ゲーム詳細情報 - First for non-Japan games */}
      {game.type !== GameType.JAPAN && (
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
                      <Typography><strong>ラック数:</strong> <span style={AppStyles.monoFont}>{game.totalRacks}</span></Typography>
                    )}
                  </Stack>
                </Paper>
              </Grid>

              {game.type !== GameType.BOWLARD && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        最終スコア
                      </Typography>
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
                              {game.type === GameType.SET_MATCH 
                                ? <span style={AppStyles.monoFont}>{`${calculateActualSetsWon(player.id)}セット`}</span>
                                : <span style={AppStyles.monoFont}>{`${player.score}点`}</span>
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
      )}

      {/* SET_MATCH Victory Content */}
      {game.type === GameType.SET_MATCH && (
        <SetMatchVictoryContent game={game} />
      )}

      {/* BOWLARD Victory Content */}
      {game.type === GameType.BOWLARD && (
        <BowlardVictoryContent game={game} />
      )}

      {/* ROTATION Victory Content */}
      {game.type === GameType.ROTATION && (
        <RotationVictoryContent game={game} />
      )}

      {/* JAPAN Victory Content */}
      {game.type === GameType.JAPAN && (
        <JapanVictoryContent game={game} />
      )}


      {/* Action buttons */}
      <ActionButtons
        onRematch={onRematch}
        onBackToMenu={onBackToMenu}
        onReturnToGame={onReturnToGame}
      />
    </Box>
  );
};

export default VictoryScreen;