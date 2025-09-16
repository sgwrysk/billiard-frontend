import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  IconButton,
} from '@mui/material';
import { Menu as MenuIcon, Home as HomeIcon } from '@mui/icons-material';
import { useLanguage, type Language as LanguageType } from '../../contexts/LanguageContext';
import { AppScreen, type AppScreenType } from '../../constants/navigation';
import { GameType } from '../../types/index';
import type { Game } from '../../types/index';

interface AppHeaderProps {
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  currentScreen: AppScreenType;
  currentGame: Game | null;
  finishedGame: Game | null;
  onHomeButtonClick: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  onMenuOpen, 
  currentScreen, 
  currentGame, 
  finishedGame, 
  onHomeButtonClick 
}) => {
  const { t, language, setLanguage } = useLanguage();

  const handleLanguageChange = (event: { target: { value: string } }) => {
    setLanguage(event.target.value as LanguageType);
  };

  const getGameTypeLabel = (type: GameType): string => {
    switch (type) {
      case GameType.SET_MATCH:
        return t('setup.gameType.setMatch');
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

  const showHomeButton = (currentScreen === AppScreen.GAME && currentGame) || 
                         (currentScreen === AppScreen.VICTORY && finishedGame);

  return (
    <AppBar position="fixed" sx={{ zIndex: 1200 }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuOpen}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          {getAppBarTitle()}
        </Typography>

        {/* Home button - show in game and victory screens */}
        {showHomeButton && (
          <IconButton
            onClick={onHomeButtonClick}
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
            onChange={handleLanguageChange}
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
  );
};

export default AppHeader;