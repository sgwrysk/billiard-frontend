import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Grid,
} from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Game, BowlingFrame } from '../../types/index';
import { BowlardColors, AppColors, UIColors, AppStyles } from '../../constants/colors';

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
      // Frames 1-9
      if (rollIndex === 0) {
        return 10; // 1投目は最大10本
      } else {
        return 10 - frame.rolls[0]; // Second roll is remaining pins
      }
    } else {
      // 10th frame
      if (rollIndex === 0) {
        return 10;
      } else if (rollIndex === 1) {
        if (frame.rolls[0] === 10) {
          return 10; // If first roll is strike, second roll can also be 10
        } else {
          return 10 - frame.rolls[0];
        }
      } else {
        // 3rd roll
        const firstRoll = frame.rolls[0];
        const secondRoll = frame.rolls[1];
        
        if (firstRoll === 10) {
          // If first roll is a strike
          if (secondRoll === 10) {
            // If second roll is also strike, third roll can be 10
            return 10;
          } else {
            // If second roll is not strike, remaining pins
            return 10 - secondRoll;
          }
        } else {
          // If first roll is not a strike
          if (firstRoll + secondRoll === 10) {
            // スペアの場合、3投目は10本可能
            return 10;
          } else {
            // Third roll should not exist in this case, return -1 to hide button
            return -1;
          }
        }
      }
    }
  };

  // 投球可能かどうかを判定する関数
  const canRoll = () => {
    // Cannot roll if game is completed
    if (frames[9]?.isComplete) {
      return false;
    }
    
    return getMaxPins() >= 0;
  };

  // Function to get pin input button color
  const getPinButtonColor = (pins: number) => {
    const buttonText = getPinButtonText(pins);
    
    switch (buttonText) {
      case 'G':
      case '-':
        return BowlardColors.gutter.background; // Express disappointment
      case '/':
        return BowlardColors.spare.background; // Express modest success
      case 'X':
        return BowlardColors.strike.background; // Express brilliant success
      default:
        return BowlardColors.number.background; // Neutral number button
    }
  };

  // Function to get pin input button text color
  const getPinButtonTextColor = (pins: number) => {
    const buttonText = getPinButtonText(pins);
    
    switch (buttonText) {
      case 'G':
      case '-':
        return BowlardColors.gutter.text; // Express disappointment
      case '/':
        return BowlardColors.spare.text; // Express modest success
      case 'X':
        return BowlardColors.strike.text; // Express brilliant success
      default:
        return BowlardColors.number.text; // Neutral number button
    }
  };

  // Function to get pin input button display text
  const getPinButtonText = (pins: number) => {
    const frameInfo = getCurrentFrameInfo();
    if (!frameInfo) return pins.toString();
    
    const { frameIndex, rollIndex, frame } = frameInfo;
    
    if (rollIndex === 0) {
      // 1投目
      if (pins === 0) return 'G'; // Gutter
      if (pins === 10) return 'X'; // ストライク
      return pins.toString();
    } else {
      // 2投目以降
      if (frameIndex < 9) {
        // Frames 1-9
        if (pins === 0) return '-'; // ミス
        if (frame.rolls[0] + pins === 10) return '/'; // スペア
        return pins.toString();
      } else {
        // 10th frame
        if (rollIndex === 1) {
          if (frame.rolls[0] === 10) {
            // If first roll is a strike, second roll is treated as new frame
            if (pins === 0) return 'G'; // Gutter
            if (pins === 10) return 'X'; // Strike
            return pins.toString();
          } else {
            // If first roll is not a strike
            if (pins === 0) return '-'; // Miss
            if (frame.rolls[0] + pins === 10) return '/';
            return pins.toString();
          }
        } else {
          // 3rd roll
          const firstRoll = frame.rolls[0];
          const secondRoll = frame.rolls[1];
          
          if (firstRoll === 10) {
            // If first roll is a strike
            if (secondRoll === 10) {
              // If second roll is also a strike, third roll is treated as new frame
              if (pins === 0) return 'G'; // Gutter
              if (pins === 10) return 'X'; // Strike
              return pins.toString();
            } else {
              // If second roll is not a strike
              if (pins === 0) return '-'; // Miss
              if (secondRoll + pins === 10) return '/';
              return pins.toString();
            }
          } else {
            // If first roll is not a strike (third roll only exists for spares)
            if (pins === 0) return 'G'; // Gutter
            if (pins === 10) return 'X'; // Strike
            return pins.toString();
          }
        }
      }
    }
  };
  
  const renderRollResult = (frame: BowlingFrame, rollIndex: number) => {
    const roll = frame.rolls[rollIndex];
    if (roll === undefined) return '';
    
    if (frame.frameNumber === 10) {
      // 10th frame
      if (rollIndex === 0) {
        // 1st roll: 0 is gutter (G)
        return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
      } else if (rollIndex === 1) {
        if (frame.rolls[0] === 10) {
          // If first roll is a strike、2投目は新しいフレーム扱い
          return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
        } else {
          // If first roll is not a strike、2投目は0をミス（-）で表示
          return (frame.rolls[0] + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
        }
      } else {
        // 3rd roll
        const firstRoll = frame.rolls[0];
        const secondRoll = frame.rolls[1];
        
        if (firstRoll === 10) {
          // If first roll is a strike
          if (secondRoll === 10) {
            // 2投目もストライクの場合、3投目は新しいフレーム扱い
            return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
          } else {
            // If 2nd roll is not a strike, 3rd roll shows 0 as miss (-)
            return (secondRoll + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
          }
        } else {
          // If first roll is not a strike (3rd roll only exists for spares)
          // 3rd rollは新しいフレーム扱い
          return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
        }
      }
    } else {
      // Frames 1-9
      if (rollIndex === 0) {
        // 1st roll: 0 is gutter (G)
        return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
      } else {
        // 2nd roll: 0 is miss (-)
        return (frame.rolls[0] + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
      }
    }
  };

  // Function to determine if score is finalized
  const isScoreFinalized = (frameIndex: number, frames: BowlingFrame[]): boolean => {
    const frame = frames[frameIndex];
    if (!frame || !frame.isComplete || frame.score === undefined) {
      return false;
    }

    // 10th frame is always finalized
    if (frameIndex === 9) {
      return true;
    }

    // For strikes, next 2 rolls are needed
    if (frame.isStrike) {
      if (frameIndex === 8) {
        // If 9th frame is a strike, 2 rolls in 10th frame are needed
        const frame10 = frames[9];
        return frame10 && frame10.rolls.length >= 2;
      } else {
        // For strikes in frames 1-8
        const nextFrame = frames[frameIndex + 1];
        if (!nextFrame) return false;
        
        if (nextFrame.isStrike) {
          // If next frame is also a strike, 1st roll of frame after that is needed
          if (frameIndex + 1 === 8) {
            // If next is 9th frame, 1st roll of 10th frame is needed
            const frame10 = frames[9];
            return frame10 && frame10.rolls.length >= 1;
          } else {
            // In other cases, 1st roll of next-next frame is needed
            const frameAfterNext = frames[frameIndex + 2];
            return frameAfterNext && frameAfterNext.rolls.length >= 1;
          }
        } else {
          // If next frame is not a strike, 2 rolls in next frame are needed
          return nextFrame.rolls.length >= 2;
        }
      }
    }

    // For spares, next 1 roll is needed
    if (frame.isSpare) {
      if (frameIndex === 8) {
        // If 9th frame is a spare, 1st roll of 10th frame is needed
        const frame10 = frames[9];
        return frame10 && frame10.rolls.length >= 1;
      } else {
        // For spares in frames 1-8, 1st roll of next frame is needed
        const nextFrame = frames[frameIndex + 1];
        return nextFrame && nextFrame.rolls.length >= 1;
      }
    }

    // Regular frames (neither strike nor spare) are immediately finalized
    return true;
  };

  return (
    <Box>
      {/* Bowling Score Sheet */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          
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
                      borderRight: frameIndex === 9 ? 'none' : `1px solid ${UIColors.border.dark}`,
                      display: 'flex',
                      minHeight: '40px'
                    }}
                  >
                    {frameIndex === 9 ? (
                      // 10th frame (3投分)
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
                      // Frames 1-9目 (2投分)
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
                const frame = frames[i];
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
                    {isScoreFinalized(i, frames) ? frame.score : ''}
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
                  const frame = frames[frameIndex];
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
                  const frame = frames[i];
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
                      {isScoreFinalized(i, frames) ? frame.score : ''}
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
                  const frame = frames[frameIndex];
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
                        // 10th frame (3投分)
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
                        // 6-9フレーム目 (2投分)
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
                  const frame = frames[frameIndex];
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
                      {isScoreFinalized(frameIndex, frames) ? frame.score : ''}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Pin Input Buttons */}
      {canRoll() && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={1}>
              {Array.from({ length: getMaxPins() + 1 }, (_, pins) => (
                <Grid item key={pins}>
                  <Button
                    onClick={() => onAddPins(pins)}
                    sx={{
                      width: { xs: 50, sm: 60 },
                      height: { xs: 50, sm: 60 },
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      backgroundColor: getPinButtonColor(pins),
                      color: getPinButtonTextColor(pins),
                      fontWeight: 'bold',
                      border: `1px solid ${BowlardColors.number.background}`,
                      borderRadius: 1,
                      boxShadow: `0 2px 4px ${AppColors.effects.shadow.light}`,
                      '&:hover': {
                        backgroundColor: getPinButtonColor(pins),
                        color: getPinButtonTextColor(pins),
                        filter: 'brightness(1.05)',
                        boxShadow: `0 4px 8px ${AppColors.effects.shadow.medium}`,
                      },
                      '&:active': {
                        backgroundColor: getPinButtonColor(pins),
                        color: getPinButtonTextColor(pins),
                        filter: 'brightness(0.95)',
                        boxShadow: `0 1px 2px ${AppColors.effects.shadow.light}`,
                      },
                    }}
                  >
                    <span style={AppStyles.monoFont}>{getPinButtonText(pins)}</span>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

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

