import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Snackbar,
  Alert,
  Grid,
  Divider,
} from '@mui/material';
import {
  QrCode2 as QrCodeIcon,
  ContentCopy as CopyIcon,
  Facebook as FacebookIcon,
  Share as LineIcon,
} from '@mui/icons-material';
import { SvgIcon } from '@mui/material';
import QRCode from 'qrcode';
import { useLanguage } from '../contexts/LanguageContext';

// Custom X (formerly Twitter) Icon
const XIcon: React.FC<{ fontSize?: 'inherit' | 'large' | 'medium' | 'small' }> = ({ fontSize = 'inherit' }) => (
  <SvgIcon fontSize={fontSize}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </SvgIcon>
);

const QRShare: React.FC = () => {
  const { t } = useLanguage();
  const [currentUrl, setCurrentUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  useEffect(() => {
    // Get current URL
    const url = window.location.href;
    setCurrentUrl(url);

    // Generate QR code
    const generateQR = async () => {
      try {
        const qrUrl = await QRCode.toDataURL(url, {
          width: 256,
          margin: 2,
          color: {
            dark: '#1976d2', // Primary color
            light: '#ffffff'
          }
        });
        setQrDataUrl(qrUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, []);

  // Copy URL to clipboard
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setShowCopySuccess(true);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setShowCopySuccess(true);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
    }
  };

  // Share via SNS
  const handleSNSShare = (platform: 'x' | 'facebook' | 'line') => {
    const shareText = t('qrShare.shareText');
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedText = encodeURIComponent(shareText);

    let shareUrl = '';

    switch (platform) {
      case 'x':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'line':
        shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleCloseSnackbar = () => {
    setShowCopySuccess(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        <QrCodeIcon sx={{ mr: 1, fontSize: 'inherit', verticalAlign: 'middle' }} />
        {t('qrShare.title')}
      </Typography>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            {t('qrShare.description')}
          </Typography>

          {/* QR Code Display */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="QR Code" 
                style={{ 
                  maxWidth: '256px', 
                  width: '100%', 
                  height: 'auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px'
                }} 
              />
            ) : (
              <Box 
                sx={{ 
                  width: 256, 
                  height: 256, 
                  mx: 'auto',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#f5f5f5'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Loading QR Code...
                </Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Current URL Display */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('qrShare.currentUrl')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                value={currentUrl}
                InputProps={{
                  readOnly: true,
                }}
                size="small"
                sx={{ 
                  '& .MuiInputBase-input': { 
                    fontSize: '0.875rem',
                    wordBreak: 'break-all'
                  } 
                }}
              />
              <Button
                variant="contained"
                startIcon={<CopyIcon />}
                onClick={handleCopyUrl}
                sx={{ minWidth: 'auto', flexShrink: 0 }}
              >
                {t('qrShare.copyUrl')}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* SNS Share Buttons */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('qrShare.shareVia')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<XIcon />}
                  onClick={() => handleSNSShare('x')}
                  sx={{ 
                    py: 1.5,
                    color: '#000000',
                    borderColor: '#000000',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.08)',
                      borderColor: '#000000'
                    }
                  }}
                >
                  {t('qrShare.shareTwitter')}
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FacebookIcon />}
                  onClick={() => handleSNSShare('facebook')}
                  sx={{ 
                    py: 1.5,
                    color: '#1877f2',
                    borderColor: '#1877f2',
                    '&:hover': {
                      backgroundColor: 'rgba(24, 119, 242, 0.08)',
                      borderColor: '#1877f2'
                    }
                  }}
                >
                  {t('qrShare.shareFacebook')}
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LineIcon />}
                  onClick={() => handleSNSShare('line')}
                  sx={{ 
                    py: 1.5,
                    color: '#00b900',
                    borderColor: '#00b900',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 185, 0, 0.08)',
                      borderColor: '#00b900'
                    }
                  }}
                >
                  {t('qrShare.shareLine')}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Success Snackbar */}
      <Snackbar
        open={showCopySuccess}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {t('qrShare.urlCopied')}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QRShare;