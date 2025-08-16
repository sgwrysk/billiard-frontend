import { GameType } from '../types/index';

export const getBallColor = (ballNumber: number): string => {
  const ballColors: { [key: number]: string } = {
    1: '#FFD700', // Yellow (solid) - matched to 9 ball
    2: '#6495ED', // Blue (solid) - matched to 10 ball
    3: '#FF6B6B', // Red (solid) - matched to 11 ball
    4: '#9370DB', // Purple (solid) - matched to 12 ball
    5: '#FF8C00', // Orange (solid) - matched to 13 ball
    6: '#32CD32', // Green (solid) - matched to 14 ball
    7: '#8B4513', // Maroon (solid) - matched to 15 ball
    8: '#000000', // Black (solid)
    9: '#FFFF00', // Yellow stripe
    10: '#0000FF', // Blue stripe
    11: '#FF0000', // Red stripe
    12: '#800080', // Purple stripe
    13: '#FFA500', // Orange stripe
    14: '#90EE90', // Green stripe
    15: '#CD853F', // Maroon stripe
  };
  return ballColors[ballNumber] || '#CCCCCC';
};

export const getBallTextColor = (ballNumber: number): string => {
  // Dark balls use white text, bright balls use black text
  const darkBalls = [2, 3, 4, 7, 8];
  return darkBalls.includes(ballNumber) ? 'white' : 'black';
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
    border: '2px solid #333',
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