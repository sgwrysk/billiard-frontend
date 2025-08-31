import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
} from '@mui/material';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { Game } from '../../../types/index';
import { BallButton } from '../../common';
import { AppColors } from '../../../constants/colors';
import PlayerOrderChangeDialog from './PlayerOrderChangeDialog';

interface JapanGameScreenProps {
  game: Game;
  onBallClick: (ballNumber: number) => void;
  onMultiplierClick: (multiplier: { label: string; value: number }) => void;
  onDeductionClick: (deduction: { label: string; value: number }) => void;
  onNextRack: () => void;
  onUndo: () => void;
  onEndGame: () => void;
  onScoreEditToggle: () => void;
  onPlayerOrderChange: (selectedPlayerId: string) => void;
  onMultiplierAllClick?: (multiplier: number) => void;
  onPlayerSelect?: (playerIndex: number) => void;
  isScoreEditMode: boolean;
}

const JapanGameScreen: React.FC<JapanGameScreenProps> = ({
  game,
  onBallClick,
  onMultiplierClick,
  onDeductionClick,
  onNextRack,
  onUndo,
  onEndGame,
  onScoreEditToggle,
  onPlayerOrderChange,
  onMultiplierAllClick,
  onPlayerSelect,
  isScoreEditMode,
}) => {
  const japanSettings = game.japanSettings!;
  const [isX2Active, setIsX2Active] = useState(false);
  const [showOrderChangeDialog, setShowOrderChangeDialog] = useState(false);
  
  // Check if order change is needed after current rack
  const shouldShowOrderChange = () => {
    // Order change occurs for 3+ players only
    if (game.players.length <= 2) {
      return false;
    }
    
    const orderChangeInterval = japanSettings.orderChangeInterval || 10;
    return game.currentRack > 0 && game.currentRack % orderChangeInterval === 0;
  };
  
  // Handle next rack button - check for order change first
  const handleNextRack = () => {
    if (shouldShowOrderChange()) {
      setShowOrderChangeDialog(true);
    } else {
      onNextRack();
    }
  };
  
  // Handle order change confirmation
  const handleOrderChangeConfirm = (selectedPlayerId: string) => {
    setShowOrderChangeDialog(false);
    onPlayerOrderChange(selectedPlayerId);
  };
  
  // Handle order change cancellation
  const handleOrderChangeCancel = () => {
    setShowOrderChangeDialog(false);
    onNextRack(); // Continue to next rack without order change
  };

  // Get player order for specific rack period
  const getPlayerOrderForRackPeriod = (startRack: number, endRack: number): string[] => {
    if (!game.japanPlayerOrderHistory) {
      return game.players.map(p => p.id);
    }

    // Find the order history that covers this rack period
    const orderHistory = game.japanPlayerOrderHistory.find(history => 
      startRack >= history.fromRack && endRack <= history.toRack
    );

    return orderHistory ? orderHistory.playerOrder : game.players.map(p => p.id);
  };
  
  // 1. ラック情報
  const currentRack = game.currentRack;
  
  // 現在ラックでのポイント計算（ショット履歴から算出）
  const getCurrentRackPoints = (playerId: string) => {
    // 現在ラックのショット履歴を取得（簡易実装として直近のショット数から推測）
    const playerShots = game.shotHistory.filter(shot => 
      shot.playerId === playerId && 
      shot.customData?.type === 'ball_click'
    );
    
    // 直近のショットからポイントを計算
    return playerShots.reduce((total, shot) => {
      const points = typeof shot.customData?.points === 'number' ? shot.customData.points : 0;
      return total + points;
    }, 0);
  };
  
  // 前ラック終了時の累計ポイントを取得
  const getPreviousRackTotalPoints = (playerId: string) => {
    if (!game.japanRackHistory || game.japanRackHistory.length === 0) {
      return 0; // ラック1では0を表示
    }
    
    // 最新のラック履歴から該当プレイヤーのtotalPointsを取得
    const lastRackResult = game.japanRackHistory[game.japanRackHistory.length - 1];
    const playerResult = lastRackResult?.playerResults.find(pr => pr.playerId === playerId);
    return playerResult?.totalPoints || 0;
  };
  const racksUntilOrderChange = japanSettings.orderChangeEnabled 
    ? japanSettings.orderChangeInterval - (currentRack % japanSettings.orderChangeInterval)
    : null;

  // Player selection handler
  const handlePlayerClick = (playerIndex: number) => {
    if (!isScoreEditMode && onPlayerSelect) {
      onPlayerSelect(playerIndex);
    }
  };

  // x2ボタンのクリック処理
  const handleX2Click = () => {
    if (!isX2Active) {
      // オンにする場合：全プレイヤーの得点を2倍にする
      setIsX2Active(true);
      onMultiplierAllClick?.(2);
    } else {
      // オフにする場合：全プレイヤーの得点を0.5倍にする（元に戻す）
      setIsX2Active(false);
      onMultiplierAllClick?.(0.5);
    }
  };

  // TODO: Implement drag & drop functionality with react-beautiful-dnd later
  // const handleOnDragEnd = (result: any) => {
  //   if (!result.destination) return;
  //   
  //   const items = Array.from(playerOrder);
  //   const [reorderedItem] = items.splice(result.source.index, 1);
  //   items.splice(result.destination.index, 0, reorderedItem);
  //   
  //   setPlayerOrder(items);
  //   onPlayerOrderChange(items);
  // };

  return (
    <Box sx={{ p: 2, maxWidth: '1400px', mx: 'auto' }}>
      {/* 1. ラック情報 */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', mb: racksUntilOrderChange ? 1 : 0 }}>
            ラック {currentRack}
          </Typography>
          
          {racksUntilOrderChange && (
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              順替えまで {racksUntilOrderChange}ラック
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* 縦一列レイアウト */}
          {/* 2. プレイヤーパネル */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                {game.players.map((player, playerIndex) => (
                  <Grid item xs={12} sm={6} md={4} key={player.id}>
                    <Card 
                      variant="outlined"
                      sx={{
                        border: player.isActive ? `2px solid ${AppColors.theme.primary}` : '1px solid rgba(0,0,0,0.12)',
                        opacity: isScoreEditMode ? 0.5 : 1,
                        cursor: isScoreEditMode ? 'default' : 'pointer',
                        '&:hover': {
                          backgroundColor: isScoreEditMode ? 'transparent' : 'rgba(0, 0, 0, 0.04)',
                        }
                      }}
                      onClick={() => handlePlayerClick(playerIndex)}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom>{player.name}</Typography>
                        
                        {/* 取得したボールのアイコン表示エリア */}
                        <Box sx={{ 
                          minHeight: 40, 
                          border: '1px dashed #ccc', 
                          borderRadius: 1, 
                          p: 1, 
                          mb: 2,
                          position: 'relative' // For positioning the points display
                        }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(player.ballsPocketed || []).map((ballNumber, index) => (
                              <BallButton
                                key={`${ballNumber}-${index}`}
                                ballNumber={ballNumber}
                                size="small"
                                isActive={true}
                                disabled={false} // Change to active (not disabled)
                              />
                            ))}
                          </Box>
                          
                          {/* このラックの獲得ポイントを右下に表示 */}
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              position: 'absolute', 
                              bottom: 4, 
                              right: 8, 
                              fontWeight: 'bold',
                              color: AppColors.theme.primary
                            }}
                          >
                            {getCurrentRackPoints(player.id)}
                          </Typography>
                        </Box>
                        
                        {/* 前ラック終了時の累計ポイント */}
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: getPreviousRackTotalPoints(player.id) >= 0 ? AppColors.theme.primary : '#d32f2f'
                          }}
                        >
                          {getPreviousRackTotalPoints(player.id)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* ボールアイコン表示（ハンディキャップボールのみ） */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {japanSettings.handicapBalls.sort((a, b) => a - b).map((ballNumber) => (
                  <Grid item key={ballNumber}>
                    <BallButton
                      ballNumber={ballNumber}
                      onClick={onBallClick}
                      size="medium"
                      disabled={isScoreEditMode}
                      isActive={true}
                    />
                  </Grid>
                ))}
              </Grid>
              
              {/* x2ボタンと倍率ボタン */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
                <Button
                  variant={isX2Active ? "contained" : "outlined"}
                  color={isX2Active ? "primary" : "info"}
                  size="small"
                  disabled={isScoreEditMode}
                  onClick={handleX2Click}
                  sx={{
                    backgroundColor: isX2Active ? AppColors.theme.primary : 'transparent',
                    '&:hover': {
                      backgroundColor: isX2Active ? AppColors.theme.primaryDark : 'transparent',
                    }
                  }}
                >
                  x2
                </Button>
                
                {/* 倍率ボタンが有効な場合 */}
                {japanSettings.multipliersEnabled && (
                  <>
                    {japanSettings.multipliers.map((multiplier, index) => (
                      <Button
                        key={index}
                        variant="outlined"
                        color="success"
                        size="small"
                        onClick={() => onMultiplierClick(multiplier)}
                        disabled={isScoreEditMode}
                      >
                        {multiplier.label}
                      </Button>
                    ))}
                  </>
                )}
              </Box>
            </CardContent>
          </Card>


          {japanSettings.deductionEnabled && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>減点</Typography>
                <Grid container spacing={1}>
                  {japanSettings.deductions.map((deduction, index) => (
                    <Grid item key={index}>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => onDeductionClick(deduction)}
                        disabled={isScoreEditMode}
                      >
                        {deduction.label}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        {/* 3. ポイント累計確認パネル（ボーラード風デザイン） */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              
              {/* ボーラード風スコア表 - 順替え単位で分割表示 */}
              {(() => {
                const orderChangeInterval = japanSettings.orderChangeInterval;
                const maxRack = Math.max(currentRack, orderChangeInterval);
                const tableCount = Math.ceil(maxRack / orderChangeInterval);
                
                // Calculate dynamic width for player name column based on longest name
                const longestPlayerName = game.players.reduce((longest, player) => 
                  player.name.length > longest.length ? player.name : longest, '');
                // Increase width calculation to prevent name cutoff: more generous padding
                const playerColumnWidth = Math.max(80, longestPlayerName.length * 10 + 24);
                
                return Array.from({ length: tableCount }, (_, tableIndex) => {
                  const startRack = tableIndex * orderChangeInterval + 1;
                  const endRack = Math.min((tableIndex + 1) * orderChangeInterval, maxRack);
                  const racksInThisTable = endRack - startRack + 1;
                  
                  return (
                    <Box key={`table-${tableIndex}`} sx={{ 
                      mb: tableIndex < tableCount - 1 ? 3 : 0,
                      border: `2px solid ${AppColors.theme.primary}`,
                      width: 'fit-content', // Remove excess width and fit to content
                      maxWidth: '100%',
                      overflowX: 'auto'
                    }}>
                      {/* Header row with rack numbers */}
                      <Box sx={{ display: 'flex' }}>
                        {/* No player column header */}
                        <Box sx={{ 
                          width: `${playerColumnWidth}px`, 
                          padding: '8px',
                          backgroundColor: AppColors.neutral.background,
                          borderRight: `1px solid ${AppColors.theme.primary}`,
                          borderBottom: `1px solid ${AppColors.theme.primary}`,
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {/* Empty header cell */}
                        </Box>
                        {Array.from({ length: racksInThisTable }, (_, i) => (
                          <Box
                            key={`rack-header-${startRack + i}`}
                            sx={{
                              minWidth: '60px',
                              padding: '8px',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              backgroundColor: AppColors.neutral.background,
                              borderRight: i === racksInThisTable - 1 ? 'none' : `1px solid ${AppColors.theme.primary}`,
                              borderBottom: `1px solid ${AppColors.theme.primary}`,
                              fontSize: '0.875rem'
                            }}
                          >
                            {startRack + i}
                          </Box>
                        ))}
                      </Box>

                      {/* Player rows */}
                      {(() => {
                        // Get the correct player order for this table period
                        const playerOrderForThisPeriod = getPlayerOrderForRackPeriod(startRack, endRack);
                        const orderedPlayers = playerOrderForThisPeriod.map(playerId => 
                          game.players.find(p => p.id === playerId)!
                        ).filter(Boolean);
                        
                        return orderedPlayers.map((player, playerIndex) => (
                        <Box key={`player-row-${player.id}-table-${tableIndex}`} sx={{ display: 'flex' }}>
                          {/* Player name */}
                          <Box sx={{
                            width: `${playerColumnWidth}px`,
                            padding: '8px',
                            borderRight: `1px solid ${AppColors.theme.primary}`,
                            borderBottom: playerIndex === orderedPlayers.length - 1 ? 'none' : `1px solid ${AppColors.theme.primary}`,
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: player.isActive ? `${AppColors.theme.primary}20` : 'transparent',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {player.name}
                          </Box>
                          
                          {/* Rack data columns */}
                          {Array.from({ length: racksInThisTable }, (_, i) => {
                            const rackNumber = startRack + i;
                            const rackData = game.japanRackHistory?.find(r => r.rackNumber === rackNumber);
                            const playerRackData = rackData?.playerResults.find(pr => pr.playerId === player.id);
                            
                            return (
                              <Box
                                key={`${player.id}-rack-${rackNumber}`}
                                sx={{
                                  minWidth: '60px',
                                  borderRight: i === racksInThisTable - 1 ? 'none' : `1px solid ${AppColors.theme.primary}`,
                                  borderBottom: playerIndex === orderedPlayers.length - 1 ? 'none' : `1px solid ${AppColors.theme.primary}`,
                                  display: 'flex',
                                  flexDirection: 'column'
                                }}
                              >
                                {/* First row: 2 columns (earned points and delta points) - like bowling score */}
                                <Box sx={{
                                  display: 'flex',
                                  height: '24px',
                                  borderBottom: `1px solid ${AppColors.theme.primary}`
                                }}>
                                  {/* Left column: Earned points */}
                                  <Box sx={{
                                    flex: 1,
                                    padding: '2px',
                                    textAlign: 'center',
                                    fontSize: '0.7rem',
                                    backgroundColor: rackData ? AppColors.neutral.background : 'transparent',
                                    borderRight: `1px solid ${AppColors.theme.primary}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    {playerRackData?.earnedPoints ?? ''}
                                  </Box>
                                  
                                  {/* Right column: Delta points */}
                                  <Box sx={{
                                    flex: 1,
                                    padding: '2px',
                                    textAlign: 'center',
                                    fontSize: '0.7rem',
                                    backgroundColor: rackData ? AppColors.neutral.background : 'transparent',
                                    color: playerRackData && playerRackData.deltaPoints > 0 ? AppColors.theme.primary : 
                                           playerRackData && playerRackData.deltaPoints < 0 ? '#d32f2f' : 'inherit',
                                    fontWeight: playerRackData?.deltaPoints !== 0 ? 'bold' : 'normal',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    {playerRackData?.deltaPoints !== undefined ? 
                                      (playerRackData.deltaPoints > 0 ? `+${playerRackData.deltaPoints}` : `${playerRackData.deltaPoints}`) : 
                                      ''
                                    }
                                  </Box>
                                </Box>
                                
                                {/* Second row: Total points */}
                                <Box sx={{
                                  height: '24px',
                                  padding: '2px',
                                  textAlign: 'center',
                                  fontSize: '0.8rem',
                                  backgroundColor: rackData ? AppColors.neutral.background : 'transparent',
                                  fontWeight: 'bold',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  {playerRackData?.totalPoints ?? ''}
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                      ));
                      })()}
                    </Box>
                  );
                });
              })()}
            </CardContent>
          </Card>

          {/* 4. ポイント遷移グラフ */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>ポイント遷移</Typography>
              <Box 
                data-testid="point-transition-graph"
                sx={{ 
                  height: 200, 
                  border: '1px dashed #ccc', 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography color="text.secondary">
                  グラフ表示エリア
                </Typography>
              </Box>
            </CardContent>
          </Card>

      {/* 5. 操作ボタン */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* 左寄せボタン */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" color="warning" onClick={onUndo}>
              取り消し
            </Button>
            <Button variant="contained" color="primary" onClick={handleNextRack}>
              次ラックへ
            </Button>
          </Box>
          
          {/* 右寄せボタン */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant={isScoreEditMode ? 'contained' : 'outlined'} 
              color="info" 
              onClick={onScoreEditToggle}
            >
              スコア修正
            </Button>
            <Button variant="outlined" color="error" onClick={onEndGame}>
              ゲーム終了
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Player Order Change Dialog */}
      <PlayerOrderChangeDialog
        open={showOrderChangeDialog}
        players={game.players}
        currentRack={game.currentRack}
        onConfirm={handleOrderChangeConfirm}
        onCancel={handleOrderChangeCancel}
      />
    </Box>
  );
};

export default JapanGameScreen;