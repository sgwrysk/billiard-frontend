import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
} from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';
import { GameType } from '../types/index';

interface PlayerSetup {
  name: string;
  targetScore?: number;
  targetSets?: number;
}

interface GameSetupProps {
  onStartGame: (players: PlayerSetup[], gameType: GameType) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
  const { t, language } = useLanguage();
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { name: '', targetScore: 120, targetSets: 5 },
    { name: '', targetScore: 120, targetSets: 5 }
  ]);
  const [gameType, setGameType] = useState<GameType>(GameType.SET_MATCH);
  
  // Preset target scores for Rotation game
  const presetScores = [120, 180, 240];
  
  // Preset target sets for Set Match game
  const presetSets = [3, 5, 7, 9];

  // Update player names when language changes
  useEffect(() => {
    setPlayers(prevPlayers => 
      prevPlayers.map((player, index) => ({
        ...player,
        name: player.name === '' || player.name.includes('Player') || player.name.includes('プレイヤー') 
          ? `${t('setup.playerName')} ${index + 1}`
          : player.name
      }))
    );
  }, [language, t]);



  const handleUpdatePlayerName = (index: number, name: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].name = name;
    setPlayers(updatedPlayers);
  };

  const handleUpdatePlayerTargetScore = (index: number, targetScore: number) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].targetScore = targetScore;
    setPlayers(updatedPlayers);
  };

  const handleUpdatePlayerTargetSets = (index: number, targetSets: number) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].targetSets = targetSets;
    setPlayers(updatedPlayers);
  };

  const handleStartGame = () => {
    const validPlayers = players.filter(player => player.name.trim());
    if (validPlayers.length >= 2) {
      onStartGame(validPlayers, gameType);
    }
  };

  const handleGameTypeChange = (newGameType: GameType) => {
    setGameType(newGameType);
    // Clear target score for non-Rotation games
    if (newGameType !== GameType.ROTATION) {
      setPlayers(players.map(player => ({ ...player, targetScore: undefined })));
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Card>
        <CardContent>
          {/* ゲームタイプ選択 */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>{t('setup.gameType')}</InputLabel>
            <Select
              value={gameType}
              label={t('setup.gameType')}
              onChange={(e) => handleGameTypeChange(e.target.value as GameType)}
            >
              <MenuItem value={GameType.SET_MATCH}>{t('setup.gameType.setmatch')}</MenuItem>
              <MenuItem value={GameType.ROTATION}>{t('setup.gameType.rotation')}</MenuItem>
            </Select>
          </FormControl>



          {/* 2名固定のプレイヤー設定 */}
          <Grid container spacing={2}>
            {players.map((player, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  
                  <TextField
                    fullWidth
                    label={t('setup.playerName')}
                    value={player.name}
                    onChange={(e) => handleUpdatePlayerName(index, e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                
                {/* ローテーション用の目標得点設定 */}
                {gameType === GameType.ROTATION && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" gutterBottom>
                      {t('setup.targetScore')}:
                    </Typography>
                    <Grid container spacing={1} alignItems="center">
                      {presetScores.map(score => (
                        <Grid item key={score}>
                          <Chip
                            label={`${score}${t('victory.points')}`}
                            onClick={() => handleUpdatePlayerTargetScore(index, score)}
                            color={player.targetScore === score ? 'primary' : 'default'}
                            variant={player.targetScore === score ? 'filled' : 'outlined'}
                            size="small"
                          />
                        </Grid>
                      ))}
                      <Grid item>
                        <TextField
                          type="number"
                          value={player.targetScore || presetScores[0]}
                          onChange={(e) => handleUpdatePlayerTargetScore(index, Number(e.target.value))}
                          size="small"
                          sx={{ width: 80 }}
                          inputProps={{ min: 1, max: 999 }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* セットマッチ用の目標セット数設定 */}
                {gameType === GameType.SET_MATCH && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" gutterBottom>
                      {t('setup.sets')}:
                    </Typography>
                    <Grid container spacing={1} alignItems="center">
                      {presetSets.map(sets => (
                        <Grid item key={sets}>
                          <Chip
                            label={sets}
                            onClick={() => handleUpdatePlayerTargetSets(index, sets)}
                            color={player.targetSets === sets ? 'primary' : 'default'}
                            variant={player.targetSets === sets ? 'filled' : 'outlined'}
                            size="small"
                          />
                        </Grid>
                      ))}
                      <Grid item>
                        <TextField
                          type="number"
                          value={player.targetSets || presetSets[1]}
                          onChange={(e) => handleUpdatePlayerTargetSets(index, Number(e.target.value))}
                          size="small"
                          sx={{ width: 80 }}
                          inputProps={{ min: 1, max: 21 }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* ゲーム開始ボタン */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleStartGame}
            disabled={players.filter(player => player.name.trim()).length < 2}
            sx={{ mt: 3 }}
          >
            {t('setup.startGame')}
          </Button>


        </CardContent>
      </Card>
    </Box>
  );
};

export default GameSetup;
