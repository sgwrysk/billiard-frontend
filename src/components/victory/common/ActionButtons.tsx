import React from 'react';
import {
  Paper,
  Grid,
  Button,
} from '@mui/material';
import { 
  Refresh, 
  Home, 
  ArrowBack
} from '@mui/icons-material';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { BaseVictoryScreenProps } from './BaseVictoryScreenProps';

type ActionButtonsProps = Pick<BaseVictoryScreenProps, 'onRematch' | 'onBackToMenu' | 'onReturnToGame'>;

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onRematch,
  onBackToMenu,
  onReturnToGame,
}) => {
  const { t } = useLanguage();

  return (
    <Paper sx={{ p: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            size="large"
            startIcon={<ArrowBack />}
            onClick={onReturnToGame}
          >
            {t('victory.returnToGame')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Refresh />}
            onClick={onRematch}
          >
            再戦する
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            size="large"
            startIcon={<Home />}
            onClick={onBackToMenu}
          >
            メニューに戻る
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ActionButtons;