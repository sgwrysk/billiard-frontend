import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Game } from '../../types/index';
import { UIColors, GameColors } from '../../constants/colors';

interface SetMatchBoardProps {
  game: Game;
  onWinSet: (playerId: string) => void;
  onUndoLastShot: () => void;
}

export const SetMatchBoard: React.FC<SetMatchBoardProps> = ({
  game,
  onWinSet,
  onUndoLastShot,
}) => {
  const { t } = useLanguage();

  return (
    <Box>
      {/* Player Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {game.players.map((player) => (
          <Grid item xs={12} sm={6} key={player.id}>
            <Card 
              elevation={player.isActive ? 6 : 2}
              onClick={() => onWinSet(player.id)}
              sx={{
                border: player.isActive ? `2px solid ${GameColors.playerSelected.background}` : GameColors.playerUnselected.border,
                transform: player.isActive ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: UIColors.hover.lightBackground,
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                },
                '&:active': {
                  transform: 'scale(0.98)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{player.name}</Typography>
                <Typography 
                  color="primary"
                  sx={{ 
                    fontSize: { xs: '4rem', sm: '5rem', md: '6rem' },
                    fontWeight: 'bold',
                    lineHeight: 1,
                    textAlign: 'center',
                    my: 2
                  }}
                >
                  {player.setsWon || 0}
                </Typography>
                {player.targetSets && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {t('game.targetSets')}: {player.targetSets}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Action Buttons */}
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={onUndoLastShot}
            disabled={game.scoreHistory.length === 0}
          >
            {t('game.undo')}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};