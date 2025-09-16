import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  Link,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  FiberManualRecord,
} from '@mui/icons-material';
import type { Game } from '../../../types/index';
import { AppColors } from '../../../constants/colors';

type DisplayMode = 'pagination' | 'fullDisplay';

interface JapanCumulativePointsTableProps {
  game: Game;
  shouldShowCumulativePoints?: () => boolean;
  onEndGame?: () => void;
  defaultDisplayMode?: DisplayMode;
}

const JapanCumulativePointsTable: React.FC<JapanCumulativePointsTableProps> = ({
  game,
  shouldShowCumulativePoints = () => true, // Default: show cumulative points
  onEndGame,
  defaultDisplayMode = 'fullDisplay',
}) => {
  const japanSettings = game.japanSettings!;
  const currentRack = game.currentRack;

  // Display mode and pagination state
  const [displayMode, setDisplayMode] = useState<DisplayMode>(defaultDisplayMode);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Calculate total number of pages and current page
  const orderChangeInterval = japanSettings.orderChangeInterval;
  const currentPeriod = Math.ceil(currentRack / orderChangeInterval);
  const maxRack = currentPeriod * orderChangeInterval;
  const totalPages = Math.ceil(maxRack / orderChangeInterval);
  const currentRackPageIndex = currentPeriod - 1; // Convert to 0-based index

  // Set initial page to current rack period when display mode changes to pagination
  useEffect(() => {
    if (displayMode === 'pagination') {
      setCurrentPageIndex(currentRackPageIndex);
    }
  }, [displayMode, currentRackPageIndex]);

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

  // Get previous rack total points for a player (before current rack)
  const getPreviousRackTotalPoints = (playerId: string) => {
    // Rack historyを使って前ラックまでの累計を取得
    if (!game.japanRackHistory || game.japanRackHistory.length === 0) {
      return '0';
    }

    // 現在のラックより前のラックを対象とする
    const previousRacks = game.japanRackHistory.filter(rack => rack.rackNumber < currentRack);
    if (previousRacks.length === 0) {
      return '0';
    }

    // 最後のラック（現在ラック - 1）の累計ポイントを取得
    const lastRack = previousRacks[previousRacks.length - 1];
    const playerResult = lastRack.playerResults.find(result => result.playerId === playerId);
    return playerResult ? playerResult.totalPoints.toString() : '0';
  };

  // Get current rack points for a player (from shot history)
  const getCurrentRackPoints = (playerId: string) => {
    // Find the last rack complete shot index
    let lastRackCompleteIndex = -1;
    for (let i = game.shotHistory.length - 1; i >= 0; i--) {
      if (game.shotHistory[i].customData?.type === 'rack_complete') {
        lastRackCompleteIndex = i;
        break;
      }
    }
    
    // Get shots after the last rack complete
    const currentRackShots = game.shotHistory.slice(lastRackCompleteIndex + 1);
    const playerShots = currentRackShots.filter(shot => 
      shot.playerId === playerId && 
      shot.customData?.type === 'ball_click'
    );
    
    // Calculate points from current rack shots and apply multiplier
    const basePoints = playerShots.reduce((total, shot) => {
      const points = typeof shot.customData?.points === 'number' ? shot.customData.points : 0;
      return total + points;
    }, 0);
    
    // Apply multiplier
    const multiplier = game.japanCurrentMultiplier || 1;
    return basePoints * multiplier;
  };

  return (
    <Card>
      <CardContent>
        {/* ボーラード風スコア表 - 順替え単位で分割表示 */}
        {(() => {
          // Calculate fixed width for player name column based on longest name
          const longestPlayerName = game.players.reduce((longest, player) => 
            player.name.length > longest.length ? player.name : longest, '');
          // Fixed width calculation to prevent name cutoff: more generous padding
          const playerColumnWidth = Math.max(100, longestPlayerName.length * 12 + 32);
          
          // Determine which tables to display based on display mode
          const tablesToShow = displayMode === 'pagination' 
            ? [currentPageIndex] // Show only current page
            : Array.from({ length: totalPages }, (_, i) => i); // Show all pages
          
          return tablesToShow.map((tableIndex) => {
            const startRack = tableIndex * orderChangeInterval + 1;
            const endRack = Math.min((tableIndex + 1) * orderChangeInterval, maxRack);
            const racksInThisTable = endRack - startRack + 1;
            
            // Check if current rack is in this table period
            const isCurrentPeriodTable = currentRack >= startRack && currentRack <= endRack;
            
            return (
              <Box key={`table-${tableIndex}`} sx={{ 
                mb: displayMode === 'fullDisplay' && tableIndex < tablesToShow.length - 1 ? 3 : 0,
                border: `2px solid ${AppColors.theme.primary}`,
                display: 'flex',
                width: '100%',
                overflow: 'hidden' // Prevent table from expanding beyond container
              }}>
                {/* Fixed player name column */}
                <Box sx={{ 
                  flexShrink: 0,
                  borderRight: `2px solid ${AppColors.theme.primary}`,
                  zIndex: 1,
                  position: 'sticky',
                  left: 0,
                  backgroundColor: 'white'
                }}>
                  {/* Player name header */}
                  <Box sx={{ 
                    width: `${playerColumnWidth}px`, 
                    padding: '8px',
                    backgroundColor: 'white',
                    borderBottom: `1px solid ${AppColors.theme.primary}`,
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '40px' // ヘッダーの固定高さをスコア側と合わせる
                  }}>
                    {/* Empty header cell */}
                  </Box>
                  
                  {/* Player name rows */}
                  {(() => {
                    const playerOrderForThisPeriod = getPlayerOrderForRackPeriod(startRack, endRack);
                    const orderedPlayers = playerOrderForThisPeriod.map(playerId => 
                      game.players.find(p => p.id === playerId)!
                    ).filter(Boolean);
                    
                    return orderedPlayers.map((player, playerIndex) => (
                      <Box key={`player-name-${player.id}-table-${tableIndex}`} sx={{
                        width: `${playerColumnWidth}px`,
                        padding: '4px',
                        borderBottom: playerIndex === orderedPlayers.length - 1 ? 'none' : `1px solid ${AppColors.theme.primary}`,
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: (player.isActive && isCurrentPeriodTable) ? `${AppColors.theme.primary}20` : 'white',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        height: '58px' // Match actual score cell height (24px + 1px border + 33px)
                      }}>
                        {player.name}
                      </Box>
                    ));
                  })()}
                </Box>
                
                {/* Scrollable score columns */}
                <Box sx={{ 
                  flex: 1,
                  overflowX: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 0 // Allow flex item to shrink
                }}>
                  {/* Header row with rack numbers */}
                  <Box sx={{ display: 'flex', flexShrink: 0 }}>
                    {Array.from({ length: racksInThisTable }, (_, i) => (
                      <Box
                        key={`rack-header-${startRack + i}`}
                        sx={{
                          minWidth: startRack + i === currentRack && i === racksInThisTable - 1 ? '61px' : '60px', // Add 1px width for current rack at table end
                          flex: 1,
                          padding: '2px',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: '1.2rem',
                          backgroundColor: startRack + i === currentRack ? `${AppColors.theme.primary}30` : AppColors.neutral.background,
                          color: startRack + i === currentRack ? AppColors.theme.primary : 'inherit',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderBottom: `1px solid ${AppColors.theme.primary}`,
                          borderRight: i === racksInThisTable - 1 ? 'none' : `1px solid ${AppColors.theme.primary}`,
                          ...(startRack + i === currentRack && {
                            borderLeft: `1px solid ${AppColors.theme.primary} !important`,
                            borderTop: `1px solid ${AppColors.theme.primary} !important`,
                            borderRight: `2px solid ${AppColors.theme.primary} !important`,
                            borderBottom: `1px solid ${AppColors.theme.primary} !important`,
                            borderColor: `${AppColors.theme.primary} !important`
                          })
                        }}
                      >
                        {startRack + i}
                      </Box>
                    ))}
                  </Box>
                  
                  {/* Player score rows */}
                  {(() => {
                    const playerOrderForThisPeriod = getPlayerOrderForRackPeriod(startRack, endRack);
                    const orderedPlayers = playerOrderForThisPeriod.map(playerId => 
                      game.players.find(p => p.id === playerId)!
                    ).filter(Boolean);
                    
                    return orderedPlayers.map((player, playerIndex) => (
                      <Box key={`player-scores-${player.id}-table-${tableIndex}`} sx={{
                        display: 'flex',
                        borderBottom: playerIndex === orderedPlayers.length - 1 ? 'none' : `1px solid ${AppColors.theme.primary}`
                      }}>
                        {Array.from({ length: racksInThisTable }, (_, i) => {
                          const rackNumber = startRack + i;
                          
                          // ラック履歴から該当ラックのデータを取得
                          const rackData = game.japanRackHistory?.find(rack => rack.rackNumber === rackNumber);
                          const playerRackData = rackData?.playerResults.find(result => result.playerId === player.id);
                          
                          return (
                            <Box key={`score-${player.id}-${rackNumber}`} sx={{
                              minWidth: rackNumber === currentRack && i === racksInThisTable - 1 ? '61px' : '60px', // Add 1px width for current rack at table end
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              height: '58px', // Correct height: 24px + 1px border + 33px
                              backgroundColor: rackNumber === currentRack ? `${AppColors.theme.primary}10` : 'transparent',
                              ...(rackNumber === currentRack 
                                ? {
                                    borderLeft: `1px solid ${AppColors.theme.primary}`,
                                    borderRight: `2px solid ${AppColors.theme.primary}`,
                                    borderBottom: playerIndex === orderedPlayers.length - 1 ? `1px solid ${AppColors.theme.primary}` : 'none'
                                  }
                                : {
                                    borderRight: i === racksInThisTable - 1 ? 'none' : `1px solid ${AppColors.theme.primary}`
                                  }
                              )
                            }}>
                              {/* First row: Split into earned points (left) and delta points (right) */}
                              <Box sx={{
                                height: '24px', // Adjusted for alignment
                                display: 'flex',
                                borderBottom: `1px solid ${AppColors.theme.primary}`
                              }}>
                                {/* Left half: Earned points */}
                                <Box sx={{
                                  flex: 1,
                                  padding: '1px',
                                  textAlign: 'center',
                                  fontSize: '1rem',
                                  backgroundColor: rackData ? 'white' : 'transparent',
                                  fontWeight: 'bold',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRight: `1px solid ${AppColors.theme.primary}`,
                                  color: 'inherit' // Earned points are always positive, keep black
                                }}>
                                  {rackData 
                                    ? (playerRackData?.earnedPoints ?? '') // Show historical earned points if data exists
                                    : rackNumber === currentRack 
                                      ? (getCurrentRackPoints(player.id) || '') // Show current rack points only if no historical data
                                      : '' // Empty for future racks
                                  }
                                </Box>
                                {/* Right half: Delta points */}
                                <Box sx={{
                                  flex: 1,
                                  padding: '1px',
                                  textAlign: 'center',
                                  fontSize: '1rem',
                                  backgroundColor: rackData ? 'white' : 'transparent',
                                  fontWeight: 'bold',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: playerRackData?.deltaPoints && playerRackData.deltaPoints > 0 ? '#1976d2' : 
                                         playerRackData?.deltaPoints && playerRackData.deltaPoints < 0 ? '#d32f2f' : 'inherit'
                                }}>
                                  {rackData 
                                    ? (playerRackData?.deltaPoints ?? '') // Show historical delta points if data exists
                                    : '' // Empty for current rack (not yet calculated) or future racks
                                  }
                                </Box>
                              </Box>
                              
                              {/* Second row: Total points (full width) */}
                              <Box sx={{
                                height: '33px', // Adjusted height for alignment (24px + 1px border + 33px = 58px)
                                padding: '1px',
                                textAlign: 'center',
                                fontSize: '1.4rem', // Larger font size for total points
                                backgroundColor: rackData ? 'white' : 'transparent',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: (() => {
                                  const totalPoints = rackData 
                                    ? (playerRackData?.totalPoints ?? 0) // Use historical data if available
                                    : (shouldShowCumulativePoints() && rackNumber === currentRack) 
                                      ? parseInt(getPreviousRackTotalPoints(player.id)) || 0 
                                      : 0;
                                  return totalPoints > 0 ? '#1976d2' : totalPoints < 0 ? '#d32f2f' : 'inherit';
                                })()
                              }}>
                                {rackData 
                                  ? (playerRackData?.totalPoints ?? '') // Show historical total points if data exists
                                  : (shouldShowCumulativePoints() && rackNumber === currentRack) 
                                    ? getPreviousRackTotalPoints(player.id) 
                                    : '' // Empty for future racks or current rack without cumulative points
                                }
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    ));
                  })()}
                </Box>
              </Box>
            );
          });
        })()}
        
        {/* Bottom controls: Pagination on left, Game end button on right */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          {/* Pagination controls on the left */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Previous page button */}
            <IconButton
              size="small"
              disabled={displayMode === 'fullDisplay' || currentPageIndex === 0}
              onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
              sx={{ 
                color: displayMode === 'fullDisplay' || currentPageIndex === 0 
                  ? 'text.disabled' 
                  : 'text.primary' 
              }}
            >
              <ChevronLeft />
            </IconButton>
            
            {/* Current page indicator / Return to current button */}
            <IconButton
              size="small"
              disabled={displayMode === 'fullDisplay' || currentPageIndex === currentRackPageIndex}
              onClick={() => setCurrentPageIndex(currentRackPageIndex)}
              sx={{ 
                color: displayMode === 'fullDisplay' || currentPageIndex === currentRackPageIndex
                  ? 'text.disabled' 
                  : 'text.primary' 
              }}
            >
              <FiberManualRecord fontSize="small" />
            </IconButton>
            
            {/* Next page button */}
            <IconButton
              size="small"
              disabled={displayMode === 'fullDisplay' || currentPageIndex >= totalPages - 1}
              onClick={() => setCurrentPageIndex(Math.min(totalPages - 1, currentPageIndex + 1))}
              sx={{ 
                color: displayMode === 'fullDisplay' || currentPageIndex >= totalPages - 1
                  ? 'text.disabled' 
                  : 'text.primary' 
              }}
            >
              <ChevronRight />
            </IconButton>
            
            {/* Display mode toggle link */}
            <Link
              component="button"
              variant="body2"
              onClick={() => setDisplayMode(displayMode === 'pagination' ? 'fullDisplay' : 'pagination')}
              sx={{ 
                ml: 1,
                cursor: 'pointer',
                textDecoration: 'underline',
                color: 'primary.main',
                '&:hover': {
                  textDecoration: 'none',
                },
              }}
            >
              {displayMode === 'pagination' ? '一覧表示' : 'ページ切替'}
            </Link>
          </Box>
          
          {/* Game end button on the right */}
          {onEndGame && (
            <Button variant="outlined" color="error" size="small" onClick={onEndGame}>
              ゲーム終了
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default JapanCumulativePointsTable;