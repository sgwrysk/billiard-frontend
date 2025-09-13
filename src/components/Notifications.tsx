import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Paper,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NewReleases as FeatureIcon,
  BugReport as BugFixIcon,
  Schedule as UpcomingIcon,
  Upgrade as ImprovementIcon,
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import type { Notification, NotificationCategory, NotificationData } from '../types/index';
import notificationData from '../data/notifications.json';

const Notifications: React.FC = () => {
  const { t, language } = useLanguage();

  // Get category icon
  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'feature':
        return <FeatureIcon />;
      case 'bugfix':
        return <BugFixIcon />;
      case 'upcoming':
        return <UpcomingIcon />;
      case 'improvement':
        return <ImprovementIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  // Get category color
  const getCategoryColor = (category: NotificationCategory) => {
    switch (category) {
      case 'feature':
        return 'success';
      case 'bugfix':
        return 'warning';
      case 'upcoming':
        return 'info';
      case 'improvement':
        return 'primary';
      default:
        return 'default';
    }
  };

  // Sort notifications by date (newest first)
  const sortedNotifications = [...(notificationData as NotificationData).notifications].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <NotificationsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          {t('notifications.title')}
        </Typography>
      </Paper>

      {/* Notifications list */}
      {sortedNotifications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {t('notifications.noNotifications')}
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {sortedNotifications.map((notification: Notification) => (
            <Card 
              key={notification.id} 
              sx={{ 
                '&:hover': { 
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {/* Category icon */}
                  <Box 
                    sx={{ 
                      color: `${getCategoryColor(notification.category)}.main`,
                      mt: 0.5 
                    }}
                  >
                    {getCategoryIcon(notification.category)}
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {/* Date */}
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {notification.date}
                      </Typography>
                      
                      {/* Category chip */}
                      <Chip
                        label={t(`notifications.category.${notification.category}`)}
                        color={getCategoryColor(notification.category) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {/* Notification content */}
                    <Typography variant="body1">
                      {notification.content[language]}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default Notifications;