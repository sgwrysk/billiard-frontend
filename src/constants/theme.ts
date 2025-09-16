/**
 * Material-UI theme configuration
 */

import { createTheme } from '@mui/material/styles';
import { AppColors, UIColors } from './colors';

// Create Material-UI theme - Deep Blue + Outfit
export const theme = createTheme({
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