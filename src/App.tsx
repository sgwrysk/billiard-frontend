import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, AppBar, Toolbar, Typography, Box, Select, MenuItem, FormControl } from '@mui/material';

import { useGame } from './hooks/useGame';
import { LanguageProvider, useLanguage, type Language as LanguageType } from './contexts/LanguageContext';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import GameHistory from './components/GameHistory';
import VictoryScreen from './components/VictoryScreen';
import { GameType } from './types/index';

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
  SETUP: 'SETUP',
  GAME: 'GAME',
  VICTORY: 'VICTORY',
  HISTORY: 'HISTORY',
} as const;

const AppContent: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const [currentScreen, setCurrentScreen] = useState<string>(AppScreen.SETUP);
  const {
    currentGame,
    gameHistory,
    playerStats,
    startGame,

    pocketBall,
    switchPlayer,
    switchToPlayer,
    endGame,
    resetGame,
    resetRack,
    checkAllBallsPocketed,
    undoLastShot,
    winSet,
    addPins,
    undoBowlingRoll,
  } = useGame();
  
  const [finishedGame, setFinishedGame] = useState<any>(null);



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
      endGame(winnerId);
      setCurrentScreen(AppScreen.VICTORY);
    }
  };

  const handleResetGame = () => {
    resetGame();
    setCurrentScreen(AppScreen.SETUP);
  };



  const handleBackToSetup = () => {
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
    setCurrentScreen(AppScreen.SETUP);
  };

  const handleLanguageChange = (newLanguage: LanguageType) => {
    setLanguage(newLanguage);
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* App bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🎱 {t('app.title')}
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

      {/* Main content */}
      <Container maxWidth="lg" sx={{ py: 3, minHeight: 'calc(100vh - 64px)' }}>
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
            onResetRack={resetRack}
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
            playerStats={playerStats}
            onRematch={handleRematch}
            onBackToMenu={handleBackToMenu}
          />
        )}
        
        {currentScreen === AppScreen.HISTORY && (
          <GameHistory
            gameHistory={gameHistory}
            onBack={handleBackToSetup}
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