import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Slide,
} from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Game } from '../../types/index';
import { getBallColor } from '../../utils/ballUtils';

interface RotationBoardProps {
  game: Game;
  onPocketBall: (ballNumber: number) => void;
  onSwitchPlayer: () => void;
  onUndoLastShot: () => void;
}

export const RotationBoard: React.FC<RotationBoardProps> = ({
  game,
  onPocketBall,
  onSwitchPlayer,
  onUndoLastShot,
}) => {
  const { t } = useLanguage();
  const currentPlayer = game.players[game.currentPlayerIndex];
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const ballSectionRef = useRef<HTMLDivElement>(null);
  
  const ballNumbers = Array.from({ length: 15 }, (_, i) => i + 1);
  
  // Scroll monitoring for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (ballSectionRef.current) {
        const rect = ballSectionRef.current.getBoundingClientRect();
        setShowStickyHeader(rect.top < 300);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const isBallPocketed = (ballNumber: number) => {
    return game.players.some(player => 
      player.ballsPocketed.includes(ballNumber)
    );
  };
  
  const getRemainingScore = (player: any) => {
    if (!player.targetScore) return 0;
    return Math.max(0, player.targetScore - player.score);
  };

  return (
    <Box>
      {/* Sticky Header for Current Player */}
      <Slide direction="down" in={showStickyHeader} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            p: 2,
            backgroundColor: 'white',
            borderBottom: '1px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
            <Typography variant="h6" sx={{ color: 'black', fontWeight: 'bold' }}>
              {currentPlayer.name}
            </Typography>
            <Typography variant="body1" sx={{ color: 'black' }}>
              {currentPlayer.score}/{currentPlayer.targetScore || 0} ({t('game.remaining')}: {getRemainingScore(currentPlayer)})
            </Typography>
          </Box>
        </Paper>
      </Slide>

      {/* Player Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {game.players.map((player) => (
          <Grid item xs={12} sm={6} key={player.id}>
            <Card 
              elevation={player.isActive ? 6 : 2}
              sx={{
                border: player.isActive ? '3px solid #1976d2' : '1px solid #e0e0e0',
                backgroundColor: 'white',
                transform: player.isActive ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease-in-out',
                boxShadow: player.isActive 
                  ? '0 8px 24px rgba(25, 118, 210, 0.15)' 
                  : '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <CardContent>
                <Typography variant="h6">{player.name}</Typography>
                <Typography variant="h4" color="primary">
                  {player.score}
                </Typography>
                {player.targetScore && (
                  <Typography variant="body2" color="text.secondary">
                    {t('game.target')}: {player.targetScore}
                  </Typography>
                )}
                <Typography variant="body2" color="success.main">
                  {t('game.remaining')}: {getRemainingScore(player)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Ball Selection */}
      <Card sx={{ mb: 3 }} ref={ballSectionRef}>
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
        <Grid item xs={12} sm={6}>
          <Button 
            variant="contained" 
            color="primary"
            fullWidth 
            onClick={onSwitchPlayer}
          >
            {t('game.switchPlayer')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
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
