import type { BowlingFrame } from '../types/index';

export const initializeBowlingFrames = (): BowlingFrame[] => {
  return Array.from({ length: 10 }, (_, index) => ({
    frameNumber: index + 1,
    rolls: [],
    score: undefined,
    isStrike: false,
    isSpare: false,
    isComplete: false,
  }));
};

export const calculateBowlingScores = (frames: BowlingFrame[]): BowlingFrame[] => {
  const calculatedFrames = [...frames];
  
  for (let i = 0; i < 10; i++) {
    const frame = calculatedFrames[i];
    
    // Frame 10 special calculation
    if (i === 9) {
      // For frame 10, just sum all rolls (no bonus calculation needed)
      const frameScore = frame.rolls.reduce((sum, roll) => sum + roll, 0);
      const previousScore = i > 0 ? (calculatedFrames[i - 1].score || 0) : 0;
      calculatedFrames[i] = {
        ...frame,
        score: previousScore + frameScore,
      };
    } else {
      // Frames 1-9
      let frameScore = frame.rolls.reduce((sum, roll) => sum + roll, 0);
      
      // Strike bonus (frames 1-9)
      if (frame.isStrike) {
        // Add next two rolls
        if (i + 1 === 9) {
          // Next frame is frame 10
          const frame10 = calculatedFrames[9];
          if (frame10.rolls.length >= 1) {
            frameScore += frame10.rolls[0];
          }
          if (frame10.rolls.length >= 2) {
            frameScore += frame10.rolls[1];
          }
        } else if (i + 1 < 9) {
          // Next frame is frames 1-8
          const nextFrame = calculatedFrames[i + 1];
          if (nextFrame.rolls.length >= 1) {
            frameScore += nextFrame.rolls[0];
          }
          if (nextFrame.rolls.length >= 2) {
            frameScore += nextFrame.rolls[1];
          } else if (nextFrame.isStrike && i + 2 < 10) {
            // Next frame is also strike
            if (i + 2 === 9) {
              // Frame after next is frame 10
              const frame10 = calculatedFrames[9];
              if (frame10.rolls.length >= 1) {
                frameScore += frame10.rolls[0];
              }
            } else {
              // Frame after next is frames 1-8
              const frameAfterNext = calculatedFrames[i + 2];
              if (frameAfterNext.rolls.length >= 1) {
                frameScore += frameAfterNext.rolls[0];
              }
            }
          }
        }
      }
      // Spare bonus (frames 1-9)
      else if (frame.isSpare) {
        // Add next one roll
        if (i + 1 === 9) {
          // Next frame is frame 10
          const frame10 = calculatedFrames[9];
          if (frame10.rolls.length >= 1) {
            frameScore += frame10.rolls[0];
          }
        } else if (i + 1 < 9) {
          // Next frame is frames 1-8
          const nextFrame = calculatedFrames[i + 1];
          if (nextFrame.rolls.length >= 1) {
            frameScore += nextFrame.rolls[0];
          }
        }
      }
      
      // Set cumulative score
      const previousScore = i > 0 ? (calculatedFrames[i - 1].score || 0) : 0;
      calculatedFrames[i] = {
        ...frame,
        score: previousScore + frameScore,
      };
    }
  }
  
  return calculatedFrames;
};

export const isFrameComplete = (frame: BowlingFrame, frameIndex: number): boolean => {
  if (frameIndex < 9) {
    // Frames 1-9: complete after strike or 2 rolls
    return frame.isStrike || frame.rolls.length === 2;
  } else {
    // Frame 10: complex completion rules
    if (frame.rolls.length === 3) {
      return true;
    } else if (frame.rolls.length === 2) {
      const firstRoll = frame.rolls[0];
      const secondRoll = frame.rolls[1];
      
      // If first roll is strike or spare, need 3rd roll
      if (firstRoll === 10 || firstRoll + secondRoll === 10) {
        return false;
      }
      return true;
    }
    return false;
  }
};

export const updateFrameStatus = (frame: BowlingFrame, frameIndex: number): BowlingFrame => {
  const updatedFrame = { ...frame };
  
  if (frameIndex < 9) {
    // Frames 1-9
    if (updatedFrame.rolls.length === 1 && updatedFrame.rolls[0] === 10) {
      updatedFrame.isStrike = true;
      updatedFrame.isComplete = true;
    } else if (updatedFrame.rolls.length === 2) {
      const total = updatedFrame.rolls.reduce((sum, roll) => sum + roll, 0);
      updatedFrame.isSpare = total === 10;
      updatedFrame.isComplete = true;
    }
  } else {
    // Frame 10
    if (updatedFrame.rolls.length === 1 && updatedFrame.rolls[0] === 10) {
      updatedFrame.isStrike = true;
    } else if (updatedFrame.rolls.length === 2 && updatedFrame.rolls[0] !== 10) {
      const total = updatedFrame.rolls[0] + updatedFrame.rolls[1];
      if (total === 10) {
        updatedFrame.isSpare = true;
      }
    }
    
    updatedFrame.isComplete = isFrameComplete(updatedFrame, frameIndex);
  }
  
  return updatedFrame;
};