import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { 
  CssBaseline, 
  Container, 
  Box, 
} from '@mui/material';

import { useGame } from './hooks/useGame';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { BallDesignProvider } from './contexts/BallDesignContext';
import { theme } from './constants/theme';
import { AppScreen, MENU_ITEMS, type AppScreenType } from './constants/navigation';
import AppHeader from './components/navigation/AppHeader';
import HamburgerMenu from './components/navigation/HamburgerMenu';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import VictoryScreen from './components/VictoryScreen';
import PlayerManagement from './components/PlayerManagement';
import Notifications from './components/Notifications';
import QRShare from './components/QRShare';
import Settings from './components/Settings';
import { ConfirmDialog } from './components/ConfirmDialog';
import { GameType, GameStatus } from './types/index';
import type { Game } from './types/index';
import type { ChessClockSettings, ChessClockState } from './types/index';
import { GameEngineFactory } from './games/GameEngineFactory';


function App() {
  return (
    <LanguageProvider>
      <BallDesignProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppContent />
        </ThemeProvider>
      </BallDesignProvider>
    </LanguageProvider>
  );
}

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const [currentScreen, setCurrentScreen] = useState<AppScreenType>(AppScreen.HOME);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const {
    currentGame,
    setCurrentGame,
    startGame,

    pocketBall,
    switchPlayer,
    switchToPlayer,
    endGame,
    resetGame,
    restoreGame,
    checkAllBallsPocketed,
    undoLastShot,
    winSet,
    addPins,
    undoBowlingRoll,
    swapPlayers,
    canSwapPlayers,
    canUndoLastShot,
    updateChessClockState,
    handleRackComplete,
    handleMultiplierChange,
    handleNextRack,
    handlePlayerOrderChange,
  } = useGame();
  
  const [finishedGame, setFinishedGame] = useState<Game | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<AppScreenType | null>(null);
  const [alternatingBreak, setAlternatingBreak] = useState<boolean>(false);

  // Helper function to reset scroll position to top
  const resetScrollPosition = () => {
    window.scrollTo(0, 0);
  };

  const handleStartGame = (players: {name: string, targetScore?: number, targetSets?: number}[], gameType: GameType, alternatingBreakSetting?: boolean, chessClock?: ChessClockSettings, japanSettings?: import('./types/japan').JapanGameSettings) => {
    setAlternatingBreak(alternatingBreakSetting || false);
    startGame(players, gameType, chessClock, japanSettings);
    setCurrentScreen(AppScreen.GAME);
    resetScrollPosition();
  };

  const handleEndGame = useCallback((winnerId?: string) => {
    if (currentGame) {
      let finalGame = currentGame;
      
      // For Japan games, calculate current rack results before ending
      if (currentGame.type === GameType.JAPAN) {
        const engine = GameEngineFactory.getEngine(GameType.JAPAN);
        if ('handleGameEnd' in engine) {
          finalGame = (engine as { handleGameEnd: (game: Game) => Game }).handleGameEnd(currentGame);
          // Update current game state with final calculations
          setCurrentGame(finalGame);
        }
      }
      
      const gameWithWinner = {
        ...finalGame,
        winner: winnerId,
        endTime: new Date(),
      };
      setFinishedGame(gameWithWinner);
      endGame();
      setCurrentScreen(AppScreen.VICTORY);
      resetScrollPosition();
    }
  }, [currentGame, endGame, setCurrentGame]);

  // Monitor game completion and automatically transition to victory screen
  useEffect(() => {
    if (currentGame && currentGame.status === GameStatus.COMPLETED) {
      // Find the winner
      let winnerId: string | undefined;
      for (const player of currentGame.players) {
        if (currentGame.type === GameType.SET_MATCH) {
          if (player.targetSets && (player.setsWon || 0) >= player.targetSets) {
            winnerId = player.id;
            break;
          }
        } else if (currentGame.type === GameType.ROTATION) {
          if (player.targetScore && player.score >= player.targetScore) {
            winnerId = player.id;
            break;
          }
        }
      }
      
      handleEndGame(winnerId);
    }
  }, [currentGame, handleEndGame]);

  const handleResetGame = () => {
    resetGame();
    setAlternatingBreak(false);
    setCurrentScreen(AppScreen.SETUP);
    resetScrollPosition();
  };

  const handleSwapPlayers = () => {
    swapPlayers();
  };

  const handleChessClockStateChange = (state: ChessClockState) => {
    updateChessClockState(state);
  };





  const handleRematch = () => {
    if (!finishedGame) return;
    
    // Create rematch players from finished game
    const rematchPlayers = finishedGame.players.map((player) => ({
      name: player.name,
      targetScore: player.targetScore,
      targetSets: player.targetSets,
    }));
    
    // Preserve chess clock settings from finished game
    const chessClockSettings = finishedGame.chessClock;
    
    // Clear finished game state first
    setFinishedGame(null);
    
    // Start new game with preserved settings (chess clock and alternating break)
    startGame(rematchPlayers, finishedGame.type, chessClockSettings);
    setCurrentScreen(AppScreen.GAME);
    resetScrollPosition();
  };

  const handleBackToMenu = () => {
    setFinishedGame(null);
    setCurrentScreen(AppScreen.HOME);
    resetScrollPosition();
  };

  const handleReturnToGame = () => {
    if (finishedGame) {
      const engine = GameEngineFactory.getEngine(finishedGame.type);
      
      let gameAfterRestore: Game;
      
      // For Japan games, use specific restore logic to revert game end calculations
      if (finishedGame.type === GameType.JAPAN && 'handleGameRestore' in engine) {
        gameAfterRestore = (engine as { handleGameRestore: (game: Game) => Game }).handleGameRestore(finishedGame);
      } else {
        // For other games, use the standard undo logic
        if (engine.hasCustomLogic() && engine.handleCustomAction) {
          gameAfterRestore = engine.handleCustomAction(finishedGame, 'UNDO_LAST_SHOT');
        } else {
          gameAfterRestore = engine.handleUndo(finishedGame);
        }
      }
      
      // Now restore the game with status reset to IN_PROGRESS
      const restoredGame = {
        ...gameAfterRestore,
        status: GameStatus.IN_PROGRESS,
        winner: undefined,
        endTime: undefined,
      };
      
      // Restore the game state
      restoreGame(restoredGame);
      
      // Clear finished game and go to game screen
      setFinishedGame(null);
      setCurrentScreen(AppScreen.GAME);
      resetScrollPosition();
    }
  };


  // Unified navigation handler with game state confirmation
  const handleSafeNavigation = (targetScreen: AppScreenType, skipConfirmation = false) => {
    // Check if confirmation is needed
    if (currentScreen === AppScreen.GAME && currentGame && !canSwapPlayers() && !skipConfirmation) {
      // Game is in progress, show confirmation dialog
      setPendingNavigation(targetScreen);
      setShowExitConfirm(true);
    } else {
      // Safe to navigate directly
      navigateToScreen(targetScreen);
    }
  };

  // Helper function to perform actual navigation
  const navigateToScreen = (targetScreen: AppScreenType) => {
    if (targetScreen === AppScreen.HOME) {
      resetGame();
    }
    setCurrentScreen(targetScreen);
    resetScrollPosition();
  };

  // Get dynamic confirmation dialog messages based on target screen
  const getConfirmationMessages = (targetScreen: string) => {
    switch (targetScreen) {
      case AppScreen.HOME:
        return {
          title: t('confirm.exitToHome.title'),
          message: t('confirm.exitToHome.message'),
          confirmText: t('confirm.exitToHome.confirm'),
          cancelText: t('confirm.exitGame.cancel'),
        };
      case AppScreen.PLAYER_MANAGEMENT:
        return {
          title: t('confirm.exitToPlayerManagement.title'),
          message: t('confirm.exitToPlayerManagement.message'),
          confirmText: t('confirm.exitToPlayerManagement.confirm'),
          cancelText: t('confirm.exitGame.cancel'),
        };
      case AppScreen.NOTIFICATIONS:
        return {
          title: t('confirm.exitToNotifications.title'),
          message: t('confirm.exitToNotifications.message'),
          confirmText: t('confirm.exitToNotifications.confirm'),
          cancelText: t('confirm.exitGame.cancel'),
        };
      case AppScreen.QR_SHARE:
        return {
          title: t('confirm.exitToQRShare.title'),
          message: t('confirm.exitToQRShare.message'),
          confirmText: t('confirm.exitToQRShare.confirm'),
          cancelText: t('confirm.exitGame.cancel'),
        };
      default:
        // Fallback to home messages for unknown screens
        return {
          title: t('confirm.exitToHome.title'),
          message: t('confirm.exitToHome.message'),
          confirmText: t('confirm.exitToHome.confirm'),
          cancelText: t('confirm.exitGame.cancel'),
        };
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (screen: AppScreenType) => {
    // Find menu item configuration
    const menuItem = MENU_ITEMS.find(item => item.screen === screen);
    
    if (menuItem?.requiresGameExitConfirmation) {
      // Use safe navigation for items requiring confirmation
      handleSafeNavigation(screen);
    } else {
      // Direct navigation for items not requiring confirmation
      navigateToScreen(screen);
    }
  };


  const handleHomeButtonClick = () => {
    if (currentScreen === AppScreen.GAME && currentGame) {
      // Go directly to home if game is in initial state
      if (canSwapPlayers()) {
        resetGame();
        setCurrentScreen(AppScreen.HOME);
        resetScrollPosition();
      } else {
        // Show confirmation dialog if game is in progress
        setPendingNavigation(AppScreen.HOME);
        setShowExitConfirm(true);
      }
    } else if (currentScreen === AppScreen.VICTORY && finishedGame) {
      // Victory screen: navigate directly to home without confirmation (game already finished)
      setFinishedGame(null);
      setCurrentScreen(AppScreen.HOME);
      resetScrollPosition();
    } else {
      setCurrentScreen(AppScreen.HOME);
      resetScrollPosition();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    
    // Navigate to pending screen if available, otherwise go to home
    const targetScreen = pendingNavigation || AppScreen.HOME;
    setPendingNavigation(null);
    
    navigateToScreen(targetScreen as AppScreenType);
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
    setPendingNavigation(null);
  };


  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* App Header */}
      <AppHeader 
        onMenuOpen={handleMenuOpen}
        currentScreen={currentScreen}
        currentGame={currentGame}
        finishedGame={finishedGame}
        onHomeButtonClick={handleHomeButtonClick}
      />

      {/* Hamburger Menu */}
      <HamburgerMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onMenuItemClick={handleMenuItemClick}
      />

      {/* Main content */}
      <Container maxWidth="lg" sx={{ py: 3, mt: 8, minHeight: 'calc(100vh - 64px)' }}>
        {currentScreen === AppScreen.HOME && (
          <GameSetup onStartGame={handleStartGame} />
        )}
        
        {currentScreen === AppScreen.SETUP && (
          <GameSetup onStartGame={handleStartGame} />
        )}
        
        {currentScreen === AppScreen.GAME && currentGame && (
          <GameBoard
            game={currentGame}
            onPocketBall={pocketBall}
            onSwitchPlayer={switchPlayer}
            onSwitchToPlayer={switchToPlayer}
            onEndGame={handleEndGame}
            onResetGame={handleResetGame}
            checkAllBallsPocketed={checkAllBallsPocketed}
            onUndoLastShot={undoLastShot}
            onWinSet={winSet}
            onAddPins={addPins}
            onUndoBowlingRoll={undoBowlingRoll}
            alternatingBreak={alternatingBreak}
            onSwapPlayers={handleSwapPlayers}
            canSwapPlayers={canSwapPlayers}
            canUndoLastShot={canUndoLastShot()}
            onChessClockStateChange={handleChessClockStateChange}
            onRackComplete={handleRackComplete}
            onMultiplierChange={handleMultiplierChange}
            onNextRack={handleNextRack}
            onPlayerOrderChange={handlePlayerOrderChange}
          />
        )}
        
        {currentScreen === AppScreen.VICTORY && finishedGame && (
          <VictoryScreen
            game={finishedGame}
            onRematch={handleRematch}
            onBackToMenu={handleBackToMenu}
            onReturnToGame={handleReturnToGame}
          />
        )}
        
        {currentScreen === AppScreen.PLAYER_MANAGEMENT && (
          <PlayerManagement />
        )}
        
        {currentScreen === AppScreen.NOTIFICATIONS && (
          <Notifications />
        )}
        
        {currentScreen === AppScreen.QR_SHARE && (
          <QRShare />
        )}
        
        {currentScreen === AppScreen.SETTINGS && (
          <Settings />
        )}
      </Container>

      {/* Exit confirmation dialog */}
      <ConfirmDialog
        open={showExitConfirm}
        {...getConfirmationMessages(pendingNavigation || AppScreen.HOME)}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </Box>
  );
};

export default App;