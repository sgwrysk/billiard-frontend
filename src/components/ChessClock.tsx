import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
} from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import { ChessClockColors, AppColors, AppStyles, UIColors } from '../constants/colors';
import type { ChessClockSettings, Player, ChessClockState } from '../types/index';

interface ChessClockProps {
  chessClock: ChessClockSettings;
  players: Player[];
  currentPlayerIndex: number;
  onTimeUp?: (playerIndex: number) => void;
  onPlayerSelect?: (playerIndex: number) => void;
  savedState?: ChessClockState; // Saved chess clock state for restoration
  onStateChange?: (state: ChessClockState) => void; // Callback to save chess clock state
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
  savedState,
  onStateChange,
}) => {
  const { t } = useLanguage();
  const [isRunning, setIsRunning] = useState(false);
  const [playerTimes, setPlayerTimes] = useState<PlayerTimeState[]>([]);
  const lastUpdateTimeRef = useRef<number>(Date.now());

  // Initialize player times from saved state or default values
  useEffect(() => {
    if (chessClock.enabled && playerTimes.length === 0) {
      if (savedState && savedState.playerTimes.length > 0) {
        // Restore from saved state
        setPlayerTimes(savedState.playerTimes);
        setIsRunning(savedState.isRunning);
        lastUpdateTimeRef.current = savedState.lastUpdateTime;
      } else {
        // Initialize with default values
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
        setIsRunning(false);
        lastUpdateTimeRef.current = Date.now();
      }
    }
  }, [chessClock.enabled, chessClock, savedState, players, playerTimes.length]); // Depend on saved state and players

  // Don't reset timer when current player changes - let it continue naturally
  useEffect(() => {
    // Note: We don't reset lastUpdateTime here to preserve the continuous timer
  }, [currentPlayerIndex]);

  // No scroll monitoring needed for fixed header

  // Timer logic
  useEffect(() => {
    if (!isRunning || !chessClock.enabled) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateTimeRef.current) / 1000; // Convert to seconds
      lastUpdateTimeRef.current = now;

      setPlayerTimes(prevTimes => {
        const newTimes = prevTimes.map((playerTime, index) => {
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
        
        return newTimes;
      });
    }, 100); // Update every 100ms for smooth countdown

    return () => clearInterval(interval);
  }, [isRunning, currentPlayerIndex, chessClock, onTimeUp]);

  // Save chess clock state when it changes
  useEffect(() => {
    if (onStateChange && playerTimes.length > 0) {
      const currentState: ChessClockState = {
        playerTimes: playerTimes,
        isRunning: isRunning,
        lastUpdateTime: lastUpdateTimeRef.current,
      };
      onStateChange(currentState);
    }
  }, [playerTimes, isRunning, onStateChange]);

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      lastUpdateTimeRef.current = Date.now();
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
        cursor: 'pointer', // Indicate selectable even when time is up
        '&:hover': {
          backgroundColor: ChessClockColors.player.timeUp.hover,
        },
      };
    } else if (playerTime.isWarning) {
      return {
        backgroundColor: ChessClockColors.player.warning.background,
        color: ChessClockColors.player.warning.text,
        border: ChessClockColors.player.warning.border,
        '&:hover': {
          backgroundColor: ChessClockColors.player.warning.hover,
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
        backgroundColor: ChessClockColors.player.default.hover,
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
      
      // Correct chess clock behavior: pressing your button makes opponent active
      const nextPlayerIndex = playerIndex === 0 ? 1 : 0;
      onPlayerSelect(nextPlayerIndex);
    }
  };

  if (!chessClock.enabled) return null;

  const renderChessClockContent = () => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      gap: { xs: 1, sm: 2 }, // Smaller gap on small screens
      minHeight: { xs: 60, sm: 65 }, // Adjust to smaller height
      width: '100%',
    }}>
      {/* Player 1 Button */}
      <Button
        variant="outlined"
        size="large"
        onClick={() => handlePlayerSelect(0)}
        sx={{
          flex: 1,
          minHeight: { xs: 40, sm: 45 }, // Adjust to smaller size
          fontSize: '1rem',
          fontWeight: 'bold',
          ml: { xs: 4.5, sm: 6 }, // Increase left margin further
          ...getPlayerButtonStyle(0),
          // Disable focus/selection effects
          '&:focus': { outline: 'none', boxShadow: 'none' },
          '&:active': { outline: 'none', boxShadow: 'none' },
        }}

      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ 
            fontWeight: 'bold', 
            mb: 0.5, 
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            display: { xs: 'block', sm: 'none' }  // Show only on mobile
          }}>
            {players[0]?.name || t('setup.playerName') + ' 1'}
          </Typography>
          <Typography variant="h5" sx={{ 
            fontWeight: 'bold', 
            fontSize: { xs: '1.25rem', sm: '2rem', md: '2.5rem' }, // Display larger
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
          minWidth: { xs: 60, sm: 80 }, // 元のサイズに戻す
          minHeight: { xs: 50, sm: 60 }, // 元のサイズに戻す
          backgroundColor: isRunning ? ChessClockColors.control.stop.background : ChessClockColors.control.start.background,
          color: 'white',
          '&:hover': {
            backgroundColor: isRunning ? ChessClockColors.control.stop.hover : ChessClockColors.control.start.hover,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isRunning ? (
            <Pause sx={{ fontSize: { xs: 24, sm: 32 } }} /> // 元のアイコンサイズに戻す
          ) : (
            <PlayArrow sx={{ fontSize: { xs: 24, sm: 32 } }} /> // 元のアイコンサイズに戻す
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
          minHeight: { xs: 40, sm: 45 }, // Adjust to smaller size
          fontSize: '1rem',
          fontWeight: 'bold',
          mr: { xs: 4.5, sm: 6 }, // Increase right margin further
          ...getPlayerButtonStyle(1),
          // Disable focus/selection effects
          '&:focus': { outline: 'none', boxShadow: 'none' },
          '&:active': { outline: 'none', boxShadow: 'none' },
        }}

      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ 
            fontWeight: 'bold', 
            mb: 0.5, 
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            display: { xs: 'block', sm: 'none' }  // Show only on mobile
          }}>
            {players[1]?.name || t('setup.playerName') + ' 2'}
          </Typography>
          <Typography variant="h5" sx={{ 
            fontWeight: 'bold', 
            fontSize: { xs: '1.25rem', sm: '2rem', md: '2.5rem' }, // Display larger
            ...AppStyles.monoFont
          }}>
            {formatTime(playerTimes[1]?.remainingTime || 0)}
          </Typography>
        </Box>
      </Button>
    </Box>
  );

  return (
    <Box>
      {/* Fixed Chess Clock under AppBar */}
      <Paper
        sx={{
          position: 'fixed',
          top: 64,
          left: 0,
          right: 0,
          zIndex: 1050,
          p: { xs: 1.5, sm: 2 },
          backgroundColor: ChessClockColors.background,
          boxShadow: UIColors.shadow.medium,
        }}
      >
        <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
          {renderChessClockContent()}
        </Box>
      </Paper>

      {/* Spacer to avoid overlap with fixed header */}
      <Box sx={{ height: { xs: 80, sm: 90 } }} />
    </Box>
  );
};

export default ChessClock;
