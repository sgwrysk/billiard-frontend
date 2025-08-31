import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
} from '@mui/material';
import type { Player } from '../../../types/index';

interface PlayerOrderChangeDialogProps {
  open: boolean;
  players: Player[];
  currentRack: number;
  onConfirm: (selectedPlayerId: string) => void;
  onCancel: () => void;
}

const PlayerOrderChangeDialog: React.FC<PlayerOrderChangeDialogProps> = ({
  open,
  players,
  currentRack,
  onConfirm,
  onCancel,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  const handleConfirm = () => {
    if (selectedPlayerId) {
      onConfirm(selectedPlayerId);
      setSelectedPlayerId(''); // Reset selection
    }
  };

  const handleCancel = () => {
    setSelectedPlayerId(''); // Reset selection
    onCancel();
  };

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(playerId);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.25rem' }}>
        順替え
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            ラック{currentRack}が完了しました
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            次のラックの一番目のプレイヤーを選択してください
          </Typography>
        </Box>

        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold' }}>
            一番目のプレイヤー
          </FormLabel>
          <RadioGroup
            value={selectedPlayerId}
            onChange={(e) => handlePlayerSelect(e.target.value)}
          >
            {players.map((player) => (
              <FormControlLabel
                key={player.id}
                value={player.id}
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body1" fontWeight={500}>
                      {player.name}
                    </Typography>
                  </Box>
                }
                sx={{
                  mb: 1,
                  '& .MuiFormControlLabel-label': {
                    width: '100%',
                  },
                  '& .MuiRadio-root': {
                    color: 'primary.main',
                  },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {players.length === 3 && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              ※ 3人の場合：選択したプレイヤーが1番目になり、残りの順番が入れ替わります
            </Typography>
          </Box>
        )}

        {players.length >= 4 && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              ※ 4人以上の場合：選択したプレイヤーが1番目になり、残りはランダムに配置されます
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          color="inherit"
          size="large"
          sx={{ flex: 1 }}
        >
          キャンセル
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          size="large"
          disabled={!selectedPlayerId}
          sx={{ flex: 1 }}
        >
          順替え
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlayerOrderChangeDialog;