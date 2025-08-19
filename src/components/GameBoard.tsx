import React, { useState } from 'react';
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
import { ConfirmDialog } from './ConfirmDialog';
import { isGameInProgress } from '../utils/gameUtils';

interface GameBoardProps {
  game: Game;
  onPocketBall: (ballNumber: number) => void;
  onSwitchPlayer: () => void;
  onSwitchToPlayer: (playerIndex: number) => void;
  onEndGame: (winnerId?: string) => void;
  onResetGame: () => void;
  checkAllBallsPocketed: () => boolean;
  onUndoLastShot: () => void;
  onWinSet: (playerId: string) => void;
  onAddPins?: (pins: number) => void;
  onUndoBowlingRoll?: () => void;
  alternatingBreak?: boolean;
  onSwapPlayers?: () => void;
  canSwapPlayers?: () => boolean;
  canUndoLastShot?: () => boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({
  game,
  onPocketBall,
  onSwitchPlayer,
  onSwitchToPlayer,
  onEndGame,
  onResetGame,
  onUndoLastShot,
  onWinSet,
  onAddPins,
  onUndoBowlingRoll,
  alternatingBreak = false,
  onSwapPlayers,
  canSwapPlayers,
  canUndoLastShot,
}) => {
  const { t } = useLanguage();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleHomeButtonClick = () => {
    if (isGameInProgress(game)) {
      setShowExitConfirm(true);
    } else {
      onResetGame();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    onResetGame();
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

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
          <>

            <SetMatchBoard
              game={game}
              onWinSet={onWinSet}
              onUndoLastShot={onUndoLastShot}
              alternatingBreak={alternatingBreak}
              onSwapPlayers={onSwapPlayers}
              canSwapPlayers={canSwapPlayers ? canSwapPlayers() : false}
              canUndoLastShot={canUndoLastShot ? canUndoLastShot() : false}
            />
          </>
        );
      
      case GameType.ROTATION:
        return (
          <RotationBoard
            game={game}
            onPocketBall={onPocketBall}
            onSwitchPlayer={onSwitchPlayer}
            onUndoLastShot={onUndoLastShot}
            onSelectPlayer={(playerId: string) => {
              const playerIndex = game.players.findIndex(p => p.id === playerId);
              if (playerIndex !== -1) {
                onSwitchToPlayer(playerIndex);
              }
            }}
            onSwapPlayers={onSwapPlayers}
            canSwapPlayers={canSwapPlayers ? canSwapPlayers() : false}
            canUndoLastShot={canUndoLastShot ? canUndoLastShot() : false}
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
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h4" component="h1">
              {getGameTypeLabel(game.type)}
            </Typography>
            <IconButton
              onClick={handleHomeButtonClick}
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

      {/* Exit confirmation dialog */}
      <ConfirmDialog
        open={showExitConfirm}
        title={t('confirm.exitGame.title')}
        message={t('confirm.exitGame.message')}
        confirmText={t('confirm.exitGame.confirm')}
        cancelText={t('confirm.exitGame.cancel')}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </Box>
  );
};

export default GameBoard;
