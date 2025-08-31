import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  FormControlLabel,
  Switch,
  Grid,
  Alert
} from '@mui/material';
import { Add as AddIcon, DeleteOutline as DeleteIcon } from '@mui/icons-material';
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

  const handleMultiplierChange = (index: number, value: number) => {
    const newMultipliers = [...settings.multipliers];
    newMultipliers[index] = { 
      label: `x${value}`, 
      value: value 
    };
    onSettingsChange({ ...settings, multipliers: newMultipliers });
  };

  const addMultiplier = () => {
    if (settings.multipliers.length < 5) {
      onSettingsChange({ 
        ...settings, 
        multipliers: [...settings.multipliers, { label: 'x2', value: 2 }] 
      });
    }
  };

  const removeMultiplier = (index: number) => {
    if (settings.multipliers.length > 1) {
      onSettingsChange({ 
        ...settings, 
        multipliers: settings.multipliers.filter((_, i) => i !== index) 
      });
    }
  };

  const handleDeductionChange = (index: number, value: number) => {
    const newDeductions = [...settings.deductions];
    newDeductions[index] = { 
      label: `-${value}`, 
      value: value 
    };
    onSettingsChange({ ...settings, deductions: newDeductions });
  };

  const addDeduction = () => {
    onSettingsChange({ 
      ...settings, 
      deductions: [...settings.deductions, { label: '-1', value: 1 }] 
    });
  };

  const removeDeduction = (index: number) => {
    onSettingsChange({ 
      ...settings, 
      deductions: settings.deductions.filter((_, i) => i !== index) 
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        {/* ハンディキャップボール設定 */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            ハンディキャップボール
          </Typography>
          <Grid container spacing={1} sx={{ maxWidth: 600 }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((ballNumber) => (
              <Grid item key={ballNumber}>
                <BallButton
                  ballNumber={ballNumber}
                  isActive={settings.handicapBalls.includes(ballNumber)}
                  onClick={handleHandicapBallToggle}
                  size="small"
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

        {/* 倍率ボタン設定 */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.multipliersEnabled}
                onChange={(e) => onSettingsChange({ 
                  ...settings, 
                  multipliersEnabled: e.target.checked,
                  // デフォルト値にリセット
                  multipliers: e.target.checked ? settings.multipliers : [{ label: 'x2', value: 2 }]
                })}
              />
            }
            label="倍率ボタンを変更する（デフォルト: x2）"
          />
          {settings.multipliersEnabled && (
            <Box mt={2}>
              {settings.multipliers.map((multiplier, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1, minWidth: 30 }}>
                    {multiplier.label}
                  </Typography>
                  <NumberInputStepper
                    value={multiplier.value}
                    onChange={(value) => handleMultiplierChange(index, value)}
                    min={2}
                    max={99}
                    step={1}
                  />
                  <IconButton 
                    onClick={() => removeMultiplier(index)}
                    disabled={settings.multipliers.length <= 1}
                    size="small"
                    sx={{ 
                      ml: 1,
                      color: 'error.main',
                      '&:hover': {
                        backgroundColor: 'error.light',
                        color: 'error.dark'
                      }
                    }}
                    aria-label="削除"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button 
                onClick={addMultiplier}
                disabled={settings.multipliers.length >= 5}
                startIcon={<AddIcon />}
                size="small"
                variant="outlined"
              >
                倍率ボタンを追加
              </Button>
            </Box>
          )}
        </Grid>

        {/* 減点設定 */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.deductionEnabled}
                onChange={(e) => onSettingsChange({ ...settings, deductionEnabled: e.target.checked })}
              />
            }
            label="減点を有効にする"
          />
          {settings.deductionEnabled && (
            <Box mt={2}>
              {settings.deductions.map((deduction, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1, minWidth: 30 }}>
                    {deduction.label}
                  </Typography>
                  <NumberInputStepper
                    value={deduction.value}
                    onChange={(value) => handleDeductionChange(index, value)}
                    min={1}
                    max={99}
                    step={1}
                  />
                  <IconButton 
                    onClick={() => removeDeduction(index)}
                    size="small"
                    sx={{ 
                      ml: 1,
                      color: 'error.main',
                      '&:hover': {
                        backgroundColor: 'error.light',
                        color: 'error.dark'
                      }
                    }}
                    aria-label="削除"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button 
                onClick={addDeduction}
                startIcon={<AddIcon />}
                size="small"
                variant="outlined"
              >
                減点ボタンを追加
              </Button>
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