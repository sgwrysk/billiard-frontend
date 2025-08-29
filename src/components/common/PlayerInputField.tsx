import React, { useState, useEffect } from 'react';
import {
  TextField,
  Autocomplete,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { getSuggestedPlayers, getDefaultPlayer } from '../../utils/playerStorage';
import type { Player } from '../../types/player';
import { useErrorNotification } from './ErrorNotification';

export interface PlayerInputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  playerPosition?: 1 | 2;
  disabled?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  sx?: any;
  inputProps?: any;
}

const PlayerInputField: React.FC<PlayerInputFieldProps> = ({
  label,
  value,
  onChange,
  onFocus,
  playerPosition,
  disabled = false,
  variant = 'outlined',
  size = 'small',
  fullWidth = false,
  sx = {},
  inputProps = {}
}) => {
  const { t } = useLanguage();
  const { showError } = useErrorNotification();
  const [suggestedPlayers, setSuggestedPlayers] = useState<Player[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load suggested players and set default value
  useEffect(() => {
    try {
      const players = getSuggestedPlayers();
      setSuggestedPlayers(players);

      // Set default player if no value and position is specified
      if (!value && playerPosition && !isInitialized) {
        const defaultPlayer = getDefaultPlayer(playerPosition);
        if (defaultPlayer) {
          onChange(defaultPlayer.name);
        }
        setIsInitialized(true);
      } else if (!playerPosition && !isInitialized) {
        setIsInitialized(true);
      }
    } catch (error) {
      showError(t('error.playerDataLoad') || 'Failed to load player data');
      setSuggestedPlayers([]);
      if (!isInitialized) {
        setIsInitialized(true);
      }
    }
  }, [value, playerPosition, isInitialized, onChange, showError, t]);

  const handleChange = (_event: any, newValue: string | Player | null) => {
    let playerName = '';
    
    if (typeof newValue === 'string') {
      playerName = newValue;
    } else if (newValue && typeof newValue === 'object' && 'name' in newValue) {
      playerName = newValue.name;
    }
    
    onChange(playerName);
  };

  const handleInputChange = (_event: React.SyntheticEvent, newInputValue: string) => {
    onChange(newInputValue);
  };

  // Create options from suggested players
  const options = suggestedPlayers.map(player => ({
    ...player,
    label: player.name
  }));

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <Autocomplete
        freeSolo
        options={options}
        getOptionLabel={(option) => {
          if (typeof option === 'string') return option;
          return option.name || '';
        }}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option.id}>
            <Typography variant="body2">
              {option.name}
            </Typography>
          </Box>
        )}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={index}
              label={typeof option === 'string' ? option : option.name}
              size="small"
            />
          ))
        }
        value={value}
        onChange={handleChange}
        onInputChange={handleInputChange}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            variant={variant}
            size={size}
            fullWidth={fullWidth}
            onFocus={onFocus}
            inputProps={{
              ...params.inputProps,
              ...inputProps,
              autoComplete: 'off',
              autoCapitalize: 'words',
              maxLength: 20
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                minHeight: size === 'small' ? 44 : 56
              }
            }}
          />
        )}
        componentsProps={{
          popper: {
            sx: {
              '& .MuiAutocomplete-listbox': {
                maxHeight: '200px'
              }
            }
          }
        }}
      />
      
      {/* Character count indicator */}
      <Box
        sx={{
          position: 'absolute',
          right: 8,
          bottom: -20,
          fontSize: '0.75rem',
          color: 'text.secondary'
        }}
      >
        {value.length}/20
      </Box>
    </Box>
  );
};

export default PlayerInputField;