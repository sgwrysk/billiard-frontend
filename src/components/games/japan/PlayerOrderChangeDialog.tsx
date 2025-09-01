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
import type { Player, Game } from '../../../types/index';

interface PlayerOrderChangeDialogProps {
  open: boolean;
  players: Player[];
  currentRack: number;
  game: Game;
  onConfirm: (selectedPlayerId: string) => void;
  onCancel: () => void;
  onEndGame: () => void;
}

const PlayerOrderChangeDialog: React.FC<PlayerOrderChangeDialogProps> = ({
  open,
  players,
  currentRack,
  game,
  onConfirm,
  onCancel,
  onEndGame,
}) => {
  // Find the last player who scored in the current rack
  const getLastScorerInCurrentRack = (): string => {
    // Find the last rack complete shot to determine current rack boundary
    let lastRackCompleteIndex = -1;
    for (let i = game.shotHistory.length - 1; i >= 0; i--) {
      if (game.shotHistory[i].customData?.type === 'rack_complete') {
        lastRackCompleteIndex = i;
        break;
      }
    }
    
    // Get shots from current rack
    const currentRackShots = game.shotHistory.slice(lastRackCompleteIndex + 1);
    
    // Find the last ball_click shot (actual scoring shot)
    for (let i = currentRackShots.length - 1; i >= 0; i--) {
      const shot = currentRackShots[i];
      if (shot.customData?.type === 'ball_click') {
        return shot.playerId;
      }
    }
    
    // Fallback to first player if no shots found
    return players[0]?.id || '';
  };
  
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  
  // Update selection when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedPlayerId(getLastScorerInCurrentRack());
    }
  }, [open, game.shotHistory]);

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

      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
        <Button
          onClick={onEndGame}
          variant="outlined"
          color="error"
          size="large"
          sx={{ flex: 1 }}
        >
          ゲーム終了
        </Button>
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