import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import type { BowlingFrame } from '../../types/index';
import { UIColors, BowlardColors, AppStyles } from '../../constants/colors';
import type { GameVictoryContentProps } from './common';

const BowlardVictoryContent: React.FC<GameVictoryContentProps> = ({ game }) => {
  const { t } = useLanguage();
  const player = game.players[0];



  const renderRollResult = (frame: BowlingFrame, rollIndex: number) => {
    const roll = frame?.rolls[rollIndex];
    if (roll === undefined) return '';
    
    if (frame.frameNumber === 10) {
      // 10th frame
      if (rollIndex === 0) {
        return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
      } else if (rollIndex === 1) {
        if (frame.rolls[0] === 10) {
          return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
        } else {
          return (frame.rolls[0] + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
        }
      } else {
        const firstRoll = frame.rolls[0];
        const secondRoll = frame.rolls[1];
        
        if (firstRoll === 10) {
          if (secondRoll === 10) {
            return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
          } else {
            return (secondRoll + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
          }
        } else {
          return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
        }
      }
    } else {
      // Frames 1-9
      if (rollIndex === 0) {
        return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
      } else {
        return (frame.rolls[0] + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
      }
    }
  };

  return (
    <Box>
      {/* Bowlard Score Details */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('setup.gameType.bowlard')} - {t('victory.finalScore')}: <span style={AppStyles.monoFont}>{player?.score || 0}</span>
          </Typography>
          
          {/* Bowling Score Sheet */}
          {/* Desktop Layout */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1.5fr',
              border: `2px solid ${UIColors.border.dark}`
            }}>
              {/* Frame headers */}
              {Array.from({ length: 10 }, (_, i) => (
                <Box 
                  key={`frame-${i}`}
                  sx={{ 
                    borderRight: i === 9 ? 'none' : `1px solid ${UIColors.border.dark}`,
                    borderBottom: `1px solid ${UIColors.border.dark}`,
                    padding: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    backgroundColor: BowlardColors.number.background
                  }}
                >
                  <span style={AppStyles.monoFont}>{i + 1}</span>
                </Box>
              ))}
              
              {/* Roll results */}
              {Array.from({ length: 10 }, (_, frameIndex) => {
                const frame = player?.bowlingFrames?.[frameIndex];
                
                return (
                  <Box 
                    key={`rolls-${frameIndex}`}
                    sx={{ 
                      borderRight: frameIndex === 9 ? 'none' : `1px solid ${UIColors.border.dark}`,
                      display: 'flex',
                      minHeight: '40px'
                    }}
                  >
                    {frameIndex === 9 ? (
                      // 10th frame (3 rolls)
                      <>
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${UIColors.border.dark}` }}>
                          {frame ? renderRollResult(frame, 0) : ''}
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${UIColors.border.dark}` }}>
                          {frame ? renderRollResult(frame, 1) : ''}
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {frame ? renderRollResult(frame, 2) : ''}
                        </Box>
                      </>
                    ) : (
                      // Frames 1-9 (2 rolls)
                      <>
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${UIColors.border.dark}` }}>
                          {frame ? renderRollResult(frame, 0) : ''}
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {frame ? renderRollResult(frame, 1) : ''}
                        </Box>
                      </>
                    )}
                  </Box>
                );
              })}
              
              {/* Cumulative scores */}
              {Array.from({ length: 10 }, (_, i) => {
                const frame = player?.bowlingFrames?.[i];
                return (
                  <Box 
                    key={`score-${i}`}
                    sx={{ 
                      borderRight: i === 9 ? 'none' : `1px solid ${UIColors.border.dark}`,
                      padding: '8px',
                      textAlign: 'center',
                      borderTop: `1px solid ${UIColors.border.dark}`,
                      fontWeight: 'bold',
                      minHeight: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={AppStyles.monoFont}>{frame?.isComplete && frame?.score !== undefined ? frame.score : ''}</span>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Mobile Layout (2 rows) */}
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            {/* Frames 1-5 */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                border: `2px solid ${UIColors.border.dark}`
              }}>
                {/* Frame headers 1-5 */}
                {Array.from({ length: 5 }, (_, i) => (
                  <Box 
                    key={`frame-${i}`}
                    sx={{ 
                      borderRight: i === 4 ? 'none' : `1px solid ${UIColors.border.dark}`,
                      borderBottom: `1px solid ${UIColors.border.dark}`,
                      padding: '8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      backgroundColor: BowlardColors.number.background
                    }}
                  >
                    {i + 1}
                  </Box>
                ))}
                
                {/* Roll results 1-5 */}
                {Array.from({ length: 5 }, (_, frameIndex) => {
                  const frame = player?.bowlingFrames?.[frameIndex];
                  
                  return (
                    <Box 
                      key={`rolls-${frameIndex}`}
                      sx={{ 
                        borderRight: frameIndex === 4 ? 'none' : `1px solid ${UIColors.border.dark}`,
                        display: 'flex',
                        minHeight: '40px'
                      }}
                    >
                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${UIColors.border.dark}` }}>
                        {frame ? renderRollResult(frame, 0) : ''}
                      </Box>
                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {frame ? renderRollResult(frame, 1) : ''}
                      </Box>
                    </Box>
                  );
                })}
                
                {/* Cumulative scores 1-5 */}
                {Array.from({ length: 5 }, (_, i) => {
                  const frame = player?.bowlingFrames?.[i];
                  return (
                    <Box 
                      key={`score-${i}`}
                      sx={{ 
                        borderRight: i === 4 ? 'none' : `1px solid ${UIColors.border.dark}`,
                        padding: '8px',
                        textAlign: 'center',
                        borderTop: `1px solid ${UIColors.border.dark}`,
                        fontWeight: 'bold',
                        minHeight: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span style={AppStyles.monoFont}>{frame?.isComplete && frame?.score !== undefined ? frame.score : ''}</span>
                    </Box>
                  );
                })}
              </Box>
            </Box>
            
            {/* Frames 6-10 */}
            <Box>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr 1.5fr',
                border: `2px solid ${UIColors.border.dark}`
              }}>
                {/* Frame headers 6-10 */}
                {Array.from({ length: 5 }, (_, i) => (
                  <Box 
                    key={`frame-${i + 5}`}
                    sx={{ 
                      borderRight: i === 4 ? 'none' : `1px solid ${UIColors.border.dark}`,
                      borderBottom: `1px solid ${UIColors.border.dark}`,
                      padding: '8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      backgroundColor: BowlardColors.number.background
                    }}
                  >
                    {i + 6}
                  </Box>
                ))}
                
                {/* Roll results 6-10 */}
                {Array.from({ length: 5 }, (_, i) => {
                  const frameIndex = i + 5;
                  const frame = player?.bowlingFrames?.[frameIndex];
                  
                  return (
                    <Box 
                      key={`rolls-${frameIndex}`}
                      sx={{ 
                        borderRight: i === 4 ? 'none' : `1px solid ${UIColors.border.dark}`,
                        display: 'flex',
                        minHeight: '40px'
                      }}
                    >
                      {frameIndex === 9 ? (
                        // 10th frame (3 rolls)
                        <>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${UIColors.border.dark}` }}>
                            {frame ? renderRollResult(frame, 0) : ''}
                          </Box>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${UIColors.border.dark}` }}>
                            {frame ? renderRollResult(frame, 1) : ''}
                          </Box>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {frame ? renderRollResult(frame, 2) : ''}
                          </Box>
                        </>
                      ) : (
                        // Frames 6-9 (2 rolls)
                        <>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${UIColors.border.dark}` }}>
                            {frame ? renderRollResult(frame, 0) : ''}
                          </Box>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {frame ? renderRollResult(frame, 1) : ''}
                          </Box>
                        </>
                      )}
                    </Box>
                  );
                })}
                
                {/* Cumulative scores 6-10 */}
                {Array.from({ length: 5 }, (_, i) => {
                  const frameIndex = i + 5;
                  const frame = player?.bowlingFrames?.[frameIndex];
                  return (
                    <Box 
                      key={`score-${frameIndex}`}
                      sx={{ 
                        borderRight: i === 4 ? 'none' : `1px solid ${UIColors.border.dark}`,
                        padding: '8px',
                        textAlign: 'center',
                        borderTop: `1px solid ${UIColors.border.dark}`,
                        fontWeight: 'bold',
                        minHeight: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span style={AppStyles.monoFont}>{frame?.isComplete && frame?.score !== undefined ? frame.score : ''}</span>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

    </Box>
  );
};

export default BowlardVictoryContent;