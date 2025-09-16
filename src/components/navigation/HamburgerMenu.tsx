import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { MENU_ITEMS, type AppScreenType } from '../../constants/navigation';

interface HamburgerMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onMenuItemClick: (screen: AppScreenType) => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  anchorEl,
  open,
  onClose,
  onMenuItemClick,
}) => {
  const { t } = useLanguage();

  const handleMenuItemClick = (screen: AppScreenType) => {
    onClose();
    onMenuItemClick(screen);
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
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
  );
};

export default HamburgerMenu;