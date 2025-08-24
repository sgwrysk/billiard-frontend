import React from 'react';
import {
  Box,
  Switch,
  Typography,
  FormControlLabel,
  FormControl,
} from '@mui/material';

interface ToggleSwitchProps {
  /**
   * Toggle switch state
   */
  checked: boolean;
  /**
   * Callback when state changes
   */
  onChange: (checked: boolean) => void;
  /**
   * Toggle switch label
   */
  label: string;
  /**
   * Description text (optional)
   */
  description?: string;
  /**
   * Whether to disable
   */
  disabled?: boolean;
  /**
   * Custom styles
   */
  sx?: Record<string, unknown>;
}

/**
 * トグルスイッチの共通コンポーネント
 * オン/オフの設定を直感的に操作できるUIを提供します
 */
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  sx = {},
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(event.target.checked);
    }
  };

  return (
    <Box sx={{ ...sx }}>
      <FormControl component="fieldset" disabled={disabled}>
        <FormControlLabel
          control={
            <Switch
              checked={checked}
              onChange={handleChange}
              disabled={disabled}
              color="primary"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    opacity: 0.08,
                  },
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'primary.main',
                },
              }}
            />
          }
          label={
            <Box>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: disabled ? 'text.disabled' : 'text.primary',
                }}
              >
                {label}
              </Typography>
              {description && (
                <Typography
                  variant="body2"
                  sx={{
                    color: disabled ? 'text.disabled' : 'text.secondary',
                    mt: 0.5,
                    fontSize: '0.875rem',
                    lineHeight: 1.4,
                  }}
                >
                  {description}
                </Typography>
              )}
            </Box>
          }
          sx={{
            alignItems: 'center',
            margin: 0,
            '& .MuiFormControlLabel-label': {
              marginLeft: 1,
              flex: 1,
            },
          }}
        />
      </FormControl>
    </Box>
  );
};

export default ToggleSwitch;
