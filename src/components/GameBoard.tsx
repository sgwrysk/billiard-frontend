import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
} from '@mui/material';
import { Home } from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import type { Game } from '../types/index';
import { GameType } from '../types/index';
import { SetMatchBoard } from './games/SetMatchBoard';
import { RotationBoard } from './games/RotationBoard';
import { BowlardBoard } from './games/BowlardBoard';

interface GameBoardProps {
  game: Game;
  onPocketBall: (ballNumber: number) => void;
  onSwitchPlayer: () => void;
  onSwitchToPlayer: (playerIndex: number) => void;
  onEndGame: (winnerId?: string) => void;
  onResetGame: () => void;
  onResetRack: () => void;
  checkAllBallsPocketed: () => boolean;
  onUndoLastShot: () => void;
  onWinSet: (playerId: string) => void;
  onAddPins?: (pins: number) => void;
  onUndoBowlingRoll?: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  game,
  onPocketBall,
  onSwitchPlayer,
  onEndGame,
  onResetGame,
  onResetRack,
  onUndoLastShot,
  onWinSet,
  onAddPins,
  onUndoBowlingRoll,
}) => {
  const { t } = useLanguage();

  const getGameTypeLabel = (type: GameType) => {
    switch (type) {
      case GameType.SET_MATCH:
        return t('setup.gameType.setmatch');
      case GameType.ROTATION:
        return t('setup.gameType.rotation');
      case GameType.BOWLARD:
        return t('setup.gameType.bowlard');
      default:
        return type;
    }
  };

  const renderGameSpecificBoard = () => {
    switch (game.type) {
      case GameType.SET_MATCH:
        return (
          <SetMatchBoard
            game={game}
            onPocketBall={onPocketBall}
            onSwitchPlayer={onSwitchPlayer}
            onResetRack={onResetRack}
            onWinSet={onWinSet}
            onUndoLastShot={onUndoLastShot}
          />
        );
      
      case GameType.ROTATION:
        return (
          <RotationBoard
            game={game}
            onPocketBall={onPocketBall}
            onSwitchPlayer={onSwitchPlayer}
            onUndoLastShot={onUndoLastShot}
          />
        );
      
      case GameType.BOWLARD:
        return (
          <BowlardBoard
            game={game}
            onAddPins={onAddPins!}
            onUndoBowlingRoll={onUndoBowlingRoll!}
            onEndGame={onEndGame}
          />
        );
      
      default:
        return (
          <Card>
            <CardContent>
              <Typography>
                {t('game.unsupportedGameType')}: {game.type}
              </Typography>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: '1200px', mx: 'auto' }}>
      {/* Header */}
      <Card sx={{ mb: 3, position: 'relative' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {getGameTypeLabel(game.type)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('game.rack')} {game.currentRack}
              </Typography>
            </Box>
            <IconButton
              onClick={onResetGame}
              title={t('game.backToHome')}
              size="large"
              sx={{ 
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              <Home />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Game-specific board */}
      {renderGameSpecificBoard()}
    </Box>
  );
};

export default GameBoard;
