import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Stack,
  Box,
} from '@mui/material';
import { AccessTime, SportsEsports } from '@mui/icons-material';
import { GameType } from '../../../types/index';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getGameTypeLabel, getGameDuration } from '../../../utils/victoryScreenUtils';
import { AppStyles } from '../../../constants/colors';
import type { GameVictoryContentProps } from './BaseVictoryScreenProps';

interface GameDetailsCardProps extends GameVictoryContentProps {
  showRackCount?: boolean;
}

const GameDetailsCard: React.FC<GameDetailsCardProps> = ({ 
  game, 
  showRackCount = false 
}) => {
  const { t, language } = useLanguage();

  return (
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
                  <Typography><strong>種目:</strong> {getGameTypeLabel(game.type, t)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime color="primary" />
                  <Typography>
                    <strong>プレイ時間:</strong> 
                    <span style={AppStyles.monoFont}>
                      {(() => {
                        const duration = getGameDuration(game, language);
                        return typeof duration === 'string' ? duration : duration.formatted;
                      })()}
                    </span>
                  </Typography>
                </Box>
                {showRackCount && game.type === GameType.ROTATION && (
                  <Typography><strong>ラック数:</strong> <span style={AppStyles.monoFont}>{game.totalRacks}</span></Typography>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default GameDetailsCard;