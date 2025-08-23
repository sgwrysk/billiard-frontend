import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
} from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import { ChessClockColors, AppColors, AppStyles } from '../constants/colors';
import type { ChessClockSettings, Player } from '../types/index';

interface ChessClockProps {
  chessClock: ChessClockSettings;
  players: Player[];
  currentPlayerIndex: number;
  onTimeUp?: (playerIndex: number) => void;
  onPlayerSelect?: (playerIndex: number) => void;
}

interface PlayerTimeState {
  remainingTime: number; // in seconds
  isWarning: boolean;
  isTimeUp: boolean;
}

const ChessClock: React.FC<ChessClockProps> = ({
  chessClock,
  players,
  currentPlayerIndex,
  onTimeUp,
  onPlayerSelect,
}) => {
  const { t } = useLanguage();
  const [isRunning, setIsRunning] = useState(false);
  const [playerTimes, setPlayerTimes] = useState<PlayerTimeState[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  // Initialize player times only once when component mounts or chess clock is enabled
  useEffect(() => {
    if (chessClock.enabled && playerTimes.length === 0) {
      const initialTimes: PlayerTimeState[] = players.map((_, index) => {
        let timeLimit: number;
        if (chessClock.individualTime) {
          timeLimit = chessClock[`player${index + 1}TimeLimit` as keyof ChessClockSettings] as number || chessClock.timeLimit;
        } else {
          timeLimit = chessClock.timeLimit;
        }
        return {
          remainingTime: timeLimit * 60, // Convert minutes to seconds
          isWarning: false,
          isTimeUp: false,
        };
      });
      setPlayerTimes(initialTimes);
    }
  }, [chessClock.enabled]); // Only depend on chessClock.enabled

  // Don't reset timer when current player changes - let it continue naturally
  useEffect(() => {
    // Note: We don't reset lastUpdateTime here to preserve the continuous timer
  }, [currentPlayerIndex]);

  // Timer logic
  useEffect(() => {
    if (!isRunning || !chessClock.enabled) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateTime) / 1000; // Convert to seconds
      setLastUpdateTime(now);

      setPlayerTimes(prevTimes => {
        return prevTimes.map((playerTime, index) => {
          if (index === currentPlayerIndex && !playerTime.isTimeUp) {
            const newRemainingTime = Math.max(0, playerTime.remainingTime - deltaTime);
            // Always show warning when time is below warning threshold, regardless of warningEnabled setting
            const isWarning = newRemainingTime <= chessClock.warningTime * 60;
            const isTimeUp = newRemainingTime <= 0;

            // Call onTimeUp when time runs out
            if (isTimeUp && !playerTime.isTimeUp && onTimeUp) {
              onTimeUp(index);
            }

            return {
              remainingTime: newRemainingTime,
              isWarning,
              isTimeUp,
            };
          }
          return playerTime;
        });
      });
    }, 100); // Update every 100ms for smooth countdown

    return () => clearInterval(interval);
  }, [isRunning, currentPlayerIndex, lastUpdateTime, chessClock, onTimeUp]);

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      setLastUpdateTime(Date.now());
      setIsRunning(true);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPlayerButtonStyle = (playerIndex: number) => {
    const playerTime = playerTimes[playerIndex];
    if (!playerTime) return {};

    if (playerTime.isTimeUp) {
      return {
        backgroundColor: ChessClockColors.player.timeUp.background,
        color: ChessClockColors.player.timeUp.text,
        border: ChessClockColors.player.timeUp.border,
        cursor: 'pointer', // 時間切れでも選択可能であることを示す
        '&:hover': {
          backgroundColor: '#b71c1c', // より濃い赤色
        },
      };
    } else if (playerTime.isWarning) {
      return {
        backgroundColor: ChessClockColors.player.warning.background,
        color: ChessClockColors.player.warning.text,
        border: ChessClockColors.player.warning.border,
        '&:hover': {
          backgroundColor: '#f57c00', // より濃いオレンジ色
        },
      };
    } else if (playerIndex === currentPlayerIndex) {
      return {
        backgroundColor: ChessClockColors.player.active.background,
        color: ChessClockColors.player.active.text,
        border: ChessClockColors.player.active.border,
        '&:hover': {
          backgroundColor: AppColors.chessClock.activePlayerHover, // ボーラードのストライク色
        },
      };
    }

    return {
      backgroundColor: ChessClockColors.player.default.background,
      color: ChessClockColors.player.default.text,
      border: ChessClockColors.player.default.border,
      '&:hover': {
        backgroundColor: '#e0e0e0', // より濃いグレー
      },
    };
  };

  const handlePlayerSelect = (playerIndex: number) => {
    if (onPlayerSelect) {
      // If the selected player has no time left, stop the timer
      if (playerTimes[playerIndex]?.isTimeUp) {
        setIsRunning(false);
      }
      // Don't reset lastUpdateTime here - let the timer continue naturally
      onPlayerSelect(playerIndex);
    }
  };

  if (!chessClock.enabled) return null;

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: { xs: 1.5, sm: 2 }, // 小画面ではパディングを少し小さく
        mb: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: { xs: 1, sm: 2 }, // 小画面ではギャップを小さく
        minHeight: { xs: 70, sm: 80 }, // 小画面では高さを少し小さく
        backgroundColor: ChessClockColors.background,
      }}
    >
      {/* Player 1 Button */}
      <Button
        variant="outlined"
        size="large"
        onClick={() => handlePlayerSelect(0)}
        sx={{
          flex: 1,
          minHeight: { xs: 50, sm: 60 }, // 小画面では高さを少し小さく
          fontSize: '1rem',
          fontWeight: 'bold',
          ...getPlayerButtonStyle(0),
        }}

      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            {players[0]?.name || t('setup.playerName') + ' 1'}
          </Typography>
          <Typography variant="h5" sx={{ 
            fontWeight: 'bold', 
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            ...AppStyles.monoFont
          }}>
            {formatTime(playerTimes[0]?.remainingTime || 0)}
          </Typography>
        </Box>
      </Button>

      {/* Start/Stop Button */}
      <Button
        variant="contained"
        size="large"
        onClick={handleStartStop}
        sx={{
          minWidth: { xs: 60, sm: 80 }, // 小画面では60px、通常では80px
          minHeight: { xs: 50, sm: 60 }, // 小画面では50px、通常では60px
          backgroundColor: isRunning ? ChessClockColors.control.stop.background : ChessClockColors.control.start.background,
          color: 'white',
          '&:hover': {
            backgroundColor: isRunning ? ChessClockColors.control.stop.hover : ChessClockColors.control.start.hover,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isRunning ? (
            <Pause sx={{ fontSize: { xs: 24, sm: 32 } }} /> // 小画面では24px、通常では32px
          ) : (
            <PlayArrow sx={{ fontSize: { xs: 24, sm: 32 } }} /> // 小画面では24px、通常では32px
          )}
        </Box>
      </Button>

      {/* Player 2 Button */}
      <Button
        variant="outlined"
        size="large"
        onClick={() => handlePlayerSelect(1)}
        sx={{
          flex: 1,
          minHeight: { xs: 50, sm: 60 }, // 小画面では高さを少し小さく
          fontSize: '1rem',
          fontWeight: 'bold',
          ...getPlayerButtonStyle(1),
        }}

      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            {players[1]?.name || t('setup.playerName') + ' 2'}
          </Typography>
          <Typography variant="h5" sx={{ 
            fontWeight: 'bold', 
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            ...AppStyles.monoFont
          }}>
            {formatTime(playerTimes[1]?.remainingTime || 0)}
          </Typography>
        </Box>
      </Button>
    </Paper>
  );
};

export default ChessClock;
