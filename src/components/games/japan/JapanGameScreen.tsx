import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
} from '@mui/material';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { Game } from '../../../types/index';
import { BallButton, NumberInputStepper } from '../../common';
import { AppColors } from '../../../constants/colors';
import PlayerOrderChangeDialog from './PlayerOrderChangeDialog';
import JapanCumulativePointsTable from './JapanCumulativePointsTable';
import JapanScoreChart from './JapanScoreChart';

interface JapanGameScreenProps {
  game: Game;
  onBallClick: (ballNumber: number) => void;
  onMultiplierChange: (multiplier: number) => void;
  onNextRack: () => void;
  onUndo: () => void;
  onEndGame: () => void;
  onPlayerOrderChange: (selectedPlayerId: string) => void;
  onPlayerSelect?: (playerIndex: number) => void;
}

const JapanGameScreen: React.FC<JapanGameScreenProps> = ({
  game,
  onBallClick,
  onMultiplierChange,
  onNextRack,
  onUndo,
  onEndGame,
  onPlayerOrderChange,
  onPlayerSelect,
}) => {
  const japanSettings = game.japanSettings!;
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

  
  // 1. ラック情報
  const currentRack = game.currentRack;
  
  // 現在ラックでのポイント計算（ショット履歴から算出）
  const getCurrentRackPoints = (playerId: string) => {
    // 最後のラック完了ショットのインデックスを見つける
    let lastRackCompleteIndex = -1;
    for (let i = game.shotHistory.length - 1; i >= 0; i--) {
      if (game.shotHistory[i].customData?.type === 'rack_complete') {
        lastRackCompleteIndex = i;
        break;
      }
    }
    
    // 最後のラック完了以降のショットのみを対象とする
    const currentRackShots = game.shotHistory.slice(lastRackCompleteIndex + 1);
    const playerShots = currentRackShots.filter(shot => 
      shot.playerId === playerId && 
      shot.customData?.type === 'ball_click'
    );
    
    // 現在ラックのショットからポイントを計算し、倍率を適用
    const basePoints = playerShots.reduce((total, shot) => {
      const points = typeof shot.customData?.points === 'number' ? shot.customData.points : 0;
      return total + points;
    }, 0);
    
    // 倍率を適用
    const multiplier = game.japanCurrentMultiplier || 1;
    return basePoints * multiplier;
  };
  
  // ゲーム終了状態かどうかを判定
  const isGameEnded = () => {
    // ショット履歴に game_complete が含まれている場合はゲーム終了状態
    return game.shotHistory.some(shot => shot.customData?.type === 'game_complete');
  };

  // プレイヤーパネル用：累計ポイントを表示すべきかどうかを判定
  const shouldShowCumulativePointsInPlayerPanel = () => {
    // 過去のラック履歴がある場合は累計ポイントを表示
    return game.japanRackHistory && game.japanRackHistory.length > 0;
  };

  // 累計表用：現在ラックの累計ポイントは表示しない
  const shouldShowCumulativePointsInTable = () => {
    // 累計表では現在のラックの累計ポイントは表示しない
    return false;
  };

  // 前ラック終了時の累計ポイントを取得（プレイヤーパネル用）
  const getPreviousRackTotalPoints = (playerId: string) => {
    if (!game.japanRackHistory || game.japanRackHistory.length === 0) {
      return '0'; // ラック1では0を表示
    }
    
    // ゲーム終了状態の場合は、最終ラック結果を返す
    if (isGameEnded()) {
      const lastRackResult = game.japanRackHistory[game.japanRackHistory.length - 1];
      const playerResult = lastRackResult?.playerResults.find(pr => pr.playerId === playerId);
      return (playerResult?.totalPoints || 0).toString();
    }
    
    // 通常時：最新のラック履歴から該当プレイヤーのtotalPointsを取得
    const lastRackResult = game.japanRackHistory[game.japanRackHistory.length - 1];
    const playerResult = lastRackResult?.playerResults.find(pr => pr.playerId === playerId);
    return (playerResult?.totalPoints || 0).toString();
  };

  // 前ラック終了時の累計ポイントを数値で取得（色判定用）
  const getPreviousRackTotalPointsAsNumber = (playerId: string) => {
    if (!game.japanRackHistory || game.japanRackHistory.length === 0) {
      return 0;
    }
    
    // ゲーム終了状態の場合は、最終ラック結果を返す
    if (isGameEnded()) {
      const lastRackResult = game.japanRackHistory[game.japanRackHistory.length - 1];
      const playerResult = lastRackResult?.playerResults.find(pr => pr.playerId === playerId);
      return playerResult?.totalPoints || 0;
    }
    
    const lastRackResult = game.japanRackHistory[game.japanRackHistory.length - 1];
    const playerResult = lastRackResult?.playerResults.find(pr => pr.playerId === playerId);
    return playerResult?.totalPoints || 0;
  };

  const racksUntilOrderChange = japanSettings.orderChangeEnabled 
    ? japanSettings.orderChangeInterval - (currentRack % japanSettings.orderChangeInterval)
    : null;

  // Player selection handler
  const handlePlayerClick = (playerIndex: number) => {
    if (onPlayerSelect) {
      onPlayerSelect(playerIndex);
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

  // プレイヤー数に応じて最大幅を動的に設定
  const getMaxWidth = () => {
    const playerCount = game.players.length;
    if (playerCount <= 2) return '1000px';  // 2人まで - プレイヤーカードが適切な幅になるよう調整
    if (playerCount === 3) return '1200px'; // 3人
    return '1400px'; // 4人以上
  };

  return (
    <Box sx={{ p: 2, maxWidth: getMaxWidth(), mx: 'auto' }}>
      {/* プレイヤーパネル */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              {/* ラック情報と倍率入力を左上に表示 */}
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                    ラック {currentRack}
                  </Typography>
                  {racksUntilOrderChange && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      （順替えまで {racksUntilOrderChange}ラック）
                    </Typography>
                  )}
                </Box>
                
                {/* 倍率入力 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 'auto' }}>
                    倍率
                  </Typography>
                  <NumberInputStepper
                    value={game.japanCurrentMultiplier || 1}
                    onChange={onMultiplierChange}
                    min={1}
                    max={100}
                    step={1}
                  />
                </Box>
              </Box>
              <Grid container spacing={2}>
                {game.players.map((player, playerIndex) => (
                  <Grid item 
                    xs={12} 
                    sm={game.players.length === 2 ? 6 : 6} 
                    md={game.players.length === 2 ? 6 : 4} 
                    lg={game.players.length === 2 ? 6 : game.players.length <= 3 ? 4 : 3} 
                    xl={game.players.length === 2 ? 6 : game.players.length <= 3 ? 4 : 3} 
                    key={player.id}>
                    <Card 
                      variant="outlined"
                      sx={{
                        border: player.isActive ? `2px solid ${AppColors.theme.primary}` : '1px solid rgba(0,0,0,0.12)',
                        opacity: 1,
                        cursor: 'pointer',
                        position: 'relative', // For positioning the cumulative points
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        }
                      }}
                      onClick={() => handlePlayerClick(playerIndex)}
                    >
                      <CardContent sx={{ pb: 1, '&:last-child': { pb: 1 } }}>
                        {/* プレイヤー名称と総合ポイントを同じ行に配置 */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {player.name}
                          </Typography>
                          
                          {/* 総合ポイントを同じ行の右側に表示（枠なし） */}
                          {shouldShowCumulativePointsInPlayerPanel() && (
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                fontWeight: 'bold',
                                color: (() => {
                                  const points = getPreviousRackTotalPointsAsNumber(player.id);
                                  return points >= 0 ? AppColors.theme.primary : '#d32f2f';
                                })()
                              }}
                            >
                              {getPreviousRackTotalPoints(player.id)}
                            </Typography>
                          )}
                        </Box>
                        
                        {/* 取得したボールのアイコン表示エリア */}
                        <Box sx={{ 
                          minHeight: 48, // Increased height to accommodate xs size balls
                          border: '1px dashed #ccc', 
                          borderRadius: 1, 
                          p: 1, 
                          position: 'relative' // For positioning the points display
                        }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(player.ballsPocketed || []).map((ballNumber, index) => (
                              <BallButton
                                key={`${ballNumber}-${index}`}
                                ballNumber={ballNumber}
                                size="xs"
                                isActive={true}
                                disabled={false}
                              />
                            ))}
                          </Box>
                          
                          {/* このラックの獲得ポイントを右下に表示（ゲーム終了時は非表示） */}
                          {!isGameEnded() && (
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
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* ボールアイコン、操作ボタンを統合表示（ゲーム終了時は非表示） */}
              {!isGameEnded() && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                {/* 左側: ハンディキャップボール */}
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  {/* ハンディキャップボール */}
                  {japanSettings.handicapBalls.sort((a, b) => a - b).map((ballNumber) => (
                    <BallButton
                      key={ballNumber}
                      ballNumber={ballNumber}
                      onClick={onBallClick}
                      size="medium"
                      disabled={false}
                      isActive={true}
                    />
                  ))}
                  
                  
                  
                </Box>
                
                {/* 右側: 操作ボタン */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" color="warning" size="small" onClick={onUndo}>
                    取り消し
                  </Button>
                  <Button variant="contained" color="primary" size="small" onClick={handleNextRack}>
                    次ラックへ
                  </Button>
                </Box>
              </Box>
              )}
            </CardContent>
          </Card>
      
      {/* 3. ポイント累計確認パネル */}
      <Box sx={{ mb: 3 }}>
        <JapanCumulativePointsTable 
          game={game} 
          shouldShowCumulativePoints={shouldShowCumulativePointsInTable}
          onEndGame={onEndGame}
          defaultDisplayMode="pagination"
        />
      </Box>

      {/* 4. スコア推移グラフパネル */}
      {game.japanRackHistory && game.japanRackHistory.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <JapanScoreChart 
            game={game} 
            height={250}
            showTitle={false}
            showCard={true}
          />
        </Box>
      )}

      {/* Player Order Change Dialog */}
      <PlayerOrderChangeDialog
        open={showOrderChangeDialog}
        players={game.players}
        currentRack={game.currentRack}
        game={game}
        onConfirm={handleOrderChangeConfirm}
        onCancel={handleOrderChangeCancel}
        onEndGame={onEndGame}
      />
    </Box>
  );
};

export default JapanGameScreen;