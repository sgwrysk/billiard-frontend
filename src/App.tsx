import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  CssBaseline, 
  Container, 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Select, 
  MenuItem, 
  FormControl,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Menu as MenuIcon, Home as HomeIcon, People as PeopleIcon, Notifications as NotificationsIcon } from '@mui/icons-material';

import { useGame } from './hooks/useGame';
import { LanguageProvider, useLanguage, type Language as LanguageType } from './contexts/LanguageContext';
import { AppColors, UIColors } from './constants/colors';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import VictoryScreen from './components/VictoryScreen';
import PlayerManagement from './components/PlayerManagement';
import Notifications from './components/Notifications';
import { ConfirmDialog } from './components/ConfirmDialog';
import { GameType, GameStatus } from './types/index';
import type { Game } from './types/index';
import type { ChessClockSettings, ChessClockState } from './types/index';
import { GameEngineFactory } from './games/GameEngineFactory';

// Create Material-UI theme - Deep Blue + Outfit
const theme = createTheme({
  palette: {
    primary: {
      main: AppColors.theme.primary,
      light: AppColors.theme.primaryLight,
      dark: AppColors.theme.primaryDark,
    },
    secondary: {
      main: AppColors.theme.secondary, // Gold accent
      light: AppColors.theme.secondaryLight,
      dark: AppColors.theme.secondaryDark,
    },
    background: {
      default: UIColors.background.default,
      paper: UIColors.background.paper,
    },
  },
  typography: {
    fontFamily: '"Outfit", "Noto Sans JP", "Helvetica", "Arial", sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontWeight: 800,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${AppColors.theme.primary} 0%, ${AppColors.theme.primaryLight} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${AppColors.theme.primaryDark} 0%, ${AppColors.theme.primary} 100%)`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(25, 118, 210, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${AppColors.theme.primary} 0%, ${AppColors.theme.primaryLight} 100%)`,
          boxShadow: '0 2px 10px rgba(25, 118, 210, 0.3)',
        },
      },
    },
  },
});

const AppScreen = {
  HOME: 'HOME',
  SETUP: 'SETUP',
  GAME: 'GAME',
  VICTORY: 'VICTORY',
  PLAYER_MANAGEMENT: 'PLAYER_MANAGEMENT',
  NOTIFICATIONS: 'NOTIFICATIONS',
} as const;

// Menu configuration for extensible menu management
const MENU_ITEMS = [
  { 
    screen: AppScreen.HOME, 
    icon: HomeIcon, 
    labelKey: 'menu.scoreInput',
    requiresGameExitConfirmation: true 
  },
  { 
    screen: AppScreen.NOTIFICATIONS, 
    icon: NotificationsIcon, 
    labelKey: 'menu.notifications',
    requiresGameExitConfirmation: true 
  },
  { 
    screen: AppScreen.PLAYER_MANAGEMENT, 
    icon: PeopleIcon, 
    labelKey: 'menu.playerManagement',
    requiresGameExitConfirmation: true 
  },
] as const;

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}

const AppContent: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const [currentScreen, setCurrentScreen] = useState<string>(AppScreen.HOME);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const {
    currentGame,
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
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
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
      const gameWithWinner = {
        ...currentGame,
        winner: winnerId,
        endTime: new Date(),
      };
      setFinishedGame(gameWithWinner);
      endGame();
      setCurrentScreen(AppScreen.VICTORY);
      resetScrollPosition();
    }
  }, [currentGame, endGame]);

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
      // Manually undo the last score from the finished game first
      const engine = GameEngineFactory.getEngine(finishedGame.type);
      
      let gameAfterUndo: Game;
      if (engine.hasCustomLogic() && engine.handleCustomAction) {
        gameAfterUndo = engine.handleCustomAction(finishedGame, 'UNDO_LAST_SHOT');
      } else {
        gameAfterUndo = engine.handleUndo(finishedGame);
      }
      
      // Now restore the undone game with status reset to IN_PROGRESS
      const restoredGame = {
        ...gameAfterUndo,
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

  const handleLanguageChange = (newLanguage: LanguageType) => {
    setLanguage(newLanguage);
  };

  // Unified navigation handler with game state confirmation
  const handleSafeNavigation = (targetScreen: string, skipConfirmation = false) => {
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
  const navigateToScreen = (targetScreen: string) => {
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

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (screen: string) => {
    handleMenuClose();
    
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
    
    navigateToScreen(targetScreen);
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
    setPendingNavigation(null);
  };

  const getGameTypeLabel = (type: GameType) => {
    switch (type) {
      case GameType.SET_MATCH:
        return t('setup.gameType.setmatch');
      case GameType.ROTATION:
        return t('setup.gameType.rotation');
      case GameType.BOWLARD:
        return t('setup.gameType.bowlard');
      case GameType.JAPAN:
        return t('setup.gameType.japan');
      default:
        return type;
    }
  };

  const getAppBarTitle = () => {
    if (currentScreen === AppScreen.GAME && currentGame) {
      return getGameTypeLabel(currentGame.type);
    }
    if (currentScreen === AppScreen.VICTORY && finishedGame) {
      return t('victory.gameResult');
    }
    return t('app.title');
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* App bar */}
      <AppBar position="fixed" sx={{ zIndex: 1200 }}>
        <Toolbar>
          {/* Hamburger menu */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {getAppBarTitle()}
          </Typography>

          {/* Home button - show in game and victory screens */}
          {((currentScreen === AppScreen.GAME && currentGame) || (currentScreen === AppScreen.VICTORY && finishedGame)) && (
            <IconButton
              onClick={handleHomeButtonClick}
              title={currentScreen === AppScreen.VICTORY ? t('victory.backToHome') : t('game.backToHome')}
              size="large"
              sx={{ 
                mr: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <HomeIcon />
            </IconButton>
          )}
          
          {/* Language selector */}
          <FormControl size="small" sx={{ mr: 2, minWidth: { xs: 60, sm: 120 } }}>
            <Select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as LanguageType)}
              sx={{ 
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '.MuiSvgIcon-root': { color: 'white' }
              }}
            >
              <MenuItem value="ja">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🇯🇵 <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{t('language.japanese')}</Box>
                </Box>
              </MenuItem>
              <MenuItem value="en">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🇺🇸 <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{t('language.english')}</Box>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>

      {/* Hamburger menu dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {MENU_ITEMS.map((menuItem) => {
          const IconComponent = menuItem.icon;
          return (
            <MenuItem 
              key={menuItem.screen} 
              onClick={() => handleMenuItemClick(menuItem.screen)}
            >
              <ListItemIcon>
                <IconComponent fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t(menuItem.labelKey)} />
            </MenuItem>
          );
        })}
      </Menu>

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