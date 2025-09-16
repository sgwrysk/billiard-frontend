/**
 * Navigation constants and menu configuration
 */

import { Home as HomeIcon, People as PeopleIcon, Notifications as NotificationsIcon, QrCode2 as QrCodeIcon, Settings as SettingsIcon } from '@mui/icons-material';

export const AppScreen = {
  HOME: 'HOME',
  SETUP: 'SETUP',
  GAME: 'GAME',
  VICTORY: 'VICTORY',
  PLAYER_MANAGEMENT: 'PLAYER_MANAGEMENT',
  NOTIFICATIONS: 'NOTIFICATIONS',
  QR_SHARE: 'QR_SHARE',
  SETTINGS: 'SETTINGS',
} as const;

export type AppScreenType = typeof AppScreen[keyof typeof AppScreen];

// Menu configuration for extensible menu management
export const MENU_ITEMS = [
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
  { 
    screen: AppScreen.QR_SHARE, 
    icon: QrCodeIcon, 
    labelKey: 'menu.qrShare',
    requiresGameExitConfirmation: true 
  },
  { 
    screen: AppScreen.SETTINGS, 
    icon: SettingsIcon, 
    labelKey: 'menu.settings',
    requiresGameExitConfirmation: true 
  },
] as const;

export type MenuItemType = typeof MENU_ITEMS[number];