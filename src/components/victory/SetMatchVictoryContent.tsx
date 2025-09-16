import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
} from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import SetHistory from '../SetHistory';
import type { GameVictoryContentProps } from './common';

const SetMatchVictoryContent: React.FC<GameVictoryContentProps> = ({ game }) => {
  const winner = game.players.find(p => p.id === game.winner);

  return (
    <Box>
      {/* Victory announcement */}
      <Card sx={{ mb: 3, bgcolor: 'success.50', border: '2px solid', borderColor: 'success.main' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <EmojiEvents sx={{ fontSize: 80, color: 'gold', mb: 2 }} />
          {winner && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'success.main',
                  width: 64,
                  height: 64,
                  fontSize: '2rem'
                }}
              >
                {winner.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h4" component="h2">
                  {winner.name}
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Set History */}
      <SetHistory game={game} />
    </Box>
  );
};

export default SetMatchVictoryContent;