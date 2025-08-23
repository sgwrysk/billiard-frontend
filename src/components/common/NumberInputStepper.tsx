import React from 'react';
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === '') {
      onChange(min);
    } else {
      const numericValue = parseInt(newValue);
      if (!isNaN(numericValue)) {
        const clampedValue = Math.max(min, Math.min(max, numericValue));
        onChange(clampedValue);
      }
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
          value={value.toString()}
          onChange={handleInputChange}
          size="small"
          disabled={disabled}
          sx={{
            width: 60,
            '& .MuiInputBase-input': {
              textAlign: 'center',
              ...AppStyles.monoFont,
            },
            '& .MuiOutlinedInput-input': {
              color: 'rgba(0, 0, 0, 0.87) !important',
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