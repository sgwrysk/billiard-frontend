import React, { useState } from 'react';
import { Snackbar, Alert, type AlertColor } from '@mui/material';

export interface ErrorNotificationProps {
  message: string;
  severity?: AlertColor;
  duration?: number;
  open: boolean;
  onClose: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  message,
  severity = 'error',
  duration = 4000,
  open,
  onClose
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={onClose} 
        severity={severity} 
        sx={{ width: '100%' }}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

// Hook for managing notification state
export const useErrorNotification = () => {
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'error'
  });

  const showError = (message: string) => {
    setNotification({
      open: true,
      message,
      severity: 'error'
    });
  };

  const showWarning = (message: string) => {
    setNotification({
      open: true,
      message,
      severity: 'warning'
    });
  };

  const showSuccess = (message: string) => {
    setNotification({
      open: true,
      message,
      severity: 'success'
    });
  };

  const showInfo = (message: string) => {
    setNotification({
      open: true,
      message,
      severity: 'info'
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  return {
    notification,
    showError,
    showWarning,
    showSuccess,
    showInfo,
    hideNotification
  };
};

export default ErrorNotification;