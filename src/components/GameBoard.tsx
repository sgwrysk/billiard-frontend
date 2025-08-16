import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Paper,
} from '@mui/material';
import { Home, Undo } from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import type { Game } from '../types/index';
import { GameType } from '../types/index';

interface GameBoardProps {
  game: Game;
  onPocketBall: (ballNumber: number) => void;
  onSwitchPlayer: () => void;
  onSwitchToPlayer: (playerIndex: number) => void;
  onEndGame: (winnerId?: string) => void;
  onResetGame: () => void;
  onResetRack: () => void;
  checkAllBallsPocketed: () => boolean;
  onUndoLastShot: () => void;
  onWinSet: (playerId: string) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  game,
  onPocketBall,
  onSwitchPlayer,
  onSwitchToPlayer,
  onEndGame,
  onResetGame,
  onResetRack,
  checkAllBallsPocketed,
  onUndoLastShot,
  onWinSet,
}) => {
  const { t, language } = useLanguage();
  const currentPlayer = game.players[game.currentPlayerIndex];


  const getBallNumbers = () => {
    switch (game.type) {
      case GameType.SET_MATCH:
        return Array.from({ length: 9 }, (_, i) => i + 1);
      case GameType.ROTATION:
        return Array.from({ length: 15 }, (_, i) => i + 1);
      default:
        return [];
    }
  };

  const getBallColor = (ballNumber: number) => {
    const ballColors: { [key: number]: string } = {
      1: '#FFD700', // Yellow (solid) - matched to 9 ball
      2: '#6495ED', // Blue (solid) - matched to 10 ball
      3: '#FF6B6B', // Red (solid) - matched to 11 ball
      4: '#DDA0DD', // Purple (solid) - matched to 12 ball
      5: '#FFDAB9', // Orange (solid) - matched to 13 ball
      6: '#90EE90', // Green (solid) - matched to 14 ball
      7: '#CD853F', // Maroon (solid) - matched to 15 ball
      8: '#000000', // Black
      9: '#FFD700', // Yellow stripe
      10: '#6495ED', // Blue stripe
      11: '#FF6B6B', // Red stripe
      12: '#DDA0DD', // Purple stripe
      13: '#FFDAB9', // Orange stripe
      14: '#90EE90', // Green stripe
      15: '#CD853F', // Maroon stripe
    };
    return ballColors[ballNumber] || '#CCCCCC';
  };

  const getBallTextColor = (ballNumber: number) => {
    // Dark balls use white text, bright balls use black text
    const darkBalls = [2, 3, 4, 7, 8];
    return darkBalls.includes(ballNumber) ? 'white' : 'black';
  };

  const isBallPocketed = (ballNumber: number) => {
    return game.players.some(player => 
      player.ballsPocketed.includes(ballNumber)
    );
  };

  const getGameTypeLabel = (type: GameType) => {
    switch (type) {
      case GameType.SET_MATCH:
        return t('setup.gameType.setmatch');
      case GameType.ROTATION:
        return t('setup.gameType.rotation');
      default:
        return type;
    }
  };

  const getAllBallsPocketed = () => {
    const pocketedBalls = game.players.flatMap(player => player.ballsPocketed);
    const totalBalls = game.type === GameType.SET_MATCH ? 9 : 15;
    return pocketedBalls.length >= totalBalls;
  };



  const checkWinCondition = () => {
    switch (game.type) {
      case GameType.SET_MATCH:
        return currentPlayer.targetSets ? currentPlayer.score >= currentPlayer.targetSets : false;
      case GameType.ROTATION:
        return currentPlayer.targetScore ? currentPlayer.score >= currentPlayer.targetScore : false;
      default:
        return false;
    }
  };

  const handlePocketBall = (ballNumber: number) => {
    onPocketBall(ballNumber);
  };

  // Check victory condition when game state changes
  useEffect(() => {
    // Check victory condition for all players
    for (const player of game.players) {
      // Rotation victory condition
      if (game.type === GameType.ROTATION && player.targetScore) {
        if (player.score >= player.targetScore) {
          // Execute victory condition with slight delay (after UI update)
          setTimeout(() => {
            onEndGame(player.id);
          }, 50);
          return;
        }
      }

      // Set Match victory condition
      if (game.type === GameType.SET_MATCH && player.targetSets) {
        if (player.score >= player.targetSets) {
          // Execute victory condition with slight delay (after UI update)
          setTimeout(() => {
            onEndGame(player.id);
          }, 50);
          return;
        }
      }
    }

    // Victory condition for other game types
    const currentPlayer = game.players.find(p => p.isActive);
    if (currentPlayer && checkWinCondition()) {
      setTimeout(() => {
        onEndGame(currentPlayer.id);
      }, 50);
      return;
    }

    // Re-rack when all balls are pocketed in Rotation
    if (game.type === GameType.ROTATION && checkAllBallsPocketed()) {
      // Victory condition has priority, so re-rack only if not victorious
      setTimeout(() => {
        onResetRack();
      }, 50);
    }
  }, [game.players, game.type, onEndGame, onResetRack, checkWinCondition, checkAllBallsPocketed]); // Monitor changes to game.players

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 2 }}>
      {/* ヘッダー */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5">
                🎱 {getGameTypeLabel(game.type)}
              </Typography>
              {game.type === GameType.ROTATION && (
                <Typography variant="body2" color="text.secondary">
                  {t('game.rack')} {game.currentRack} / {t('game.totalRacks')}: {game.totalRacks}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                onClick={onUndoLastShot} 
                title={t('game.undo')}
                disabled={game.shotHistory.length === 0}
                color="warning"
              >
                <Undo />
              </IconButton>
              <IconButton 
                onClick={onResetGame} 
                title={t('game.backToHome')}
                color="primary"
              >
                <Home />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>



      {/* プレイヤー情報 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {game.players.map((player) => (
          <Grid item xs={12} md={6} key={player.id}>
            <Card 
              sx={{ 
                border: player.isActive ? 2 : 1,
                borderColor: player.isActive ? 'primary.main' : 'grey.300',
                bgcolor: player.isActive ? 'primary.50' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: game.type === GameType.SET_MATCH 
                    ? (player.isActive ? 'success.100' : 'success.50')
                    : (player.isActive ? 'primary.100' : 'grey.50'),
                  transform: 'translateY(-2px)',
                  boxShadow: game.type === GameType.SET_MATCH ? 4 : 2,
                  borderColor: game.type === GameType.SET_MATCH ? 'success.main' : undefined,
                },
              }}
              onClick={() => {
                if (game.type === GameType.SET_MATCH) {
                  // セットマッチの場合、クリックでセット追加
                  onWinSet(player.id);
                } else if (!player.isActive) {
                  // 他のゲームタイプで非アクティブプレイヤーをクリックした場合、アクティブにする
                  const newCurrentPlayerIndex = game.players.findIndex(p => p.id === player.id);
                  if (newCurrentPlayerIndex !== -1) {
                    onSwitchToPlayer(newCurrentPlayerIndex);
                  }
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: player.isActive ? 'primary.main' : 'grey.400',
                    }}
                  >
                    {player.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{player.name}</Typography>
                    {game.type === GameType.SET_MATCH ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        {/* スコアボード風の大きなスコア表示 */}
                        <Typography 
                          variant="h1" 
                          sx={{ 
                            fontSize: { xs: '4rem', sm: '5rem' },
                            fontWeight: 'bold',
                            color: 'primary.main',
                            lineHeight: 1,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                            minWidth: '80px',
                            textAlign: 'center',
                          }}
                        >
                          {player.score}
                        </Typography>
                        <Box>
                          {player.targetSets && (
                            <Typography variant="body1" color="text.secondary">
                              {t('game.targetSets')}: {player.targetSets}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <Typography variant="h4" color="primary">
                          {player.score}{t('victory.points')}
                        </Typography>
                        {game.type === GameType.ROTATION && player.targetScore && (
                          <Typography variant="h6" color="secondary">
                            {t('game.remaining')}: {Math.max(0, player.targetScore - player.score)}{t('victory.points')}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          {t('game.balls')}: {player.ballsPocketed.length}
                          {game.type === GameType.ROTATION && player.targetScore && 
                            ` / ${t('game.target')}: ${player.targetScore}${t('victory.points')}`}
                        </Typography>
                      </>
                    )}
                  </Box>
                  {game.type !== GameType.SET_MATCH && (
                    player.isActive ? (
                      <Chip 
                        label={t('game.playing')} 
                        color="primary" 
                        size="small"
                      />
                    ) : (
                      <Chip 
                        label={t('game.clickToSelect')} 
                        variant="outlined"
                        color="primary" 
                        size="small"
                      />
                    )
                  )}
                </Box>
                
                {/* ポケットしたボール */}
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {player.ballsPocketed.map(ball => (
                    <Chip
                      key={ball}
                      label={ball}
                      size="small"
                      sx={{
                        bgcolor: getBallColor(ball),
                        color: getBallTextColor(ball),
                        fontWeight: 'bold',
                        border: ball > 8 ? '1px dashed white' : 'none',
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>







      {/* ボール選択エリア（セットマッチ以外） */}
      {game.type !== GameType.SET_MATCH && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('game.ballSelect')}

            </Typography>
          <Grid container spacing={1}>
            {getBallNumbers().map(ballNumber => (
              <Grid item key={ballNumber}>
                <Button
                  variant={isBallPocketed(ballNumber) ? "outlined" : "contained"}
                  disabled={isBallPocketed(ballNumber)}
                  onClick={() => handlePocketBall(ballNumber)}
                  sx={{
                    width: 52,
                    height: 52,
                    minWidth: 52,
                    borderRadius: '50%',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    position: 'relative',
                    overflow: 'hidden',
                    border: 'none',
                    padding: 0,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    
                    // Base background for all balls
                    ...(isBallPocketed(ballNumber) 
                      ? {
                          background: 'linear-gradient(145deg, #e6e6e6, #cccccc)',
                        }
                      : ballNumber > 8 
                        ? {
                            background: `linear-gradient(to bottom, white 0%, white 20%, ${getBallColor(ballNumber)} 20%, ${getBallColor(ballNumber)} 80%, white 80%, white 100%)`,
                          }
                        : {
                            background: `radial-gradient(circle at 30% 30%, ${getBallColor(ballNumber)}dd, ${getBallColor(ballNumber)} 70%)`,
                          }
                    ),
                    
                    boxShadow: isBallPocketed(ballNumber) 
                      ? 'inset 2px 2px 4px rgba(0,0,0,0.2)' 
                      : '0 4px 12px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.1), inset 2px 2px 4px rgba(255,255,255,0.3)',
                    
                    // White circle background for number
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '28px',
                      height: '28px',
                      backgroundColor: isBallPocketed(ballNumber) ? '#ddd' : 'white',
                      borderRadius: '50%',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
                      zIndex: 1,
                    },
                    
                    // Number styling
                    color: isBallPocketed(ballNumber) ? '#999' : '#000',
                    
                    '&:hover': {
                      transform: 'scale(1.08)',
                      boxShadow: isBallPocketed(ballNumber) 
                        ? 'inset 2px 2px 4px rgba(0,0,0,0.2)' 
                        : '0 6px 16px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.1), inset 2px 2px 4px rgba(255,255,255,0.4)',
                      // Keep original background
                      ...(isBallPocketed(ballNumber) 
                        ? {
                            background: 'linear-gradient(145deg, #e6e6e6, #cccccc) !important',
                          }
                        : ballNumber > 8 
                          ? {
                              background: `linear-gradient(to bottom, white 0%, white 20%, ${getBallColor(ballNumber)} 20%, ${getBallColor(ballNumber)} 80%, white 80%, white 100%) !important`,
                            }
                          : {
                              background: `radial-gradient(circle at 30% 30%, ${getBallColor(ballNumber)}dd, ${getBallColor(ballNumber)} 70%) !important`,
                            }
                      ),
                      '& span': {
                        transform: 'scale(1.15)',
                        color: isBallPocketed(ballNumber) ? '#999 !important' : '#000 !important',
                      }
                    },
                    
                    '&.Mui-disabled': {
                      background: 'linear-gradient(145deg, #e6e6e6, #cccccc)',
                      '&::before': {
                        backgroundColor: '#ddd',
                      }
                    },
                    
                    // Make sure text is always on top
                    '& .MuiButton-root': {
                      position: 'relative',
                      zIndex: 5,
                    },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ 
                    position: 'relative', 
                    zIndex: 10, 
                    fontWeight: 'bold',
                    color: isBallPocketed(ballNumber) ? '#999' : '#000',
                    transition: 'transform 0.2s ease'
                  }}>
                    {ballNumber}
                  </span>
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
      )}

      {/* アクションボタン */}
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {game.type === GameType.ROTATION && getAllBallsPocketed() ? (
            // 全ボール完了時は「次のラックへ」ボタンを表示
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                onClick={onResetRack}
                size="large"
                sx={{ py: 2 }}
              >
                {t('game.nextRack')}
              </Button>
            </Grid>
          ) : game.type === GameType.SET_MATCH ? (
            // セットマッチ用のシンプルなボタン
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                color="warning"
                onClick={onUndoLastShot}
                size="large"
                startIcon={<Undo />}
                disabled={game.scoreHistory.length === 0}
              >
                {t('game.undo')}
              </Button>
            </Grid>
          ) : (
            // 通常時のボタン（ローテーション等）
            <>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="warning"
                  onClick={onUndoLastShot}
                  size="large"
                  startIcon={<Undo />}
                  disabled={game.shotHistory.length === 0}
                >
                  {t('game.undo')}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={onSwitchPlayer}
                  size="large"
                >
                  {t('game.switchPlayer')}
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default GameBoard;
