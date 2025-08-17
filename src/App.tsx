import React, { useState, useEffect } from 'react';
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
import { Menu as MenuIcon, Home as HomeIcon } from '@mui/icons-material';

import { useGame } from './hooks/useGame';
import { LanguageProvider, useLanguage, type Language as LanguageType } from './contexts/LanguageContext';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import VictoryScreen from './components/VictoryScreen';
import { GameType, GameStatus } from './types/index';

// Create Material-UI theme - Deep Blue + Outfit
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Deep Blue
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#ffc107', // Gold accent
      light: '#fff350',
      dark: '#c79100',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
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
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
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
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
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
} as const;

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
    checkAllBallsPocketed,
    undoLastShot,
    winSet,
    addPins,
    undoBowlingRoll,
  } = useGame();
  
  const [finishedGame, setFinishedGame] = useState<any>(null);

  // ゲーム終了を監視して自動的に勝利画面に遷移
  useEffect(() => {
    if (currentGame && currentGame.status === GameStatus.COMPLETED) {
      // 勝者を見つける
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
  }, [currentGame]);


  const handleStartGame = (players: {name: string, targetScore?: number, targetSets?: number}[], gameType: GameType) => {
    startGame(players, gameType);
    setCurrentScreen(AppScreen.GAME);
  };

  const handleEndGame = (winnerId?: string) => {
    if (currentGame) {
      const gameWithWinner = {
        ...currentGame,
        winner: winnerId,
        endTime: new Date(),
      };
      setFinishedGame(gameWithWinner);
      endGame();
      setCurrentScreen(AppScreen.VICTORY);
    }
  };

  const handleResetGame = () => {
    resetGame();
    setCurrentScreen(AppScreen.SETUP);
  };





  const handleRematch = () => {
    if (!finishedGame) return;
    
    // Create rematch players from finished game
    const rematchPlayers = finishedGame.players.map((player: any) => ({
      name: player.name,
      targetScore: player.targetScore,
      targetSets: player.targetSets,
    }));
    
    // Clear finished game state first
    setFinishedGame(null);
    
    // Start new game directly
    startGame(rematchPlayers, finishedGame.type);
    setCurrentScreen(AppScreen.GAME);
  };

  const handleBackToMenu = () => {
    setFinishedGame(null);
    setCurrentScreen(AppScreen.HOME);
  };

  const handleLanguageChange = (newLanguage: LanguageType) => {
    setLanguage(newLanguage);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (screen: string) => {
    setCurrentScreen(screen);
    handleMenuClose();
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* App bar */}
      <AppBar position="static">
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
            {t('app.title')}
          </Typography>
          
          {/* Language selector */}
          <FormControl size="small" sx={{ mr: 2, minWidth: 120 }}>
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
                  🇯🇵 {t('language.japanese')}
                </Box>
              </MenuItem>
              <MenuItem value="en">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🇺🇸 {t('language.english')}
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
        <MenuItem onClick={() => handleMenuItemClick(AppScreen.HOME)}>
          <ListItemIcon>
            <HomeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('menu.scoreInput')} />
        </MenuItem>
      </Menu>

      {/* Main content */}
      <Container maxWidth="lg" sx={{ py: 3, minHeight: 'calc(100vh - 64px)' }}>
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
          />
        )}
        
        {currentScreen === AppScreen.VICTORY && finishedGame && (
          <VictoryScreen
            game={finishedGame}
            onRematch={handleRematch}
            onBackToMenu={handleBackToMenu}
          />
        )}
      </Container>
    </Box>
  );
};

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

export default App;