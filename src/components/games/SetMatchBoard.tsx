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
import type { Game, ChessClockState } from '../../types/index';
import { UIColors, GameColors } from '../../constants/colors';
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
  onChessClockStateChange?: (state: ChessClockState) => void;
}

export const SetMatchBoard: React.FC<SetMatchBoardProps> = React.memo(({
  game,
  onWinSet,
  onUndoLastShot,
  alternatingBreak = false,
  onSwapPlayers,
  canSwapPlayers = false,
  onTimeUp,
  onSwitchToPlayer,
  onChessClockStateChange,
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
    }}>
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
                  boxShadow: UIColors.hover.shadow,
                },
                '&:active': {
                  transform: 'scale(0.98)',
                },
              }}
            >
              <CardContent sx={{ 
                textAlign: 'center', 
                py: { xs: 0, md: 0.1 }, 
                px: { xs: 0.25, md: 0.5 },
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                minHeight: { xs: '80px', sm: '100px', md: '120px', lg: '140px' },
                pb: { xs: 0, md: 0 }
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mt: { xs: 0.5, md: 0.8 },
                    mb: 0,
                    fontWeight: 700,
                  }}
                >
                  <span style={{ 
                    fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)' 
                  }}>
                    {player.name}
                  </span>
                  {player.targetSets && (
                    <span style={{ 
                      fontSize: 'clamp(1rem, 1.8vw, 1.4rem)',
                      fontWeight: 500,
                      marginLeft: '1rem'
                    }}>
                      {`(${player.targetSets})`}
                    </span>
                  )}
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
                    // Maximized font size utilizing all available space
                    fontSize: { 
                      xs: '8rem', 
                      sm: '10rem', 
                      md: 'clamp(14rem, 20vw, 32rem)',
                      lg: 'clamp(16rem, 22vw, 36rem)'
                    },
                    fontWeight: 'bold',
                    lineHeight: 0.8,
                    textAlign: 'center',
                    // Reduced negative margins to add some bottom spacing
                    my: { xs: -1.2, sm: -1.8, md: -3 },
                    mb: { xs: -0.8, sm: -1.2, md: -2.5 },
                    mt: { xs: -0.5, sm: -1, md: -1.5 },
                    // Expand to use maximum available vertical space
                    minHeight: { xs: '4rem', sm: '5rem', md: '8rem', lg: '10rem' },
                  }}
                >
                  <span style={{
                    // Enhanced font rendering for large sizes
                    textRendering: 'optimizeLegibility',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    // Back to Inter - cleaner for large score display
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: '700'
                  }}>
                    {player.setsWon || 0}
                  </span>
                </Typography>
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
            borderColor: UIColors.border.light,
            color: UIColors.text.mediumGray,
            '&:hover': {
              backgroundColor: UIColors.border.light,
              color: UIColors.text.mediumGray,
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
});