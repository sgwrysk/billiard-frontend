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
      1: '#FFFF00', // Yellow (solid)
      2: '#0000FF', // Blue (solid)
      3: '#FF0000', // Red (solid)
      4: '#800080', // Purple (solid)
      5: '#FFA500', // Orange (solid)
      6: '#008000', // Green (solid)
      7: '#8B0000', // Maroon (solid)
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

  const generateChartData = () => {
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
          text: 'ショット数',
        },
      },
    },
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* 勝利アナウンス */}
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

      {/* ゲーム詳細情報 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            ゲーム詳細
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
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

      {/* ポケットしたボール詳細（セットマッチ以外） */}
      {game.type !== GameType.SET_MATCH && (
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
                          bgcolor: getBallColor(ball),
                          background: `linear-gradient(145deg, ${getBallColor(ball)}, ${getBallColor(ball)}dd)`,
                          color: getBallTextColor(ball),
                          fontWeight: 'bold',
                          border: ball > 8 ? '2px dashed white' : 'none',
                          borderRadius: '50%',
                          width: 32,
                          height: 32,
                          boxShadow: '2px 2px 6px rgba(0,0,0,0.2)',
                          '& .MuiChip-label': {
                            padding: 0,
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
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
