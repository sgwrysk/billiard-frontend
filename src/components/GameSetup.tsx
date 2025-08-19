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
  IconButton,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import { GameType } from '../types/index';
import type { ChessClockSettings } from '../types/index';
import { ToggleSwitch } from './common';
import ChessClockSetup from './ChessClockSetup';

interface PlayerSetup {
  name: string;
  targetScore?: number;
  targetSets?: number;
}

interface GameSetupProps {
  onStartGame: (players: PlayerSetup[], gameType: GameType, alternatingBreak?: boolean, chessClock?: ChessClockSettings) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
  const { t, language } = useLanguage();
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { name: '', targetScore: 120, targetSets: 5 },
    { name: '', targetScore: 120, targetSets: 5 }
  ]);
  const [gameType, setGameType] = useState<GameType>(GameType.SET_MATCH);
  const [editingTargetSets, setEditingTargetSets] = useState<{ [key: number]: boolean }>({});
  const [editingTargetScore, setEditingTargetScore] = useState<{ [key: number]: boolean }>({});
  const [alternatingBreak, setAlternatingBreak] = useState<boolean>(false);
  
  // Chess clock settings
  const [chessClock, setChessClock] = useState<ChessClockSettings>({
    enabled: false,
    individualTime: false,
    timeLimit: 30,
    warningEnabled: false,
    warningTime: 3,
    player1TimeLimit: 30,
    player2TimeLimit: 30,
  });
  
  // Preset target scores for Rotation game
  const presetScores = [120, 180, 240];
  


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
      onStartGame(validPlayers, gameType, gameType === GameType.SET_MATCH ? alternatingBreak : undefined, chessClock.enabled ? chessClock : undefined);
    }
  };

  const handleGameTypeChange = (newGameType: GameType) => {
    setGameType(newGameType);
    // Clear editing states when changing game type
    setEditingTargetSets({});
    setEditingTargetScore({});
    // Clear target score for non-Rotation games and set default targetSets for Set Match
    if (newGameType === GameType.SET_MATCH) {
      setPlayers(players.map(player => ({ ...player, targetScore: undefined, targetSets: 5 })));
    } else if (newGameType !== GameType.ROTATION) {
      setPlayers(players.map(player => ({ ...player, targetScore: undefined })));
    }
    // Reset alternating break setting when changing game type (only SET_MATCH supports it)
    if (newGameType !== GameType.SET_MATCH) {
      setAlternatingBreak(false);
    }
    // Reset chess clock settings when changing to Bowlard (not supported)
    if (newGameType === GameType.BOWLARD) {
      setChessClock(prev => ({ ...prev, enabled: false }));
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
              <MenuItem value={GameType.BOWLARD}>{t('setup.gameType.bowlard')}</MenuItem>
            </Select>
          </FormControl>



          {/* プレイヤー設定 */}
          <Grid container spacing={2}>
            {(gameType === GameType.BOWLARD ? players.slice(0, 1) : players).map((player, index) => (
              <Grid item xs={12} md={gameType === GameType.BOWLARD ? 12 : 6} key={index}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  
                  <TextField
                    fullWidth
                    label={t('setup.playerName')}
                    value={player.name}
                    onChange={(e) => handleUpdatePlayerName(index, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    variant="outlined"
                    size="small"
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        minHeight: 44
                      }
                    }}
                    inputProps={{
                      autoComplete: 'off',
                      autoCapitalize: 'words'
                    }}
                  />
                
                {/* ローテーション用の目標得点設定 */}
                {gameType === GameType.ROTATION && (
                  <Box sx={{ mt: 1 }}>
                    <Grid container spacing={1.5} alignItems="center">
                      {presetScores.map(score => (
                        <Grid item key={score}>
                          <Chip
                            label={score}
                            onClick={() => handleUpdatePlayerTargetScore(index, score)}
                            color={player.targetScore === score ? 'primary' : 'default'}
                            variant={player.targetScore === score ? 'filled' : 'outlined'}
                            size="medium"
                            sx={{ 
                              minHeight: 36, 
                              fontSize: '0.875rem',
                              '& .MuiChip-label': { 
                                padding: '0 12px' 
                              }
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          minHeight: 40,
                          overflow: 'hidden'
                        }}
                      >
                        <IconButton 
                          onClick={() => handleUpdatePlayerTargetScore(index, Math.max(1, (player.targetScore || presetScores[0]) - 10))}
                          disabled={(player.targetScore || presetScores[0]) <= 1}
                          size="small"
                          sx={{ 
                            borderRadius: 0,
                            px: 1.5,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        {editingTargetScore[index] ? (
                          <TextField
                            type="number"
                            value={player.targetScore || presetScores[0]}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (!isNaN(value) && value >= 1 && value <= 999) {
                                handleUpdatePlayerTargetScore(index, value);
                              }
                            }}
                            onBlur={() => setEditingTargetScore(prev => ({ ...prev, [index]: false }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setEditingTargetScore(prev => ({ ...prev, [index]: false }));
                              }
                            }}
                            autoFocus
                            size="small"
                            inputProps={{ 
                              min: 1, 
                              max: 999,
                              inputMode: 'numeric',
                              pattern: '[0-9]*',
                              style: { 
                                textAlign: 'center',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                padding: '4px 8px'
                              }
                            }}
                            sx={{ 
                              width: 80,
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'background.default',
                                '& fieldset': { border: 'none' }
                              }
                            }}
                          />
                        ) : (
                          <Typography 
                            onClick={() => setEditingTargetScore(prev => ({ ...prev, [index]: true }))}
                            sx={{ 
                              px: 2, 
                              py: 1, 
                              fontSize: '0.875rem', 
                              fontWeight: 500,
                              minWidth: 48,
                              textAlign: 'center',
                              backgroundColor: 'background.default',
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                          >
                            {player.targetScore || presetScores[0]}
                          </Typography>
                        )}
                        <IconButton 
                          onClick={() => handleUpdatePlayerTargetScore(index, Math.min(999, (player.targetScore || presetScores[0]) + 10))}
                          disabled={(player.targetScore || presetScores[0]) >= 999}
                          size="small"
                          sx={{ 
                            borderRadius: 0,
                            px: 1.5,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* セットマッチ用の目標セット数設定 */}
                {gameType === GameType.SET_MATCH && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          minHeight: 40,
                          overflow: 'hidden'
                        }}
                      >
                        <IconButton 
                          onClick={() => handleUpdatePlayerTargetSets(index, Math.max(1, (player.targetSets || 5) - 1))}
                          disabled={(player.targetSets || 5) <= 1}
                          size="small"
                          sx={{ 
                            borderRadius: 0,
                            px: 1.5,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        {editingTargetSets[index] ? (
                          <TextField
                            type="number"
                            value={player.targetSets || 5}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (!isNaN(value) && value >= 1 && value <= 21) {
                                handleUpdatePlayerTargetSets(index, value);
                              }
                            }}
                            onBlur={() => setEditingTargetSets(prev => ({ ...prev, [index]: false }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setEditingTargetSets(prev => ({ ...prev, [index]: false }));
                              }
                            }}
                            autoFocus
                            size="small"
                            inputProps={{ 
                              min: 1, 
                              max: 21,
                              inputMode: 'numeric',
                              pattern: '[0-9]*',
                              style: { 
                                textAlign: 'center',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                padding: '4px 8px'
                              }
                            }}
                            sx={{ 
                              width: 60,
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'background.default',
                                '& fieldset': { border: 'none' }
                              }
                            }}
                          />
                        ) : (
                          <Typography 
                            onClick={() => setEditingTargetSets(prev => ({ ...prev, [index]: true }))}
                            sx={{ 
                              px: 2, 
                              py: 1, 
                              fontSize: '0.875rem', 
                              fontWeight: 500,
                              minWidth: 32,
                              textAlign: 'center',
                              backgroundColor: 'background.default',
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                          >
                            {player.targetSets || 5}
                          </Typography>
                        )}
                        <IconButton 
                          onClick={() => handleUpdatePlayerTargetSets(index, Math.min(21, (player.targetSets || 5) + 1))}
                          disabled={(player.targetSets || 5) >= 21}
                          size="small"
                          sx={{ 
                            borderRadius: 0,
                            px: 1.5,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                )}
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* 交互ブレイク設定 */}
          {gameType === GameType.SET_MATCH && (
            <Box sx={{ mt: 3 }}>
              <ToggleSwitch
                checked={alternatingBreak}
                onChange={setAlternatingBreak}
                label={t('setup.alternatingBreak')}
              />
            </Box>
          )}

          {/* チェスクロック設定 - セットマッチとローテーションでのみ表示 */}
          {(gameType === GameType.SET_MATCH || gameType === GameType.ROTATION) && (
            <Box sx={{ mt: 3 }}>
              <ToggleSwitch
                checked={chessClock.enabled}
                onChange={(enabled) => setChessClock(prev => ({
                  ...prev,
                  enabled,
                  // Reset to default values when enabling
                  ...(enabled && {
                    timeLimit: 30,
                    warningEnabled: false,
                    warningTime: 3,
                    player1TimeLimit: 30,
                    player2TimeLimit: 30,
                  })
                }))}
                label={t('setup.chessClock.enabled')}
              />
              <ChessClockSetup
                chessClock={chessClock}
                onChessClockChange={(settings) => setChessClock(settings)}
                players={players}
              />
            </Box>
          )}

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
