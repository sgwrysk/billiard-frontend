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
  alternatingBreak?: boolean;
  onSwapPlayers?: () => void;
  canSwapPlayers?: boolean;
  canUndoLastShot?: boolean;
}

export const SetMatchBoard: React.FC<SetMatchBoardProps> = ({
  game,
  onWinSet,
  onUndoLastShot,
  alternatingBreak = false,
  onSwapPlayers,
  canSwapPlayers = false,
  canUndoLastShot = false,
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
                position: 'relative', // 絶対配置の基準点を設定
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
                
                {/* Break Icon - only show on the player who breaks */}
                {alternatingBreak && (() => {
                  // 現在のラック数に基づいて、どちらのプレイヤーがブレイクするかを判定
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
          {canSwapPlayers && onSwapPlayers ? (
            <Button 
              variant="outlined" 
              fullWidth 
              startIcon={<span style={{ fontSize: '1.2rem' }}>🔄</span>}
              onClick={onSwapPlayers}
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                height: '48px',
                minHeight: '48px',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  borderColor: 'primary.main',
                },
              }}
            >
              {t('game.swapPlayers')}
            </Button>
          ) : (
            <Button 
              variant="outlined" 
              fullWidth 
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
          )}
        </Grid>
      </Grid>
    </Box>
  );
};