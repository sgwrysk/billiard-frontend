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
      // 1-9フレーム
      if (rollIndex === 0) {
        return 10; // 1投目は最大10本
      } else {
        return 10 - frame.rolls[0]; // Second roll is remaining pins
      }
    } else {
      // 10フレーム目
      if (rollIndex === 0) {
        return 10;
      } else if (rollIndex === 1) {
        if (frame.rolls[0] === 10) {
          return 10; // If first roll is strike, second roll can also be 10
        } else {
          return 10 - frame.rolls[0];
        }
      } else {
        // 3投目
        const firstRoll = frame.rolls[0];
        const secondRoll = frame.rolls[1];
        
        if (firstRoll === 10) {
          // 1投目がストライクの場合
          if (secondRoll === 10) {
            // If second roll is also strike, third roll can be 10
            return 10;
          } else {
            // If second roll is not strike, remaining pins
            return 10 - secondRoll;
          }
        } else {
          // 1投目がストライクでない場合
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
    // ゲームが完了している場合は投球不可
    if (frames[9]?.isComplete) {
      return false;
    }
    
    return getMaxPins() >= 0;
  };

  // ピン入力ボタンの色を取得する関数
  const getPinButtonColor = (pins: number) => {
    const buttonText = getPinButtonText(pins);
    
    switch (buttonText) {
      case 'G':
      case '-':
        return BowlardColors.gutter.background; // 残念感を表現
      case '/':
        return BowlardColors.spare.background; // 穏やかな成功を表現
      case 'X':
        return BowlardColors.strike.background; // 華やかな成功を表現
      default:
        return BowlardColors.number.background; // ニュートラルな数字ボタン
    }
  };

  // ピン入力ボタンの文字色を取得する関数
  const getPinButtonTextColor = (pins: number) => {
    const buttonText = getPinButtonText(pins);
    
    switch (buttonText) {
      case 'G':
      case '-':
        return BowlardColors.gutter.text; // 残念感を表現
      case '/':
        return BowlardColors.spare.text; // 穏やかな成功を表現
      case 'X':
        return BowlardColors.strike.text; // 華やかな成功を表現
      default:
        return BowlardColors.number.text; // ニュートラルな数字ボタン
    }
  };

  // ピン入力ボタンの表示テキストを取得する関数
  const getPinButtonText = (pins: number) => {
    const frameInfo = getCurrentFrameInfo();
    if (!frameInfo) return pins.toString();
    
    const { frameIndex, rollIndex, frame } = frameInfo;
    
    if (rollIndex === 0) {
      // 1投目
      if (pins === 0) return 'G'; // ガーター
      if (pins === 10) return 'X'; // ストライク
      return pins.toString();
    } else {
      // 2投目以降
      if (frameIndex < 9) {
        // 1-9フレーム
        if (pins === 0) return '-'; // ミス
        if (frame.rolls[0] + pins === 10) return '/'; // スペア
        return pins.toString();
      } else {
        // 10フレーム目
        if (rollIndex === 1) {
          if (frame.rolls[0] === 10) {
            // 1投目がストライクの場合、2投目は新しいフレーム扱い
            if (pins === 0) return 'G'; // ガーター
            if (pins === 10) return 'X'; // ストライク
            return pins.toString();
          } else {
            // 1投目がストライクでない場合
            if (pins === 0) return '-'; // ミス
            if (frame.rolls[0] + pins === 10) return '/';
            return pins.toString();
          }
        } else {
          // 3投目
          const firstRoll = frame.rolls[0];
          const secondRoll = frame.rolls[1];
          
          if (firstRoll === 10) {
            // 1投目がストライクの場合
            if (secondRoll === 10) {
              // 2投目もストライクの場合、3投目は新しいフレーム扱い
              if (pins === 0) return 'G'; // ガーター
              if (pins === 10) return 'X'; // ストライク
              return pins.toString();
            } else {
              // 2投目がストライクでない場合
              if (pins === 0) return '-'; // ミス
              if (secondRoll + pins === 10) return '/';
              return pins.toString();
            }
          } else {
            // 1投目がストライクでない場合（スペアの場合のみ3投目がある）
            if (pins === 0) return 'G'; // ガーター
            if (pins === 10) return 'X'; // ストライク
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
      // 10フレーム目
      if (rollIndex === 0) {
        // 1投目: 0はガーター（G）
        return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
      } else if (rollIndex === 1) {
        if (frame.rolls[0] === 10) {
          // 1投目がストライクの場合、2投目は新しいフレーム扱い
          return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
        } else {
          // 1投目がストライクでない場合、2投目は0をミス（-）で表示
          return (frame.rolls[0] + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
        }
      } else {
        // 3投目
        const firstRoll = frame.rolls[0];
        const secondRoll = frame.rolls[1];
        
        if (firstRoll === 10) {
          // 1投目がストライクの場合
          if (secondRoll === 10) {
            // 2投目もストライクの場合、3投目は新しいフレーム扱い
            return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
          } else {
            // 2投目がストライクでない場合、3投目は0をミス（-）で表示
            return (secondRoll + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
          }
        } else {
          // 1投目がストライクでない場合（スペアの場合のみ3投目がある）
          // 3投目は新しいフレーム扱い
          return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
        }
      }
    } else {
      // 1-9フレーム
      if (rollIndex === 0) {
        // 1投目: 0はガーター（G）
        return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
      } else {
        // 2投目: 0はミス（-）
        return (frame.rolls[0] + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
      }
    }
  };

  // スコアが確定しているかどうかを判定する関数
  const isScoreFinalized = (frameIndex: number, frames: BowlingFrame[]): boolean => {
    const frame = frames[frameIndex];
    if (!frame || !frame.isComplete || frame.score === undefined) {
      return false;
    }

    // 10フレーム目は常に確定
    if (frameIndex === 9) {
      return true;
    }

    // ストライクの場合、次の2投が必要
    if (frame.isStrike) {
      if (frameIndex === 8) {
        // 9フレーム目がストライクの場合、10フレーム目の2投が必要
        const frame10 = frames[9];
        return frame10 && frame10.rolls.length >= 2;
      } else {
        // 1-8フレーム目のストライクの場合
        const nextFrame = frames[frameIndex + 1];
        if (!nextFrame) return false;
        
        if (nextFrame.isStrike) {
          // 次のフレームもストライクの場合、その次のフレームの1投目が必要
          if (frameIndex + 1 === 8) {
            // 次が9フレーム目の場合、10フレーム目の1投目が必要
            const frame10 = frames[9];
            return frame10 && frame10.rolls.length >= 1;
          } else {
            // その他の場合、その次のフレームの1投目が必要
            const frameAfterNext = frames[frameIndex + 2];
            return frameAfterNext && frameAfterNext.rolls.length >= 1;
          }
        } else {
          // 次のフレームがストライクでない場合、次のフレームの2投が必要
          return nextFrame.rolls.length >= 2;
        }
      }
    }

    // スペアの場合、次の1投が必要
    if (frame.isSpare) {
      if (frameIndex === 8) {
        // 9フレーム目がスペアの場合、10フレーム目の1投目が必要
        const frame10 = frames[9];
        return frame10 && frame10.rolls.length >= 1;
      } else {
        // 1-8フレーム目のスペアの場合、次のフレームの1投目が必要
        const nextFrame = frames[frameIndex + 1];
        return nextFrame && nextFrame.rolls.length >= 1;
      }
    }

    // 通常のフレーム（ストライクでもスペアでもない）は即座に確定
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
                      // 10フレーム目 (3投分)
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
                      // 1-9フレーム目 (2投分)
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
                        // 10フレーム目 (3投分)
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

