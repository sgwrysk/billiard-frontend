import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  TextField,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { AppStyles } from '../../constants/colors';

interface NumberInputStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
}

const NumberInputStepper: React.FC<NumberInputStepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 999,
  step = 1,
  label,
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleDecrement = () => {
    if (!disabled && value > min) {
      const newValue = Math.max(min, value - step);
      onChange(newValue);
    }
  };

  const handleIncrement = () => {
    if (!disabled && value < max) {
      const newValue = Math.min(max, value + step);
      onChange(newValue);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!disabled) {
      setIsEditing(true);
      setInputValue(value.toString());
      // Select all text when focusing
      e.target.select();
    }
  };

  const handleBlur = () => {
    if (isEditing) {
      const numericValue = parseInt(inputValue);
      if (!isNaN(numericValue)) {
        const clampedValue = Math.max(min, Math.min(max, numericValue));
        onChange(clampedValue);
      } else {
        // If invalid input, keep current value
        onChange(value);
      }
      setIsEditing(false);
      setInputValue('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEditing) {
      const newValue = e.target.value;
      // Allow empty string and digits only
      if (newValue === '' || /^\d+$/.test(newValue)) {
        setInputValue(newValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue('');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      {label && (
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
          {label}
        </Typography>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton 
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          size="small"
        >
          <Remove fontSize="small" />
        </IconButton>
        
        <TextField
          type="text"
          value={isEditing ? inputValue : value.toString()}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          size="small"
          disabled={disabled}
          inputProps={{
            style: {
              textAlign: 'center',
              color: '#000000',
              WebkitTextFillColor: '#000000',
              fontWeight: 600,
              ...AppStyles.monoFont,
            }
          }}
          sx={{
            width: 60,
            '& .MuiInputBase-input': {
              color: '#000000 !important',
              WebkitTextFillColor: '#000000 !important',
            },
            '& .MuiOutlinedInput-input': {
              color: '#000000 !important',
              WebkitTextFillColor: '#000000 !important',
            },
            '& input': {
              color: '#000000 !important',
              WebkitTextFillColor: '#000000 !important',
            }
          }}
        />
        
        <IconButton 
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          size="small"
        >
          <Add fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default NumberInputStepper;