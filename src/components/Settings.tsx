import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Chip,
} from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';
import { useBallDesign } from '../contexts/BallDesignContext';
import { BallRenderer } from '../utils/BallRenderer';

const Settings: React.FC = () => {
  const { t } = useLanguage();
  const { currentDesign, availableDesigns, setCurrentDesign } = useBallDesign();

  // Ball preview component using unified BallRenderer
  // 統一BallRendererを使用するボールプレビューコンポーネント
  const BallPreview: React.FC<{ ballNumber: number; designId: string }> = ({ ballNumber, designId }) => {
    return (
      <Box sx={BallRenderer.getStyle(ballNumber, designId, 'medium')}>
        <span style={{ 
          position: 'relative', 
          zIndex: 3,
          fontFamily: '"Courier New", Courier, "Lucida Console", Monaco, monospace',
        }}>
          {ballNumber}
        </span>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            mb: 3,
            textAlign: 'center' 
          }}
        >
          {t('menu.settings')}
        </Typography>

        {/* Ball Design Settings Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography 
              variant="h6" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                mb: 2 
              }}
            >
              {t('settings.ballDesign')}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('settings.ballDesignDescription')}
            </Typography>

            {/* Ball Design Selection */}
            <Box sx={{ mb: 2 }}>
              
              {availableDesigns.map((design) => (
                <Box 
                  key={design.id} 
                  sx={{ 
                    mb: 3,
                    p: 2,
                    border: currentDesign.id === design.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    borderRadius: 2,
                    backgroundColor: currentDesign.id === design.id ? '#f5f7fa' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#1976d2',
                      backgroundColor: '#f8f9fb',
                    }
                  }}
                  onClick={() => setCurrentDesign(design.id)}
                >
                  {/* Radio button and product name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <input
                      type="radio"
                      name="ball-design"
                      value={design.id}
                      checked={currentDesign.id === design.id}
                      onChange={() => setCurrentDesign(design.id)}
                      style={{ marginRight: '8px' }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {t(`ballDesign.${design.id}`)}
                    </Typography>
                    {currentDesign.id === design.id && (
                      <Chip 
                        label={t('settings.selected')}
                        color="primary"
                        size="small"
                        sx={{ ml: 2 }}
                      />
                    )}
                  </Box>

                  {/* Ball preview row - all 15 balls in one line */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 0.5,
                    justifyContent: 'flex-start' 
                  }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((ballNumber) => (
                      <BallPreview 
                        key={ballNumber}
                        ballNumber={ballNumber}
                        designId={design.id}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

      </Box>
    </Container>
  );
};

export default Settings;