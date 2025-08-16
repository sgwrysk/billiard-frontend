import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { 
  EmojiEvents, 
  Refresh, 
  Home, 
  Star,
  AccessTime,
  SportsEsports 
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useLanguage } from '../contexts/LanguageContext';
import type { Game, PlayerStats } from '../types/index';
import { GameType } from '../types/index';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface VictoryScreenProps {
  game: Game;
  playerStats: PlayerStats[];
  onRematch: () => void;
  onBackToMenu: () => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({
  game,
  playerStats,
  onRematch,
  onBackToMenu,
}) => {
  const { t, language } = useLanguage();
  const winner = game.players.find(p => p.id === game.winner);

  
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

  const getGameDuration = () => {
    if (!game.endTime) return language === 'en' ? 'Unknown' : '不明';
    const duration = game.endTime.getTime() - game.startTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return language === 'en' ? `${minutes}m ${seconds}s` : `${minutes}分${seconds}秒`;
  };

  const getPlayerStats = (playerName: string) => {
    return playerStats.find(stats => stats.name === playerName);
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



  const generateChartData = () => {
    if (game.type === GameType.BOWLARD) {
      return generateBowlardChartData();
    }

    if (!game.scoreHistory || game.scoreHistory.length === 0) {
      return null;
    }

    // Organize score progression for each player
    const playerColors = ['#2196F3', '#F44336', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4'];
    const datasets = game.players.map((player, index) => {
      const playerScoreHistory = game.scoreHistory
        .filter(entry => entry.playerId === player.id)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      return {
        label: player.name,
        data: playerScoreHistory.map(entry => entry.score),
        borderColor: playerColors[index % playerColors.length],
        backgroundColor: playerColors[index % playerColors.length] + '20',
        tension: 0.1,
      };
    });

    // X-axis labels (shot numbers)
    const maxDataLength = Math.max(...datasets.map(d => d.data.length));
    const labels = Array.from({ length: maxDataLength }, (_, i) => `${i + 1}`);

    return {
      labels,
      datasets,
    };
  };

  // Generate chart data for Bowlard game
  const generateBowlardChartData = () => {
    const player = game.players[0];
    if (!player?.bowlingFrames) {
      return null;
    }

    const completedFrames = player.bowlingFrames.filter(frame => frame.isComplete);
    if (completedFrames.length === 0) {
      return null;
    }

    // Create data points for completed frames
    const labels = completedFrames.map(frame => `${frame.frameNumber}`);
    const scores = completedFrames.map(frame => frame.score || 0);

    return {
      labels,
      datasets: [
        {
          label: player.name,
          data: scores,
          borderColor: '#2196F3',
          backgroundColor: '#2196F320',
          tension: 0.1,
          fill: true,
        },
      ],
    };
  };

  // Generate set history table for Set Match
  const generateSetHistoryTable = () => {
    if (game.type !== GameType.SET_MATCH || !game.scoreHistory || game.scoreHistory.length === 0) {
      return null;
    }

    // Get all set wins in chronological order
    const setWins = game.scoreHistory
      .filter(entry => entry.ballNumber === 0) // Set match entries have ballNumber 0
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const totalSetsPlayed = setWins.length; // Total number of sets played
    
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.50' }}>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>
                {t('victory.player')}
              </TableCell>
              {Array.from({ length: totalSetsPlayed }, (_, i) => (
                <TableCell key={i + 1} align="center" sx={{ fontWeight: 'bold', minWidth: 50 }}>
                  {i + 1}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {game.players.map(player => (
              <TableRow key={player.id}>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                  {player.name}
                </TableCell>
                {Array.from({ length: totalSetsPlayed }, (_, setIndex) => {
                  const setNumber = setIndex + 1;
                  const isWinner = setWins[setIndex]?.playerId === player.id;
                  
                  return (
                    <TableCell key={setNumber} align="center">
                      {isWinner ? (
                        <Typography variant="h6" color="success.main">
                          ⭕
                        </Typography>
                      ) : (
                        <Typography variant="h6" color="grey.300">
                          ⚪
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        display: game.type !== GameType.BOWLARD, // Hide legend for single-player Bowlard
      },
      title: {
        display: true,
        text: t('victory.scoreProgression'),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: t('game.score'),
        },
      },
      x: {
        title: {
          display: true,
          text: game.type === GameType.BOWLARD ? 'フレーム' : 'ショット数',
        },
      },
    },
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* 勝利アナウンス（ボーラード以外のみ） */}
      {game.type !== GameType.BOWLARD && (
        <Card sx={{ mb: 3, bgcolor: 'success.50', border: '2px solid', borderColor: 'success.main' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <EmojiEvents sx={{ fontSize: 80, color: 'gold', mb: 2 }} />
            <Typography variant="h3" component="h1" gutterBottom color="success.dark">
              🎉 勝利！ 🎉
            </Typography>
            {winner && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'success.main',
                    width: 64,
                    height: 64,
                    fontSize: '2rem'
                  }}
                >
                  {winner.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h2">
                    {winner.name}
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {winner.score}点
                  </Typography>
                  {getPlayerStats(winner.name) && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'center' }}>
                      <Chip 
                        icon={<Star />}
                        label={`通算 ${getPlayerStats(winner.name)?.totalWins}勝`}
                        color="warning"
                        variant="filled"
                      />
                      <Chip 
                        icon={<SportsEsports />}
                        label={`${getPlayerStats(winner.name)?.totalGames}戦`}
                        color="info"
                        variant="outlined"
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* ボーラード用のボーリングスコア詳細（ゲーム詳細の上に移動） */}
      {game.type === GameType.BOWLARD && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('setup.gameType.bowlard')} - {t('victory.finalScore')}: {game.players[0]?.score || 0}
            </Typography>
            
            {/* ボーリングスコアシート（表形式） */}
            <Box sx={{ overflowX: 'auto' }}>
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
                    {Array.from({ length: 10 }, (_, i) => {
                      const frame = game.players[0]?.bowlingFrames?.[i];
                      const isFrame10 = i === 9;
                      
                      return (
                        <td 
                          key={`rolls-${i}`}
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
                              {Array.from({ length: 3 }, (_, rollIndex) => (
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
                              ))}
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
                      const frame = game.players[0]?.bowlingFrames?.[i];
                      
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
          </CardContent>
        </Card>
      )}

      {/* ゲーム詳細情報 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            ゲーム詳細
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={game.type === GameType.BOWLARD ? 12 : 6}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                  ゲーム情報
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SportsEsports color="primary" />
                    <Typography><strong>種目:</strong> {getGameTypeLabel(game.type)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime color="primary" />
                    <Typography><strong>プレイ時間:</strong> {getGameDuration()}</Typography>
                  </Box>
                  {game.type === GameType.ROTATION && (
                    <Typography><strong>ラック数:</strong> {game.totalRacks}</Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>

            {/* 最終スコア枠（ボーラード以外のみ） */}
            {game.type !== GameType.BOWLARD && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" gutterBottom>
                    最終スコア
                  </Typography>
                  <Stack spacing={2}>
                    {game.players.map(player => {
                      const stats = getPlayerStats(player.name);
                      return (
                        <Box 
                          key={player.id}
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1,
                            borderRadius: 1,
                            bgcolor: player.id === game.winner ? 'success.100' : 'white',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6">
                              {player.name}
                              {player.id === game.winner && ' 👑'}
                            </Typography>
                            {stats && (
                              <Chip 
                                label={`${stats.totalWins}勝`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            )}
                          </Box>
                          <Typography variant="h6" color="primary">
                            {player.score}点
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* セットマッチ: セット獲得履歴テーブル */}
      {game.type === GameType.SET_MATCH && generateSetHistoryTable() && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('victory.setHistory')}
            </Typography>
            {generateSetHistoryTable()}
          </CardContent>
        </Card>
      )}

      {/* その他のゲーム: スコア推移グラフ */}
      {game.type !== GameType.SET_MATCH && generateChartData() && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('victory.scoreProgression')}
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={generateChartData()!} options={chartOptions} />
            </Box>
          </CardContent>
        </Card>
      )}



      {/* ポケットしたボール詳細（セットマッチ・ボーラード以外） */}
      {game.type !== GameType.SET_MATCH && game.type !== GameType.BOWLARD && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ポケットしたボール
            </Typography>
            {game.players.map(player => (
              <Box key={player.id} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {player.name} ({player.ballsPocketed.length}個)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {player.ballsPocketed.length > 0 ? (
                    player.ballsPocketed.map(ball => (
                      <Chip
                        key={ball}
                        label={ball}
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          position: 'relative',
                          overflow: 'hidden',
                          border: 'none',
                          
                          // Base background for all balls
                          background: ball > 8 
                            ? `linear-gradient(to bottom, white 0%, white 20%, ${getBallColor(ball)} 20%, ${getBallColor(ball)} 80%, white 80%, white 100%)`
                            : `radial-gradient(circle at 30% 30%, ${getBallColor(ball)}dd, ${getBallColor(ball)} 70%)`,
                          
                          boxShadow: '0 3px 8px rgba(0,0,0,0.3), inset -1px -1px 2px rgba(0,0,0,0.1), inset 1px 1px 2px rgba(255,255,255,0.3)',
                          
                          // White circle background for number
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
                            zIndex: 1,
                          },
                          
                          '& .MuiChip-label': {
                            padding: 0,
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            position: 'relative',
                            zIndex: 2,
                            color: '#000',
                          },
                          
                          // Prevent hover color changes - keep original background
                          '&:hover': {
                            background: ball > 8 
                              ? `linear-gradient(to bottom, white 0%, white 20%, ${getBallColor(ball)} 20%, ${getBallColor(ball)} 80%, white 80%, white 100%) !important`
                              : `radial-gradient(circle at 30% 30%, ${getBallColor(ball)}dd, ${getBallColor(ball)} 70%) !important`,
                            '& .MuiChip-label': {
                              color: '#000 !important',
                            }
                          },
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      ポケットしたボールなし
                    </Typography>
                  )}
                </Box>
                {player !== game.players[game.players.length - 1] && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* アクションボタン */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Refresh />}
              onClick={onRematch}
            >
              再戦する
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              size="large"
              startIcon={<Home />}
              onClick={onBackToMenu}
            >
              メニューに戻る
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default VictoryScreen;
