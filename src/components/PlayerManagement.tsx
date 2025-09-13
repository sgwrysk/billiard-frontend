import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import ErrorNotification, { useErrorNotification } from './common/ErrorNotification';
import {
  getAllPlayers,
  updatePlayer,
  hidePlayer,
  showPlayer,
  getDefaultPlayerSettings,
  setDefaultPlayer,
} from '../utils/playerStorage';
import type { Player } from '../types/player';

const PlayerManagement: React.FC = () => {
  const { t } = useLanguage();
  const { notification, showError, showSuccess, hideNotification } = useErrorNotification();
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    player: Player | null;
    name: string;
  }>({
    open: false,
    player: null,
    name: ''
  });
  const [defaultSettings, setDefaultSettings] = useState<{
    player1DefaultId: number | null;
    player2DefaultId: number | null;
  }>({
    player1DefaultId: null,
    player2DefaultId: null
  });
  const [showHidden, setShowHidden] = useState(false);

  const loadData = useCallback(() => {
    try {
      const allPlayers = getAllPlayers();
      setPlayers(allPlayers);
      
      const defaults = getDefaultPlayerSettings();
      setDefaultSettings(defaults);
    } catch (error: unknown) {
      console.error('Failed to load player data:', error);
      showError(t('error.playerDataLoad') || 'Failed to load player data');
    }
  }, [showError, t]);

  // Load players and default settings
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEditPlayer = (player: Player) => {
    setEditDialog({
      open: true,
      player,
      name: player.name
    });
  };

  const handleEditSave = async () => {
    if (!editDialog.player) return;

    try {
      await updatePlayer(editDialog.player.id, { name: editDialog.name.trim() });
      showSuccess(t('success.playerUpdated') || 'Player updated successfully');
      setEditDialog({ open: false, player: null, name: '' });
      loadData();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update player');
    }
  };

  const handleEditCancel = () => {
    setEditDialog({ open: false, player: null, name: '' });
  };

  const handleToggleVisibility = async (player: Player) => {
    try {
      if (player.isVisible) {
        await hidePlayer(player.id);
        showSuccess(t('success.playerHidden') || 'Player hidden successfully');
      } else {
        await showPlayer(player.id);
        showSuccess(t('success.playerShown') || 'Player shown successfully');
      }
      loadData();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update player visibility');
    }
  };

  const handleDefaultPlayerChange = async (position: 1 | 2, playerId: number | null) => {
    try {
      await setDefaultPlayer(position, playerId);
      showSuccess(t('success.defaultPlayerSet') || 'Default player set successfully');
      loadData();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to set default player');
    }
  };

  const getVisiblePlayers = () => players.filter(p => p.isVisible);
  const getDisplayPlayers = () => showHidden ? players : getVisiblePlayers();


  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('playerManagement.title') || 'Player Management'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('playerManagement.description') || 'Manage players and default settings'}
          </Typography>
        </CardContent>
      </Card>

      {/* Default Player Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SettingsIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              {t('playerManagement.defaultSettings') || 'Default Player Settings'}
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('playerManagement.player1Default') || 'Player 1 Default'}</InputLabel>
                <Select
                  value={defaultSettings.player1DefaultId || ''}
                  label={t('playerManagement.player1Default') || 'Player 1 Default'}
                  onChange={(e) => handleDefaultPlayerChange(1, e.target.value ? Number(e.target.value) : null)}
                >
                  <MenuItem value="">
                    <em>{t('playerManagement.noDefault') || 'None'}</em>
                  </MenuItem>
                  {getVisiblePlayers().map((player) => (
                    <MenuItem key={player.id} value={player.id}>
                      {player.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('playerManagement.player2Default') || 'Player 2 Default'}</InputLabel>
                <Select
                  value={defaultSettings.player2DefaultId || ''}
                  label={t('playerManagement.player2Default') || 'Player 2 Default'}
                  onChange={(e) => handleDefaultPlayerChange(2, e.target.value ? Number(e.target.value) : null)}
                >
                  <MenuItem value="">
                    <em>{t('playerManagement.noDefault') || 'None'}</em>
                  </MenuItem>
                  {getVisiblePlayers().map((player) => (
                    <MenuItem key={player.id} value={player.id}>
                      {player.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Player List */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {t('playerManagement.playerList') || 'Player List'} ({getDisplayPlayers().length})
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={showHidden}
                  onChange={(e) => setShowHidden(e.target.checked)}
                  size="small"
                />
              }
              label={t('playerManagement.showHidden') || 'Show Hidden'}
            />
          </Box>

          {getDisplayPlayers().length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              {t('playerManagement.noPlayers') || 'No players found'}
            </Typography>
          ) : (
            <List>
              {getDisplayPlayers()
                .sort((a, b) => a.id - b.id)
                .map((player) => (
                  <ListItem
                    key={player.id}
                    sx={{
                      opacity: player.isVisible ? 1 : 0.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" component="span">
                            {player.name}
                          </Typography>
                          {defaultSettings.player1DefaultId === player.id && (
                            <Chip
                              label={t('playerManagement.player1Default') || 'P1 Default'}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          {defaultSettings.player2DefaultId === player.id && (
                            <Chip
                              label={t('playerManagement.player2Default') || 'P2 Default'}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          )}
                          {!player.isVisible && (
                            <Chip
                              label={t('playerManagement.hidden') || 'Hidden'}
                              size="small"
                              color="default"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          ID: {player.id} | {t('playerManagement.created') || 'Created'}: {new Date(player.createdAt).toLocaleDateString()}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => handleEditPlayer(player)}
                        size="small"
                        title={t('playerManagement.editName') || 'Edit Name'}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleToggleVisibility(player)}
                        size="small"
                        title={
                          player.isVisible
                            ? (t('playerManagement.hide') || 'Hide')
                            : (t('playerManagement.show') || 'Show')
                        }
                      >
                        {player.isVisible ? (
                          <VisibilityIcon fontSize="small" />
                        ) : (
                          <VisibilityOffIcon fontSize="small" />
                        )}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Edit Player Dialog */}
      <Dialog open={editDialog.open} onClose={handleEditCancel} maxWidth="sm" fullWidth>
        <DialogTitle>{t('playerManagement.editPlayer') || 'Edit Player'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={t('playerManagement.playerName') || 'Player Name'}
            value={editDialog.name}
            onChange={(e) => setEditDialog(prev => ({ ...prev, name: e.target.value }))}
            margin="normal"
            inputProps={{ maxLength: 20 }}
            helperText={`${editDialog.name.length}/20`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>
            {t('common.cancel') || 'Cancel'}
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            disabled={!editDialog.name.trim() || editDialog.name.trim() === editDialog.player?.name}
          >
            {t('common.save') || 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Notification */}
      <ErrorNotification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={hideNotification}
      />
    </Box>
  );
};

export default PlayerManagement;