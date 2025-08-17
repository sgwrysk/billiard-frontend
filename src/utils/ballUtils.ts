import { GameType } from '../types/index';
import { BallColors } from '../constants/colors';

export const getBallColor = (ballNumber: number): string => {
  return BallColors.colors[ballNumber as keyof typeof BallColors.colors] || BallColors.default;
};

export const getBallTextColor = (ballNumber: number): string => {
  // Dark balls use white text, bright balls use black text
  const darkBalls = [2, 3, 4, 7, 8];
  return darkBalls.includes(ballNumber) ? BallColors.text.dark : BallColors.text.light;
};

export const getBallScore = (ballNumber: number, gameType: GameType): number => {
  switch (gameType) {
    case GameType.SET_MATCH:
      return ballNumber === 9 ? 10 : 1; // 9-ball is 10 points, others are 1 point
    case GameType.ROTATION:
      return ballNumber; // Rotation: ball number equals points
    default:
      return 1;
  }
};

export const getBallStyle = (ballNumber: number) => {
  const baseStyle = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: `2px solid ${BallColors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    color: getBallTextColor(ballNumber),
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const ballSpecificStyle = ballNumber > 8 
    ? {
        background: `linear-gradient(to bottom, white 0%, white 20%, ${getBallColor(ballNumber)} 20%, ${getBallColor(ballNumber)} 80%, white 80%, white 100%)`,
      }
    : {
        background: `radial-gradient(circle at 30% 30%, ${getBallColor(ballNumber)}dd, ${getBallColor(ballNumber)} 70%)`,
      };

  return { ...baseStyle, ...ballSpecificStyle };
};