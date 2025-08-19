import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';
import type { Game } from '../types/index';
import { GameType } from '../types/index';
import { SetMatchBoard } from './games/SetMatchBoard';
import { RotationBoard } from './games/RotationBoard';
import { BowlardBoard } from './games/BowlardBoard';
import { ConfirmDialog } from './ConfirmDialog';

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

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    onResetGame();
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
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
              onTimeUp={(playerIndex) => {
                // Handle time up - could trigger automatic player switch or just show warning
                console.log(`Player ${playerIndex} time is up!`);
              }}
              onSwitchToPlayer={onSwitchToPlayer}
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
            onTimeUp={(playerIndex) => {
              // Handle time up - could trigger automatic player switch or just show warning
              console.log(`Player ${playerIndex} time is up!`);
            }}
            onSwitchToPlayer={onSwitchToPlayer}
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
