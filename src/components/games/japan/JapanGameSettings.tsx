import React from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Grid,
  Alert
} from '@mui/material';
import { BallButton, NumberInputStepper } from '../../common';
import type { JapanGameSettings } from '../../../types/japan';

interface JapanGameSettingsProps {
  settings: JapanGameSettings;
  onSettingsChange: (settings: JapanGameSettings) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const JapanGameSettingsComponent: React.FC<JapanGameSettingsProps> = ({ 
  settings, 
  onSettingsChange,
  onValidationChange
}) => {
  const [errors, setErrors] = React.useState<string[]>([]);

  const validateSettings = React.useCallback(() => {
    const newErrors: string[] = [];
    
    // 9番か10番のどちらかが必ず選択されていることを確認
    const has9 = settings.handicapBalls.includes(9);
    const has10 = settings.handicapBalls.includes(10);
    
    if (!has9 && !has10) {
      newErrors.push('9番か10番のどちらかを必ず選択してください');
    }
    
    setErrors(newErrors);
    const isValid = newErrors.length === 0;
    onValidationChange?.(isValid);
    return isValid;
  }, [settings.handicapBalls, onValidationChange]);

  React.useEffect(() => {
    validateSettings();
  }, [validateSettings]);

  const handleHandicapBallToggle = (ballNumber: number) => {
    const newBalls = settings.handicapBalls.includes(ballNumber)
      ? settings.handicapBalls.filter(ball => ball !== ballNumber)
      : [...settings.handicapBalls, ballNumber];
    onSettingsChange({ ...settings, handicapBalls: newBalls });
  };



  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        {/* ハンディキャップボール設定 */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            ハンディキャップボール
          </Typography>
          <Grid container spacing={1} sx={{ maxWidth: 800 }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((ballNumber) => (
              <Grid item key={ballNumber}>
                <BallButton
                  ballNumber={ballNumber}
                  isActive={settings.handicapBalls.includes(ballNumber)}
                  onClick={handleHandicapBallToggle}
                  size="medium"
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* 順替えのラック数 */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.orderChangeEnabled}
                onChange={(e) => onSettingsChange({ 
                  ...settings, 
                  orderChangeEnabled: e.target.checked,
                  // デフォルト値にリセット
                  orderChangeInterval: e.target.checked ? settings.orderChangeInterval : 10
                })}
              />
            }
            label="順替えのラック数を変更する（デフォルト: 10）"
          />
          {settings.orderChangeEnabled && (
            <Box mt={2}>
              <NumberInputStepper
                value={settings.orderChangeInterval}
                onChange={(value) => onSettingsChange({ ...settings, orderChangeInterval: value })}
                min={5}
                max={100}
                step={5}
              />
            </Box>
          )}
        </Grid>



        {/* エラー表示 */}
        {errors.map((error, index) => (
          <Grid item xs={12} key={index}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default JapanGameSettingsComponent;