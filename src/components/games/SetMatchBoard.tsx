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
import { UIColors, GameColors, AppStyles } from '../../constants/colors';
import ChessClock from '../ChessClock';
import SetHistory from '../SetHistory';

interface SetMatchBoardProps {
  game: Game;
  onWinSet: (playerId: string) => void;
  onUndoLastShot: () => void;
  alternatingBreak?: boolean;
  onSwapPlayers?: () => void;
  canSwapPlayers?: boolean;
  canUndoLastShot?: boolean;
  onTimeUp?: (playerIndex: number) => void;
  onSwitchToPlayer?: (playerIndex: number) => void;
}

export const SetMatchBoard: React.FC<SetMatchBoardProps> = ({
  game,
  onWinSet,
  onUndoLastShot,
  alternatingBreak = false,
  onSwapPlayers,
  canSwapPlayers = false,
  onTimeUp,
  onSwitchToPlayer,
}) => {
  const { t } = useLanguage();

  // リーチ状態の判定（あと1セットで勝利）
  const isPlayerInReach = (player: typeof game.players[0]) => {
    return player.targetSets && player.setsWon === (player.targetSets - 1);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: 'calc(100vh - 64px)',
      // Add top padding when chess clock is enabled to prevent overlap
      pt: game.chessClock?.enabled ? { xs: 10, sm: 12 } : 0
    }}>
      {/* Chess Clock */}
      {game.chessClock?.enabled && onTimeUp && onSwitchToPlayer && (
        <ChessClock
          chessClock={game.chessClock}
          players={game.players}
          currentPlayerIndex={game.currentPlayerIndex}
          onTimeUp={onTimeUp}
          onPlayerSelect={onSwitchToPlayer}
        />
      )}

      {/* Player Cards - keep compact to ensure bottom controls are visible */}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
        {game.players.map((player) => (
          <Grid item xs={12} sm={6} key={player.id}>
            <Card 
              elevation={player.isActive ? 6 : 2}
              onClick={() => onWinSet(player.id)}
              sx={{
                position: 'relative', // Set reference point for absolute positioning
                border: player.isActive ? `2px solid ${GameColors.playerSelected.background}` : GameColors.playerUnselected.border,
                transform: player.isActive ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                height: '100%',
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
              <CardContent sx={{ 
                textAlign: 'center', 
                py: { xs: 0.25, md: 0.5 }, 
                px: { xs: 0.25, md: 0.5 },
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                minHeight: { xs: '80px', sm: '100px', md: '120px', lg: '140px' }
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mt: { xs: 0.5, md: 0.8 },
                    mb: 0,
                    fontSize: { xs: '1rem', md: '1.25rem', lg: '1.4rem' },
                    fontWeight: 700,
                  }}
                >
                  {player.name}
                </Typography>
                
                {/* Break Icon - only show on the player who breaks */}
                {alternatingBreak && (() => {
                  // Determine which player breaks based on current rack number
                  const currentRack = game.totalRacks + 1; // 次のラック番号
                  const isOddRack = currentRack % 2 === 0;
                  const isBreakPlayer = (game.players.indexOf(player) === 0 && isOddRack) || 
                                       (game.players.indexOf(player) === 1 && !isOddRack);
                  
                  return isBreakPlayer ? (
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 1,
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>
                        🎱
                      </span>
                    </Box>
                  ) : null;
                })()}
                
                <Typography 
                  sx={{ 
                    color: isPlayerInReach(player) ? GameColors.reach.text : 'primary.main',
                    // Responsive font size that scales with both viewport and container
                    // xs: 5rem, sm: 6.5rem, md: starts from 8rem and scales with viewport, capped at 20rem
                    fontSize: { 
                      xs: '5rem', 
                      sm: '6.5rem', 
                      md: 'clamp(8rem, 12vw, 20rem)',
                      lg: 'clamp(10rem, 14vw, 24rem)'
                    },
                    fontWeight: 'bold',
                    lineHeight: 1,
                    textAlign: 'center',
                    my: 0,
                    // Additional spacing adjustments for larger text
                    minHeight: { xs: '2.5rem', sm: '4rem', md: '5.5rem', lg: '6.5rem' },
                  }}
                >
                  <span style={AppStyles.monoFont}>{player.setsWon || 0}</span>
                </Typography>
                {player.targetSets && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mt: { xs: 0.05, md: 0.1 }, fontSize: { xs: '0.85rem', md: '1rem' } }}
                  >
                    {t('game.targetSets')}: <span style={AppStyles.monoFont}>{player.targetSets}</span>
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      </Box>

      {/* Set history (always visible, even with no history yet) */}
      <SetHistory game={game} />

      {/* Top controls row: swap link (left) and undo button (right). Keep layout stable when swap is hidden */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, mt: 2 }}>
        {canSwapPlayers && onSwapPlayers ? (
          <Button
            variant="text"
            color="primary"
            onClick={onSwapPlayers}
            sx={{
              px: 0,
              minWidth: 140, // reserve width so layout doesn't shift
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

        <Button 
          variant="outlined" 
          onClick={onUndoLastShot}
          disabled={game.scoreHistory.length === 0}
          sx={{ 
            height: '48px',
            minHeight: '48px',
            borderColor: '#e0e0e0',
            color: '#666666',
            '&:hover': {
              backgroundColor: '#e0e0e0',
              color: '#666666',
              borderColor: '#e0e0e0',
            },
            '&:disabled': {
              borderColor: '#e0e0e0',
              color: '#666666',
              opacity: 0.6,
            },
          }}
        >
          {t('game.undo')}
        </Button>
      </Box>

      {/* Action Buttons row removed; undo moved to top controls */}
    </Box>
  );
};