import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Button,
  Grid,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import type { ChessClockSettings } from '../types/index';
import { ToggleSwitch } from './common';
import { AppStyles } from '../constants/colors';

interface ChessClockSetupProps {
  chessClock: ChessClockSettings;
  onChessClockChange: (settings: ChessClockSettings) => void;
  players: { name: string }[];
}

const ChessClockSetup: React.FC<ChessClockSetupProps> = ({
  chessClock,
  onChessClockChange,
  players,
}) => {
  const { t } = useLanguage();
  
  // Preset time limits for chess clock
  const presetTimeLimits = [25, 30, 35, 40, 45];



  const handleIndividualTimeToggle = (individualTime: boolean) => {
    onChessClockChange({
      ...chessClock,
      individualTime,
      // Set individual time limits when enabling
      ...(individualTime && {
        player1TimeLimit: chessClock.timeLimit,
        player2TimeLimit: chessClock.timeLimit,
      })
    });
  };

  const handleTimeLimitChange = (timeLimit: number) => {
    onChessClockChange({
      ...chessClock,
      timeLimit,
      // Update individual time limits if they're not set individually
      ...(!chessClock.individualTime && {
        player1TimeLimit: timeLimit,
        player2TimeLimit: timeLimit,
      })
    });
  };

  const handlePresetTimeLimitChange = (timeLimit: number) => {
    onChessClockChange({
      ...chessClock,
      timeLimit,
      // Always update individual time limits when using preset
      player1TimeLimit: timeLimit,
      player2TimeLimit: timeLimit,
    });
  };

  const handleWarningTimeToggle = (enabled: boolean) => {
    onChessClockChange({
      ...chessClock,
      warningEnabled: enabled,
      // Reset to default warning time when enabling
      ...(enabled && {
        warningTime: 3,
      })
    });
  };

  const handleWarningTimeChange = (warningTime: number) => {
    onChessClockChange({
      ...chessClock,
      warningTime: Math.max(1, Math.min(warningTime, chessClock.timeLimit - 1))
    });
  };

  const handlePlayerTimeLimitChange = (playerIndex: number, timeLimit: number) => {
    onChessClockChange({
      ...chessClock,
      [`player${playerIndex + 1}TimeLimit`]: timeLimit
    });
  };

  if (!chessClock.enabled) return null;

  return (
    <Card sx={{ mb: 2, border: '1px solid', borderColor: 'primary.main' }}>
      <CardContent>
        {/* Time limit setting */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {t('setup.chessClock.timeLimit')}（{t('setup.chessClock.minutes')}）
          </Typography>
          
          {/* Preset time limits */}
          <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {presetTimeLimits.map((time) => (
              <Button
                key={time}
                size="small"
                variant={chessClock.timeLimit === time ? 'contained' : 'outlined'}
                color={chessClock.timeLimit === time ? 'primary' : 'inherit'}
                onClick={() => handlePresetTimeLimitChange(time)}
                sx={{
                  minWidth: '48px',
                  height: '32px',
                  ...AppStyles.monoFont,
                  fontSize: '0.875rem'
                }}
              >
                {time}
              </Button>
            ))}
          </Box>
          
          {chessClock.individualTime ? (
            // Individual time limits
            <Grid container spacing={2}>
              {players.map((player, index) => (
                <Grid item xs={6} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 60 }}>
                      {player.name || `${t('setup.playerName')} ${index + 1}`}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handlePlayerTimeLimitChange(index, Math.max(1, (chessClock[`player${index + 1}TimeLimit` as keyof ChessClockSettings] as number) - 1))}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <TextField
                        size="small"
                        value={chessClock[`player${index + 1}TimeLimit` as keyof ChessClockSettings]}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          handlePlayerTimeLimitChange(index, value);
                        }}
                        sx={{ width: 60 }}
                        inputProps={{ min: 1, style: { ...AppStyles.monoFont, textAlign: 'center' } }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handlePlayerTimeLimitChange(index, (chessClock[`player${index + 1}TimeLimit` as keyof ChessClockSettings] as number) + 1)}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            // Common time limit
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => handleTimeLimitChange(Math.max(1, chessClock.timeLimit - 1))}
                >
                  <Remove fontSize="small" />
                </IconButton>
                <TextField
                  size="small"
                  value={chessClock.timeLimit}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    handleTimeLimitChange(value);
                  }}
                  sx={{ width: 60 }}
                  inputProps={{ min: 1, style: { ...AppStyles.monoFont, textAlign: 'center' } }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleTimeLimitChange(chessClock.timeLimit + 1)}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>

        {/* Individual time setting */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mb: 1 }}>
            <ToggleSwitch
              checked={chessClock.individualTime}
              onChange={handleIndividualTimeToggle}
              label={t('setup.chessClock.individualTime')}
            />
          </Box>
        </Box>

        {/* Warning time toggle */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mb: 1 }}>
            <ToggleSwitch
              checked={chessClock.warningEnabled}
              onChange={handleWarningTimeToggle}
              label={t('setup.chessClock.warningEnabled')}
            />
          </Box>
        </Box>

        {/* Warning time setting */}
        {chessClock.warningEnabled && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => handleWarningTimeChange(Math.max(1, chessClock.warningTime - 1))}
              >
                <Remove fontSize="small" />
              </IconButton>
              <TextField
                size="small"
                value={chessClock.warningTime}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  handleWarningTimeChange(value);
                }}
                sx={{ width: 60 }}
                inputProps={{ min: 1, max: chessClock.timeLimit - 1, style: { ...AppStyles.monoFont, textAlign: 'center' } }}
              />
              <IconButton
                size="small"
                onClick={() => handleWarningTimeChange(Math.min(chessClock.warningTime + 1, chessClock.timeLimit - 1))}
              >
                <Add fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ChessClockSetup;
