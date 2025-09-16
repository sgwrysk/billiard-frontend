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
import type { Game, Player, ChessClockState } from '../../types/index';
import { BallRenderer } from '../../utils/BallRenderer';
import { useBallDesign } from '../../contexts/BallDesignContext';
import BallButton from '../common/BallButton';
import { UIColors, GameColors, AppStyles, AppColors } from '../../constants/colors';
import ChessClock from '../ChessClock';

interface RotationBoardProps {
  game: Game;
  onPocketBall: (ballNumber: number) => void;
  onSwitchPlayer: () => void;
  onUndoLastShot: () => void;
  onSelectPlayer?: (playerId: string) => void;
  onSwapPlayers?: () => void;
  canSwapPlayers?: boolean;
  canUndoLastShot?: boolean;
  onTimeUp?: (playerIndex: number) => void;
  onSwitchToPlayer?: (playerIndex: number) => void;
  onChessClockStateChange?: (state: ChessClockState) => void;
}

export const RotationBoard: React.FC<RotationBoardProps> = ({
  game,
  onPocketBall,
  onSwitchPlayer,
  onUndoLastShot,
  onSelectPlayer,
  onSwapPlayers,
  canSwapPlayers = false,
  canUndoLastShot = false,
  onTimeUp,
  onSwitchToPlayer,
  onChessClockStateChange,
}) => {
  const { t } = useLanguage();
  const { currentDesign } = useBallDesign();
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
    // Check if any player has this ball in their ballsPocketed array
    return game.players.some(player => 
      player.ballsPocketed.includes(ballNumber)
    );
  };
  
  const getRemainingScore = (player: Player) => {
    if (!player.targetScore) return 0;
    return Math.max(0, player.targetScore - player.score);
  };

  // Get balls pocketed by a player in current rack (chronological order)
  const getPlayerBallsInOrder = (playerId: string) => {
    // Show only balls pocketed in current rack (from shotHistory)
    if (!game.shotHistory) return [];
    
    return game.shotHistory
      .filter(shot => shot.playerId === playerId && shot.isSunk)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map(shot => shot.ballNumber);
  };

  return (
    <Box>
      {/* Chess Clock */}
      {game.chessClock?.enabled && onTimeUp && onSwitchToPlayer && (
        <ChessClock
          chessClock={game.chessClock}
          players={game.players}
          currentPlayerIndex={game.currentPlayerIndex}
          onTimeUp={onTimeUp}
          onPlayerSelect={onSwitchToPlayer}
          savedState={game.chessClockState}
          onStateChange={onChessClockStateChange}
        />
      )}

      {/* Sticky Header for Current Player */}
      <Slide direction="down" in={showStickyHeader} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: 'fixed',
            top: game.chessClock?.enabled ? 144 : 64, // Shift down when chess clock is enabled
            left: 0,
            right: 0,
            zIndex: 1040,
            p: 2,
            backgroundColor: UIColors.background.white,
            borderBottom: `1px solid ${UIColors.border.light}`,
            boxShadow: UIColors.shadow.light,
          }}
        >
          <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
            <Typography variant="h6" sx={{ color: 'black', fontWeight: 'bold' }}>
              {currentPlayer.name}
            </Typography>
            <Typography variant="body1" sx={{ color: 'black' }}>
              <span style={AppStyles.monoFont}>{currentPlayer.score}</span>/<span style={AppStyles.monoFont}>{currentPlayer.targetScore || 0}</span> ({t('game.remaining')}: <span style={AppStyles.monoFont}>{getRemainingScore(currentPlayer)}</span>)
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
              onClick={() => onSelectPlayer && onSelectPlayer(player.id)}
              sx={{
                border: player.isActive ? GameColors.playerSelected.border : GameColors.playerUnselected.border,
                backgroundColor: UIColors.background.white,
                transform: player.isActive ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease-in-out',
                cursor: onSelectPlayer ? 'pointer' : 'default',
                boxShadow: player.isActive 
                  ? `0 8px 24px ${AppColors.theme.primary}26` 
                  : UIColors.shadow.medium,
                '&:hover': onSelectPlayer ? {
                  backgroundColor: UIColors.hover.lightBackground,
                  transform: player.isActive ? 'scale(1.08)' : 'scale(1.03)',
                  boxShadow: UIColors.hover.shadow,
                } : {},
                '&:active': onSelectPlayer ? {
                  transform: 'scale(0.98)',
                } : {},
              }}
            >
              <CardContent>
                <Typography 
                  variant="h6"
                  sx={{ fontSize: { xs: '1.1rem', md: '1.4rem', lg: '1.6rem' }, fontWeight: 700 }}
                >
                  {player.name}
                </Typography>
                <Typography 
                  variant="h4" 
                  color="primary"
                  sx={{ fontSize: { xs: '2rem', md: '2.6rem', lg: '3rem' }, fontWeight: 800 }}
                >
                  <span style={AppStyles.monoFont}>{player.score}</span>
                </Typography>
                {player.targetScore && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', md: '1rem' } }}>
                    {t('game.target')}: <span style={AppStyles.monoFont}>{player.targetScore}</span>
                  </Typography>
                )}
                <Typography variant="body2" color="success.main" sx={{ fontSize: { xs: '0.9rem', md: '1.05rem' } }}>
                  {t('game.remaining')}: <span style={AppStyles.monoFont}>{getRemainingScore(player)}</span>
                </Typography>
                
                {/* Pocketed Balls Display */}
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, minHeight: '40px' }}>
                    {getPlayerBallsInOrder(player.id).length > 0 ? (
                      getPlayerBallsInOrder(player.id).map((ballNumber, index) => (
                        <Box
                          key={`${ballNumber}-${index}`}
                          sx={BallRenderer.getStyle(ballNumber, currentDesign.id, 'scoreDisplay')}
                        >
                          <span style={{ 
                            position: 'relative', 
                            zIndex: 3,
                            ...AppStyles.monoFont
                          }}>
                            {ballNumber}
                          </span>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', py: 1 }}>
                        なし
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Ball Selection - moved above the controls row */}
      <Card sx={{ mb: 2 }} ref={ballSectionRef}>
        <CardContent>
          <Grid container spacing={1}>
            {ballNumbers.map((ballNumber) => (
              <Grid item key={ballNumber}>
                <BallButton
                  ballNumber={ballNumber}
                  disabled={isBallPocketed(ballNumber)}
                  onClick={onPocketBall}
                  size="medium"
                  isActive={true}
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Top controls row: swap link (left) and actions (right). Keep layout stable when swap is hidden */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        {canSwapPlayers && onSwapPlayers ? (
          <Button
            variant="text"
            color="primary"
            onClick={onSwapPlayers}
            sx={{
              px: 0,
              minWidth: 140,
              justifyContent: 'flex-start',
              textDecoration: 'underline',
              '&:hover': { textDecoration: 'underline' },
            }}
            title={t('game.swapPlayers')}
          >
            {t('game.swapPlayers')}
          </Button>
        ) : (
          <Box sx={{ minWidth: 140 }} />
        )}

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={onSwitchPlayer}
            sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
          >
            {t('game.switchPlayer')}
          </Button>
          <Button 
            variant="outlined" 
            onClick={onUndoLastShot}
            disabled={!canUndoLastShot}
            sx={{ 
              height: '48px',
              minHeight: '48px',
              borderColor: UIColors.border.light,
              color: '#666666',
              '&:hover': {
                backgroundColor: '#e0e0e0',
                color: '#666666',
                borderColor: UIColors.border.light,
              },
              '&:disabled': {
                borderColor: UIColors.border.light,
                color: '#666666',
                opacity: 0.6,
              },
            }}
          >
            {t('game.undo')}
          </Button>
        </Box>
      </Box>

      

      {/* Action Buttons row removed; actions moved to top controls */}
    </Box>
  );
};
