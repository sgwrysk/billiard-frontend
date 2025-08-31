import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
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
import type { ChessClockSettings } from '../types/index';
import { ToggleSwitch, NumberInputStepper, PlayerInputField, useErrorNotification, ErrorNotification } from './common';
import ChessClockSetup from './ChessClockSetup';
import { autoSavePlayer } from '../utils/playerStorage';
import JapanGameSettingsComponent from './games/japan/JapanGameSettings';
import type { JapanGameSettings } from '../types/japan';

interface PlayerSetup {
  name: string;
  targetScore?: number;
  targetSets?: number;
}

interface GameSetupProps {
  onStartGame: (players: PlayerSetup[], gameType: GameType, alternatingBreak?: boolean, chessClock?: ChessClockSettings, japanSettings?: JapanGameSettings) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
  const { t, language } = useLanguage();
  const { notification, showError, hideNotification } = useErrorNotification();
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { name: '', targetScore: 120, targetSets: 5 },
    { name: '', targetScore: 120, targetSets: 5 }
  ]);
  const [gameType, setGameType] = useState<GameType>(GameType.SET_MATCH);
  const [alternatingBreak, setAlternatingBreak] = useState<boolean>(false);
  
  // Japan game settings
  const [japanSettings, setJapanSettings] = useState<JapanGameSettings>({
    handicapBalls: [5, 9],
    multipliers: [{ label: 'x2', value: 2 }],
    deductionEnabled: false,
    deductions: [],
    orderChangeInterval: 10,
    orderChangeEnabled: false,
    multipliersEnabled: false
  });
  const [japanSettingsValid, setJapanSettingsValid] = useState(true);
  
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

  const handleAddPlayer = () => {
    const maxPlayers = gameType === GameType.JAPAN ? 10 : (gameType === GameType.BOWLARD ? 1 : 4);
    if (players.length < maxPlayers) {
      setPlayers([...players, { name: '', targetScore: 120, targetSets: 5 }]);
    }
  };

  const handleRemovePlayer = (index: number) => {
    const minPlayers = gameType === GameType.BOWLARD ? 1 : 2;
    if (players.length > minPlayers) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const handleStartGame = () => {
    const validPlayers = players.filter(player => player.name.trim());
    if (validPlayers.length >= 2) {
      // Auto-save players when starting game
      try {
        validPlayers.forEach(player => {
          autoSavePlayer(player.name);
        });
        
        // Pass Japan settings if it's Japan game
        if (gameType === GameType.JAPAN) {
          if (!japanSettingsValid) {
            showError('Japan設定に問題があります。設定を確認してください。');
            return;
          }
          console.log('Japan settings:', japanSettings);
          // TODO: Pass Japan settings to the game engine
        }
        
        onStartGame(
          validPlayers, 
          gameType, 
          gameType === GameType.SET_MATCH ? alternatingBreak : undefined, 
          chessClock.enabled ? chessClock : undefined,
          gameType === GameType.JAPAN ? japanSettings : undefined
        );
      } catch (error) {
        showError(error instanceof Error ? error.message : 'Failed to save player data');
      }
    }
  };

  const handleGameTypeChange = (newGameType: GameType) => {
    setGameType(newGameType);
    // Reset scroll position when game type changes
    window.scrollTo(0, 0);
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
    // Reset chess clock settings when changing to Bowlard or Japan (not supported)
    if (newGameType === GameType.BOWLARD || newGameType === GameType.JAPAN) {
      setChessClock(prev => ({ ...prev, enabled: false }));
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Card>
        <CardContent>
          {/* Game type selection */}
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
              <MenuItem value={GameType.JAPAN}>{t('setup.gameType.japan')}</MenuItem>
            </Select>
          </FormControl>



          {/* プレイヤー設定 */}
          <Grid container spacing={2}>
            {(gameType === GameType.BOWLARD ? players.slice(0, 1) : players).map((player, index) => (
              <Grid item xs={12} md={gameType === GameType.BOWLARD ? 12 : (gameType === GameType.JAPAN ? 12 : 6)} key={index}>
                <Card variant="outlined" sx={{ p: 2, position: 'relative' }}>
                  
                  {/* プレイヤー削除ボタン - Japanルールかつ最小人数を上回る場合のみ表示 */}
                  {gameType === GameType.JAPAN && players.length > 2 && (
                    <Button
                      onClick={() => handleRemovePlayer(index)}
                      sx={{ position: 'absolute', top: 8, right: 8, minWidth: 'auto', p: 0.5 }}
                      size="small"
                      color="error"
                      variant="text"
                    >
                      ×
                    </Button>
                  )}
                  
                  <PlayerInputField
                    label={t('setup.playerName')}
                    value={player.name}
                    onChange={(name) => handleUpdatePlayerName(index, name)}
                    onFocus={(e) => e.target.select()}
                    playerPosition={(index + 1) as 1 | 2}
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mb: 2 }}
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
                      <NumberInputStepper
                        value={player.targetScore || presetScores[0]}
                        onChange={(value) => handleUpdatePlayerTargetScore(index, value)}
                        min={1}
                        max={999}
                        step={10}
                      />
                    </Box>
                  </Box>
                )}

                {/* セットマッチ用の目標セット数設定 */}
                {gameType === GameType.SET_MATCH && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <NumberInputStepper
                        value={player.targetSets || 5}
                        onChange={(value) => handleUpdatePlayerTargetSets(index, value)}
                        min={1}
                        max={100}
                        step={1}
                      />
                    </Box>
                  </Box>
                )}
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* プレイヤー追加ボタン - Japanルールのみ */}
          {gameType === GameType.JAPAN && players.length < 10 && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                onClick={handleAddPlayer}
                variant="outlined"
                startIcon={<span>+</span>}
                size="medium"
              >
                {t('setup.addPlayer')}
              </Button>
            </Box>
          )}

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

          {/* ジャパンルール設定 */}
          {gameType === GameType.JAPAN && (
            <JapanGameSettingsComponent
              settings={japanSettings}
              onSettingsChange={setJapanSettings}
              onValidationChange={setJapanSettingsValid}
            />
          )}

          {/* Game start button */}
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
      
      {/* Error Notification */}
      <ErrorNotification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={hideNotification}
      />
    </Box>
  );
};

export default GameSetup;
