import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Game, BowlingFrame } from '../../types/index';

interface BowlardBoardProps {
  game: Game;
  onAddPins: (pins: number) => void;
  onUndoBowlingRoll: () => void;
  onEndGame: (winnerId?: string) => void;
}

export const BowlardBoard: React.FC<BowlardBoardProps> = ({
  game,
  onAddPins,
  onUndoBowlingRoll,
  onEndGame,
}) => {
  const { t } = useLanguage();
  const currentPlayer = game.players[0];
  const frames = currentPlayer.bowlingFrames || [];
  
  const getCurrentFrameInfo = () => {
    const currentFrame = frames.find(frame => !frame.isComplete);
    if (!currentFrame) return null;
    
    const frameIndex = currentFrame.frameNumber - 1;
    const rollIndex = currentFrame.rolls.length;
    
    return { frameIndex, rollIndex, frame: currentFrame };
  };
  
  const getMaxPins = () => {
    const frameInfo = getCurrentFrameInfo();
    if (!frameInfo) return 0;
    
    const { frameIndex, rollIndex, frame } = frameInfo;
    
    if (frameIndex < 9) {
      // 1-9フレーム
      if (rollIndex === 0) {
        return 10; // 1投目は最大10本
      } else {
        return 10 - frame.rolls[0]; // 2投目は残りピン数
      }
    } else {
      // 10フレーム目
      if (rollIndex === 0) {
        return 10;
      } else if (rollIndex === 1) {
        if (frame.rolls[0] === 10) {
          return 10; // 1投目がストライクなら2投目も10本
        } else {
          return 10 - frame.rolls[0];
        }
      } else {
        // 3投目
        const firstRoll = frame.rolls[0];
        const secondRoll = frame.rolls[1];
        if (firstRoll === 10 || secondRoll === 10) {
          return 10;
        } else {
          return 10 - secondRoll;
        }
      }
    }
  };
  
  const renderRollResult = (frame: BowlingFrame, rollIndex: number) => {
    const roll = frame.rolls[rollIndex];
    if (roll === undefined) return '';
    
    if (frame.frameNumber === 10) {
      // 10フレーム目
      if (rollIndex === 0) {
        return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
      } else if (rollIndex === 1) {
        if (frame.rolls[0] === 10) {
          return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
        } else {
          return (frame.rolls[0] + roll) === 10 ? '/' : roll === 0 ? 'G' : roll.toString();
        }
      } else {
        // 3投目
        const prevRoll = frame.rolls[1];
        if (prevRoll === 10) {
          return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
        } else {
          return (prevRoll + roll) === 10 ? '/' : roll === 0 ? 'G' : roll.toString();
        }
      }
    } else {
      // 1-9フレーム
      if (rollIndex === 0) {
        return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
      } else {
        return (frame.rolls[0] + roll) === 10 ? '/' : roll === 0 ? 'G' : roll.toString();
      }
    }
  };

  return (
    <Box>
      {/* Bowling Score Sheet */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('bowlard.scoreSheet')}
          </Typography>
          
          {/* Desktop Layout */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1.5fr',
              border: '2px solid #333'
            }}>
              {/* Frame headers */}
              {Array.from({ length: 10 }, (_, i) => (
                <Box 
                  key={`frame-${i}`}
                  sx={{ 
                    borderRight: i === 9 ? 'none' : '1px solid #333',
                    padding: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5'
                  }}
                >
                  {i + 1}
                </Box>
              ))}
              
              {/* Roll results */}
              {Array.from({ length: 10 }, (_, frameIndex) => {
                const frame = frames[frameIndex];
                return (
                  <Box 
                    key={`rolls-${frameIndex}`}
                    sx={{ 
                      borderRight: frameIndex === 9 ? 'none' : '1px solid #333',
                      display: 'flex',
                      minHeight: '40px'
                    }}
                  >
                    {frameIndex === 9 ? (
                      // 10フレーム目 (3投分)
                      <>
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #333' }}>
                          {frame ? renderRollResult(frame, 0) : ''}
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #333' }}>
                          {frame ? renderRollResult(frame, 1) : ''}
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {frame ? renderRollResult(frame, 2) : ''}
                        </Box>
                      </>
                    ) : (
                      // 1-9フレーム目 (2投分)
                      <>
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #333' }}>
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
                const frame = frames[i];
                return (
                  <Box 
                    key={`score-${i}`}
                    sx={{ 
                      borderRight: i === 9 ? 'none' : '1px solid #333',
                      padding: '8px',
                      textAlign: 'center',
                      borderTop: '1px solid #333',
                      fontWeight: 'bold',
                      minHeight: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {frame?.isComplete && frame?.score !== undefined ? frame.score : ''}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Mobile Layout (2 rows) */}
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            {/* 1-5 frames */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                border: '2px solid #333'
              }}>
                {/* Frame headers 1-5 */}
                {Array.from({ length: 5 }, (_, i) => (
                  <Box 
                    key={`frame-${i}`}
                    sx={{ 
                      borderRight: i === 4 ? 'none' : '1px solid #333',
                      padding: '8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      backgroundColor: '#f5f5f5'
                    }}
                  >
                    {i + 1}
                  </Box>
                ))}
                
                {/* Roll results 1-5 */}
                {Array.from({ length: 5 }, (_, frameIndex) => {
                  const frame = frames[frameIndex];
                  return (
                    <Box 
                      key={`rolls-${frameIndex}`}
                      sx={{ 
                        borderRight: frameIndex === 4 ? 'none' : '1px solid #333',
                        display: 'flex',
                        minHeight: '40px'
                      }}
                    >
                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #333' }}>
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
                  const frame = frames[i];
                  return (
                    <Box 
                      key={`score-${i}`}
                      sx={{ 
                        borderRight: i === 4 ? 'none' : '1px solid #333',
                        padding: '8px',
                        textAlign: 'center',
                        borderTop: '1px solid #333',
                        fontWeight: 'bold',
                        minHeight: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {frame?.isComplete && frame?.score !== undefined ? frame.score : ''}
                    </Box>
                  );
                })}
              </Box>
            </Box>
            
            {/* 6-10 frames */}
            <Box>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr 1.5fr',
                border: '2px solid #333'
              }}>
                {/* Frame headers 6-10 */}
                {Array.from({ length: 5 }, (_, i) => (
                  <Box 
                    key={`frame-${i + 5}`}
                    sx={{ 
                      borderRight: i === 4 ? 'none' : '1px solid #333',
                      padding: '8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      backgroundColor: '#f5f5f5'
                    }}
                  >
                    {i + 6}
                  </Box>
                ))}
                
                {/* Roll results 6-10 */}
                {Array.from({ length: 5 }, (_, i) => {
                  const frameIndex = i + 5;
                  const frame = frames[frameIndex];
                  return (
                    <Box 
                      key={`rolls-${frameIndex}`}
                      sx={{ 
                        borderRight: i === 4 ? 'none' : '1px solid #333',
                        display: 'flex',
                        minHeight: '40px'
                      }}
                    >
                      {frameIndex === 9 ? (
                        // 10フレーム目 (3投分)
                        <>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #333' }}>
                            {frame ? renderRollResult(frame, 0) : ''}
                          </Box>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #333' }}>
                            {frame ? renderRollResult(frame, 1) : ''}
                          </Box>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {frame ? renderRollResult(frame, 2) : ''}
                          </Box>
                        </>
                      ) : (
                        // 6-9フレーム目 (2投分)
                        <>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #333' }}>
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
                  const frame = frames[frameIndex];
                  return (
                    <Box 
                      key={`score-${frameIndex}`}
                      sx={{ 
                        borderRight: i === 4 ? 'none' : '1px solid #333',
                        padding: '8px',
                        textAlign: 'center',
                        borderTop: '1px solid #333',
                        fontWeight: 'bold',
                        minHeight: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {frame?.isComplete && frame?.score !== undefined ? frame.score : ''}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Pin Input Buttons */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('bowlard.enterPins')}
          </Typography>
          <Grid container spacing={1}>
            {Array.from({ length: getMaxPins() + 1 }, (_, pins) => (
              <Grid item key={pins}>
                <Button
                  variant="contained"
                  onClick={() => onAddPins(pins)}
                  sx={{
                    width: { xs: 50, sm: 60 },
                    height: { xs: 50, sm: 60 },
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                  }}
                >
                  {pins}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Grid container spacing={2}>
        {(() => {
          const gameComplete = frames[9]?.isComplete || false;
          const hasRolls = frames.some(frame => frame.rolls.length > 0);
          
          return (
            <>
              <Grid item xs={gameComplete ? 6 : 12}>
                <Button 
                  variant="outlined"
                  fullWidth
                  onClick={onUndoBowlingRoll}
                  disabled={!hasRolls}
                >
                  {t('game.undo')}
                </Button>
              </Grid>
              {gameComplete && (
                <Grid item xs={6}>
                  <Button 
                    variant="contained"
                    fullWidth
                    onClick={() => onEndGame(currentPlayer.id)}
                  >
                    {t('game.complete')}
                  </Button>
                </Grid>
              )}
            </>
          );
        })()}
      </Grid>
    </Box>
  );
};
