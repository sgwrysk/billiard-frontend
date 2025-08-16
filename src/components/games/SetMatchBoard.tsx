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
import { getBallColor } from '../../utils/ballUtils';

interface SetMatchBoardProps {
  game: Game;
  onPocketBall: (ballNumber: number) => void;
  onSwitchPlayer: () => void;
  onResetRack: () => void;
  onWinSet: (playerId: string) => void;
  onUndoLastShot: () => void;
}

export const SetMatchBoard: React.FC<SetMatchBoardProps> = ({
  game,
  onPocketBall,
  onSwitchPlayer,
  onResetRack,
  onWinSet,
  onUndoLastShot,
}) => {
  const { t } = useLanguage();
  // const currentPlayer = game.players[game.currentPlayerIndex];
  
  const ballNumbers = Array.from({ length: 9 }, (_, i) => i + 1);
  
  const isBallPocketed = (ballNumber: number) => {
    return game.players.some(player => 
      player.ballsPocketed.includes(ballNumber)
    );
  };

  return (
    <Box>
      {/* Player Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {game.players.map((player) => (
          <Grid item xs={12} sm={6} key={player.id}>
            <Card 
              elevation={player.isActive ? 6 : 2}
              sx={{
                border: player.isActive ? '2px solid #1976d2' : '1px solid #e0e0e0',
                transform: player.isActive ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <CardContent>
                <Typography variant="h6">{player.name}</Typography>
                <Typography variant="h4" color="primary">
                  {player.score}
                </Typography>
                {player.targetSets && (
                  <Typography variant="body2" color="text.secondary">
                    {t('game.targetSets')}: {player.targetSets}
                  </Typography>
                )}
                {player.setsWon !== undefined && (
                  <Typography variant="body2" color="success.main">
                    {t('game.setsWon')}: {player.setsWon}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onWinSet(player.id)}
                  sx={{ mt: 1 }}
                >
                  {t('game.winSet')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Ball Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('game.ballSelect')}
          </Typography>
          <Grid container spacing={1}>
            {ballNumbers.map((ballNumber) => (
              <Grid item key={ballNumber}>
                <Button
                  variant="contained"
                  disabled={isBallPocketed(ballNumber)}
                  onClick={() => onPocketBall(ballNumber)}
                  sx={{
                    width: { xs: 60, sm: 52 },
                    height: { xs: 60, sm: 52 },
                    minWidth: { xs: 60, sm: 52 },
                    borderRadius: '50%',
                    fontWeight: 'bold',
                    fontSize: { xs: '1.2rem', sm: '1.1rem' },
                    position: 'relative',
                    overflow: 'hidden',
                    border: 'none',
                    padding: 0,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    ...(isBallPocketed(ballNumber)
                      ? { background: 'linear-gradient(145deg, #e6e6e6, #cccccc)' }
                      : ballNumber > 8
                        ? { background: `linear-gradient(to bottom, white 0%, white 20%, ${getBallColor(ballNumber)} 20%, ${getBallColor(ballNumber)} 80%, white 80%, white 100%)` }
                        : { background: `radial-gradient(circle at 30% 30%, ${getBallColor(ballNumber)}dd, ${getBallColor(ballNumber)} 70%)` }
                    ),
                    boxShadow: isBallPocketed(ballNumber)
                      ? 'inset 2px 2px 4px rgba(0,0,0,0.2)'
                      : '0 4px 12px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.1), inset 2px 2px 4px rgba(255,255,255,0.3)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: { xs: '32px', sm: '28px' },
                      height: { xs: '32px', sm: '28px' },
                      backgroundColor: isBallPocketed(ballNumber) ? '#ddd' : 'white',
                      borderRadius: '50%',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
                      zIndex: 1,
                    },
                    color: isBallPocketed(ballNumber) ? '#999' : '#000',
                    '&:hover': {
                      transform: 'scale(1.08)',
                      boxShadow: isBallPocketed(ballNumber)
                        ? 'inset 2px 2px 4px rgba(0,0,0,0.2)'
                        : '0 6px 16px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.1), inset 2px 2px 4px rgba(255,255,255,0.4)',
                      '& span': {
                        transform: 'scale(1.15)',
                        color: isBallPocketed(ballNumber) ? '#999 !important' : '#000 !important',
                      }
                    },
                    '& > span': {
                      position: 'relative',
                      zIndex: 3,
                      transition: 'transform 0.2s ease',
                    },
                  }}
                >
                  <span>{ballNumber}</span>
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={onSwitchPlayer}
          >
            {t('game.switchPlayer')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={onResetRack}
          >
            {t('game.resetRack')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={onUndoLastShot}
            disabled={game.shotHistory.length === 0}
          >
            {t('game.undo')}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
