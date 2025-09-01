import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import type { Game } from '../../../types/index';
import type { JapanBallAction } from '../../../types/japan';
import { BallButton } from '../../common';
import { UIColors, GameColors } from '../../../constants/colors';

interface JapanBoardProps {
  game: Game;
  onBallAction: (action: JapanBallAction) => void;
  onSwitchPlayer: () => void;
  onUndoLastShot: () => void;
  canUndoLastShot?: boolean;
}

const JapanBoard: React.FC<JapanBoardProps> = ({
  game,
  onBallAction,
  onSwitchPlayer,
  onUndoLastShot,
  canUndoLastShot = false,
}) => {
  const japanSettings = game.japanSettings!;

  const handleBallClick = (ballNumber: number) => {
    onBallAction({
      ball: ballNumber,
      type: 'ball',
      value: ballNumber,
      label: undefined
    });
  };


  const isHandicapBall = (ballNumber: number) => {
    return japanSettings.handicapBalls.includes(ballNumber);
  };

  return (
    <Box sx={{ p: 2, maxWidth: '1200px', mx: 'auto' }}>
      {/* Player Cards */}
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
                  sx={{ fontSize: { xs: '1.1rem', md: '1.4rem' }, fontWeight: 700 }}
                >
                  {player.name}
                </Typography>
                <Typography 
                  variant="h4" 
                  color="primary"
                  sx={{ fontSize: { xs: '2rem', md: '2.6rem' }, fontWeight: 800 }}
                >
                  {player.score}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Ball Input Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ボール選択
          </Typography>
          <Grid container spacing={1} sx={{ maxWidth: 600 }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((ballNumber) => (
              <Grid item key={ballNumber}>
                <BallButton
                  ballNumber={ballNumber}
                  isActive={isHandicapBall(ballNumber)}
                  onClick={handleBallClick}
                  size="medium"
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>



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
          color="primary"
          onClick={onSwitchPlayer}
        >
          プレイヤー交代
        </Button>
      </Box>
    </Box>
  );
};

export default JapanBoard;