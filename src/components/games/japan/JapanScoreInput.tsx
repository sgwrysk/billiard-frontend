import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
} from '@mui/material';
import type { Game } from '../../../types/index';
import { UIColors, GameColors } from '../../../constants/colors';

interface JapanScoreInputProps {
  game: Game;
  onRackComplete: (rackData: { player1Balls: number; player2Balls: number; rackNumber: number }) => void;
  onSwitchPlayer: () => void;
  onUndoLastShot: () => void;
  canUndoLastShot?: boolean;
}

const JapanScoreInput: React.FC<JapanScoreInputProps> = ({
  game,
  onRackComplete,
  onSwitchPlayer,
  onUndoLastShot,
  canUndoLastShot = false,
}) => {
  
  // State for ball count inputs for each player
  const [ballCounts, setBallCounts] = useState<Record<string, number>>(
    game.players.reduce((acc, player) => ({ ...acc, [player.id]: 0 }), {})
  );

  const handleBallCountChange = (playerId: string, count: number) => {
    // Ensure count is between 0 and 10
    const validCount = Math.max(0, Math.min(10, count));
    setBallCounts(prev => ({ ...prev, [playerId]: validCount }));
  };

  const handleRackComplete = () => {
    if (game.players.length >= 2) {
      onRackComplete({
        player1Balls: ballCounts[game.players[0].id] || 0,
        player2Balls: ballCounts[game.players[1].id] || 0,
        rackNumber: game.currentRack
      });
      
      // Reset ball counts for next rack
      setBallCounts(game.players.reduce((acc, player) => ({ ...acc, [player.id]: 0 }), {}));
    }
  };



  return (
    <Box sx={{ p: 2, maxWidth: '1200px', mx: 'auto' }}>
      {/* Rack Header */}
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
        ラック {game.currentRack}
      </Typography>

      {/* Player Score Cards and Ball Input */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {game.players.map((player) => (
          <Grid item xs={12} sm={6} key={player.id}>
            <Card 
              elevation={player.isActive ? 6 : 2}
              sx={{
                border: player.isActive ? GameColors.playerSelected.border : GameColors.playerUnselected.border,
                backgroundColor: UIColors.background.white,
                transform: player.isActive ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease-in-out',
                boxShadow: player.isActive 
                  ? '0 8px 24px rgba(25, 118, 210, 0.15)' 
                  : UIColors.shadow.medium,
              }}
            >
              <CardContent>
                <Typography 
                  variant="h6"
                  sx={{ fontSize: { xs: '1.1rem', md: '1.4rem' }, fontWeight: 700, mb: 1 }}
                >
                  {player.name}
                </Typography>
                <Typography 
                  variant="h4" 
                  color="primary"
                  sx={{ fontSize: { xs: '2rem', md: '2.6rem' }, fontWeight: 800, mb: 2 }}
                >
                  {player.score}
                </Typography>
                
                {/* Ball Count Input */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: '80px' }}>
                    取得ボール数:
                  </Typography>
                  <TextField
                    type="number"
                    value={ballCounts[player.id] || 0}
                    onChange={(e) => handleBallCountChange(player.id, parseInt(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 10 }}
                    size="small"
                    sx={{ width: '80px' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Rack Complete Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleRackComplete}
        >
          ラック完了
        </Button>
      </Box>



      {/* Control Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        {canUndoLastShot && (
          <Button
            variant="outlined"
            color="warning"
            onClick={onUndoLastShot}
          >
            取り消し
          </Button>
        )}
        <Button
          variant="contained"
          color="secondary"
          onClick={onSwitchPlayer}
        >
          プレイヤー交代
        </Button>
      </Box>
    </Box>
  );
};

export default JapanScoreInput;