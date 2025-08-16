import React, { useEffect, useState, useRef } from 'react';
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
    Slide,
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
  onAddPins?: (pins: number) => void;
  onUndoBowlingRoll?: () => void;
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
  onAddPins,
  onUndoBowlingRoll,
}) => {
  const { t } = useLanguage();
  const currentPlayer = game.players[game.currentPlayerIndex];
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const ballSectionRef = useRef<HTMLDivElement>(null);

  // Scroll monitoring for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (ballSectionRef.current) {
        const rect = ballSectionRef.current.getBoundingClientRect();
        // Show sticky header when ball section starts to scroll up
        setShowStickyHeader(rect.top < 300);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


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
      case GameType.BOWLARD:
        return t('setup.gameType.bowlard');
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
      {/* Sticky header for current player */}
      <Slide direction="down" in={showStickyHeader} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            bgcolor: 'white',
            color: 'text.primary',
            py: 1,
            px: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderBottom: '2px solid',
            borderColor: 'primary.main',
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 2,
            maxWidth: 1000,
            mx: 'auto'
          }}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'primary.main',
                color: 'white',
                fontSize: '1rem'
              }}
            >
              {currentPlayer.name.charAt(0)}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {currentPlayer.name}
            </Typography>
            {game.type === GameType.ROTATION && currentPlayer.targetScore && (
              <Typography variant="body1">
                {currentPlayer.score}/{currentPlayer.targetScore} ({t('game.remaining')}: {Math.max(0, currentPlayer.targetScore - currentPlayer.score)})
              </Typography>
            )}
          </Box>
        </Paper>
      </Slide>
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



      {/* プレイヤー情報（ボーラード以外） */}
      {game.type !== GameType.BOWLARD && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
        {game.players.map((player) => (
          <Grid item xs={12} md={6} key={player.id}>
            <Card 
              sx={{ 
                // セットマッチでは全プレイヤー統一、ローテーションではアクティブ表示
                border: game.type === GameType.SET_MATCH ? 1 : (player.isActive ? 3 : 1),
                borderColor: game.type === GameType.SET_MATCH ? 'grey.300' : (player.isActive ? 'primary.main' : 'grey.300'),
                bgcolor: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                boxShadow: game.type === GameType.SET_MATCH 
                  ? '0 2px 8px rgba(0,0,0,0.1)'
                  : (player.isActive 
                    ? '0 8px 25px rgba(25, 118, 210, 0.3)' 
                    : '0 2px 8px rgba(0,0,0,0.1)'),
                transform: game.type === GameType.SET_MATCH ? 'scale(1)' : (player.isActive ? 'scale(1.02)' : 'scale(1)'),
                position: 'relative',
                '&::before': (player.isActive && game.type === GameType.ROTATION) ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 1,
                  background: 'linear-gradient(45deg, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0.05))',
                  pointerEvents: 'none',
                  zIndex: 0,
                } : {},
                '&:hover': {
                  bgcolor: game.type === GameType.SET_MATCH 
                    ? 'success.50'
                    : (player.isActive ? 'primary.100' : 'grey.50'),
                  transform: game.type === GameType.SET_MATCH 
                    ? 'translateY(-2px)'
                    : (player.isActive ? 'scale(1.03) translateY(-2px)' : 'translateY(-2px)'),
                  boxShadow: game.type === GameType.SET_MATCH 
                    ? '0 8px 20px rgba(76, 175, 80, 0.3)' 
                    : (player.isActive ? '0 8px 25px rgba(25, 118, 210, 0.4)' : '0 4px 12px rgba(0,0,0,0.2)'),
                  borderColor: game.type === GameType.SET_MATCH ? 'success.main' : 'primary.main',
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
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
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
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        </Grid>
      )}







      {/* ボーラード用のボーリングスコアシート */}
      {game.type === GameType.BOWLARD && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            {/* ボーリングスコアシート（表形式） */}
            <Box sx={{ overflowX: 'auto', mb: 2 }}>
              <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', border: '2px solid #333' }}>
                <thead>
                  <tr>
                    {/* フレーム番号ヘッダー */}
                    {Array.from({ length: 10 }, (_, i) => (
                      <th 
                        key={`frame-${i}`}
                        style={{
                          border: '1px solid #333',
                          padding: '8px',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          width: i === 9 ? '120px' : '80px'
                        }}
                      >
                        {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* 投球結果行 */}
                  <tr style={{ height: '40px' }}>
                    {Array.from({ length: 10 }, (_, frameIndex) => {
                      const frame = currentPlayer.bowlingFrames?.[frameIndex];
                      const isFrame10 = frameIndex === 9;
                      
                      return (
                        <td 
                          key={`rolls-${frameIndex}`}
                          style={{
                            border: '1px solid #333',
                            padding: '0',
                            textAlign: 'center',
                            position: 'relative',
                            backgroundColor: frame?.isComplete ? '#e8f5e8' : 'white'
                          }}
                        >
                          {isFrame10 ? (
                            // 10フレーム（3つのボックス）
                            <div style={{ display: 'flex', height: '100%' }}>
                              {Array.from({ length: 3 }, (_, rollIndex) => {
                                return (
                                  <div 
                                    key={rollIndex}
                                    style={{
                                      flex: 1,
                                      borderLeft: rollIndex > 0 ? '1px solid #333' : 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '14px',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {(() => {
                                      if (frame?.rolls[rollIndex] === undefined) return '';
                                      
                                      const roll = frame.rolls[rollIndex];
                                      
                                      // 1投目
                                      if (rollIndex === 0) {
                                        return roll === 10 ? 'X' : roll === 0 ? 'G' : roll;
                                      }
                                      
                                      // 2投目
                                      if (rollIndex === 1) {
                                        // 1投目がストライクの場合
                                        if (frame.rolls[0] === 10) {
                                          return roll === 10 ? 'X' : roll === 0 ? 'G' : roll;
                                        }
                                        // スペアの場合
                                        else if (frame.rolls[0] + roll === 10) {
                                          return '/';
                                        }
                                        // 通常
                                        else {
                                          return roll === 0 ? '-' : roll;
                                        }
                                      }
                                      
                                      // 3投目
                                      if (rollIndex === 2) {
                                        return roll === 10 ? 'X' : roll === 0 ? '-' : roll;
                                      }
                                      
                                      return roll;
                                    })()}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            // 1-9フレーム（2つのボックス）
                            <div style={{ display: 'flex', height: '100%' }}>
                              <div 
                                style={{
                                  width: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  borderRight: '2px solid #333'
                                }}
                              >
                                {frame?.rolls[0] !== undefined ? (
                                  frame.isStrike ? 'X' : 
                                  frame.rolls[0] === 0 ? 'G' : frame.rolls[0]
                                ) : ''}
                              </div>
                              <div 
                                style={{
                                  width: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '14px',
                                  fontWeight: 'bold'
                                }}
                              >
                                {!frame?.isStrike && frame?.rolls[1] !== undefined ? (
                                  frame.isSpare ? '/' :
                                  frame.rolls[1] === 0 ? '-' : frame.rolls[1]
                                ) : ''}
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  
                  {/* 累積スコア行 */}
                  <tr style={{ height: '40px' }}>
                    {Array.from({ length: 10 }, (_, i) => {
                      const frame = currentPlayer.bowlingFrames?.[i];
                      
                      return (
                        <td 
                          key={`score-${i}`}
                          style={{
                            border: '1px solid #333',
                            padding: '8px',
                            textAlign: 'center',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            backgroundColor: '#f5f5f5'
                          }}
                        >
                          {frame?.isComplete && frame?.score !== undefined ? frame.score : ''}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </Box>

            {/* 現在のフレーム情報と入力 */}
            {(() => {
              const frames = currentPlayer.bowlingFrames || [];
              const currentFrameIndex = frames.findIndex(frame => !frame.isComplete);
              const currentFrame = frames[currentFrameIndex];
              
              if (currentFrameIndex === -1) {
                return (
                  <Typography variant="h6" sx={{ textAlign: 'center', color: 'success.main' }}>
                    🎉 {t('bowlard.frameComplete')} 🎉
                  </Typography>
                );
              }

              return (
                <Box>
                  {/* ピン数入力ボタン */}
                  <Grid container spacing={1}>
                    {Array.from({ length: 11 }, (_, i) => {
                      let maxPins = 10;
                      let disabled = false;
                      
                      // 10フレーム目の特殊制限
                      if (currentFrameIndex === 9) {
                        const rollsLength = currentFrame?.rolls.length || 0;
                        
                        if (rollsLength === 0) {
                          // 1投目: 0-10まで全て可能
                          maxPins = 10;
                        } else if (rollsLength === 1) {
                          // 2投目
                          const firstRoll = currentFrame.rolls[0];
                          if (firstRoll === 10) {
                            // 1投目がストライクなら2投目も0-10まで全て可能
                            maxPins = 10;
                          } else {
                            // 1投目がストライクでなければ残りピン数まで
                            maxPins = 10 - firstRoll;
                          }
                        } else if (rollsLength === 2) {
                          // 3投目
                          const firstRoll = currentFrame.rolls[0];
                          const secondRoll = currentFrame.rolls[1];
                          
                          if (firstRoll === 10 || firstRoll + secondRoll === 10) {
                            // 1投目がストライクまたはスペアなら3投目は0-10まで全て可能
                            maxPins = 10;
                          } else {
                            // それ以外なら3投目はない（この状況は発生しないはず）
                            maxPins = 0;
                          }
                        }
                      } else {
                        // 1-9フレーム目の通常制限
                        if (currentFrame?.rolls.length === 1) {
                          maxPins = 10 - (currentFrame.rolls[0] || 0);
                        } else {
                          maxPins = 10;
                        }
                      }
                      
                      disabled = i > maxPins;
                      
                      return (
                        <Grid item key={i}>
                          <Button
                            variant="contained"
                            disabled={disabled}
                            onClick={() => onAddPins?.(i)}
                            sx={{
                              width: 50,
                              height: 50,
                              fontSize: '1.1rem',
                              fontWeight: 'bold',
                              bgcolor: disabled ? 'grey.300' : 'primary.main',
                              '&:hover': {
                                bgcolor: disabled ? 'grey.300' : 'primary.dark',
                              }
                            }}
                          >
                            {i}
                          </Button>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* ボール選択エリア（セットマッチとボーラード以外） */}
      {game.type !== GameType.SET_MATCH && game.type !== GameType.BOWLARD && (
        <Card ref={ballSectionRef} sx={{ mb: 2 }}>
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
                      width: { xs: '32px', sm: '28px' },
                      height: { xs: '32px', sm: '28px' },
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
          ) : game.type === GameType.BOWLARD ? (
            // ボーラード用のボタン
            (() => {
              const frames = currentPlayer.bowlingFrames || [];
              const gameComplete = frames[9]?.isComplete || false;
              const hasRolls = frames.some(frame => frame.rolls.length > 0);
              
              return (
                <>
                  <Grid item xs={gameComplete ? 6 : 12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="warning"
                      onClick={onUndoBowlingRoll}
                      size="large"
                      startIcon={<Undo />}
                      disabled={!hasRolls}
                    >
                      {t('game.undo')}
                    </Button>
                  </Grid>
                  
                  {/* 完了ボタン（ゲーム終了時のみ表示） */}
                  {gameComplete && (
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        onClick={() => onEndGame(currentPlayer.id)}
                        size="large"
                      >
                        {t('game.complete')}
                      </Button>
                    </Grid>
                  )}
                </>
              );
            })()
          ) : (
            // 通常時のボタン（ローテーション）
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
              {/* プレイヤー交代ボタン */}
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
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
