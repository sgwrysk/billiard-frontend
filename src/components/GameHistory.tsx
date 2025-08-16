import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import { ArrowBack, EmojiEvents } from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import type { Game } from '../types/index';
import { GameType, GameStatus } from '../types/index';

interface GameHistoryProps {
  gameHistory: Game[];
  onBack: () => void;
}

const GameHistory: React.FC<GameHistoryProps> = ({ gameHistory, onBack }) => {
  const { t } = useLanguage();
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

  const formatDuration = (startTime: Date, endTime?: Date) => {
    if (!endTime) return '進行中';
    
    const duration = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    return `${minutes}分${seconds}秒`;
  };

  const getWinnerName = (game: Game) => {
    if (!game.winner) return '未決定';
    const winner = game.players.find(p => p.id === game.winner);
    return winner?.name || '不明';
  };

  const sortedHistory = [...gameHistory].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={onBack}
              variant="outlined"
            >
              {t('common.back')}
            </Button>
            <Typography variant="h5" sx={{ flex: 1 }}>
              {t('history.title')}
            </Typography>
          </Box>
          
          {sortedHistory.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                まだゲーム履歴がありません
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ゲームを開始してプレイしてみましょう！
              </Typography>
            </Box>
          ) : (
            <List>
              {sortedHistory.map((game, index) => (
                <React.Fragment key={game.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6">
                            {getGameTypeLabel(game.type)}
                          </Typography>
                          <Chip
                            size="small"
                            label={game.status === GameStatus.FINISHED ? '完了' : '進行中'}
                            color={game.status === GameStatus.FINISHED ? 'success' : 'warning'}
                          />
                          {game.winner && (
                            <Chip
                              size="small"
                              icon={<EmojiEvents />}
                              label={`勝者: ${getWinnerName(game)}`}
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            開始時刻: {new Date(game.startTime).toLocaleString('ja-JP')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            プレイ時間: {formatDuration(game.startTime, game.endTime)}
                          </Typography>
                          
                          {/* プレイヤー一覧 */}
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" gutterBottom>
                              プレイヤー:
                            </Typography>
                            {game.players.map(player => (
                              <Box 
                                key={player.id} 
                                sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  py: 0.5,
                                  px: 1,
                                  bgcolor: player.id === game.winner ? 'success.50' : 'grey.50',
                                  borderRadius: 1,
                                  mb: 0.5,
                                }}
                              >
                                <Typography variant="body2">
                                  {player.name}
                                  {player.id === game.winner && ' 🏆'}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                  <Typography variant="body2">
                                    {player.score}点
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {player.ballsPocketed.length}個
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < sortedHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default GameHistory;
