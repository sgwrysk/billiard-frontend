import React from 'react';
import { Button } from '@mui/material';
import { getBallColor } from '../../utils/ballUtils';
import { BallColors, UIColors, AppStyles } from '../../constants/colors';

interface BallButtonProps {
  ballNumber: number;
  isActive?: boolean;
  onClick?: (ballNumber: number) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

const BallButton: React.FC<BallButtonProps> = ({
  ballNumber,
  isActive = false,
  onClick,
  disabled = false,
  size = 'medium'
}) => {
  const dimensions = size === 'small' ? { xs: 40, sm: 36 } : { xs: 60, sm: 52 };
  const fontSize = size === 'small' ? { xs: '0.9rem', sm: '0.8rem' } : { xs: '1.2rem', sm: '1.1rem' };
  const whiteCirle = size === 'small' ? { xs: '22px', sm: '20px' } : { xs: '32px', sm: '28px' };

  return (
    <Button
      variant="contained"
      disabled={disabled}
      onClick={() => onClick?.(ballNumber)}
      sx={{
        width: dimensions,
        height: dimensions,
        minWidth: dimensions,
        borderRadius: '50%',
        fontWeight: 'bold',
        fontSize: fontSize,
        position: 'relative',
        overflow: 'hidden',
        border: 'none',
        padding: 0,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...(disabled
          ? { background: BallColors.pocketed.background }
          : !isActive
          ? { background: UIColors.background.mediumGray }
          : ballNumber > 8
            ? { background: `linear-gradient(to bottom, white 0%, white 20%, ${getBallColor(ballNumber)} 20%, ${getBallColor(ballNumber)} 80%, white 80%, white 100%)` }
            : { background: `radial-gradient(circle at 30% 30%, ${getBallColor(ballNumber)}dd, ${getBallColor(ballNumber)} 70%)` }
        ),
        boxShadow: disabled
          ? BallColors.pocketed.shadow
          : isActive
          ? BallColors.shadow.normal
          : UIColors.shadow.light,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: whiteCirle,
          height: whiteCirle,
          backgroundColor: disabled ? UIColors.background.mediumGray : UIColors.background.white,
          borderRadius: '50%',
          boxShadow: UIColors.shadow.inset,
          zIndex: 1,
        },
        color: disabled ? UIColors.text.lightGray : UIColors.text.black,
        '&:hover': !disabled ? {
          transform: 'scale(1.08)',
          background: !isActive
            ? `${UIColors.background.mediumGray} !important`
            : ballNumber > 8
              ? `linear-gradient(to bottom, white 0%, white 20%, ${getBallColor(ballNumber)} 20%, ${getBallColor(ballNumber)} 80%, white 80%, white 100%) !important`
              : `radial-gradient(circle at 30% 30%, ${getBallColor(ballNumber)}dd, ${getBallColor(ballNumber)} 70%) !important`,
          '& span': {
            transform: 'scale(1.15)',
          }
        } : {},
        '&:disabled': {
          background: `${BallColors.pocketed.background} !important`,
          boxShadow: BallColors.pocketed.shadow,
          color: `${UIColors.text.lightGray} !important`,
        }
      }}
    >
      <span style={{ 
        position: 'relative', 
        zIndex: 2,
        ...AppStyles.monoFont
      }}>
        {ballNumber}
      </span>
    </Button>
  );
};

export default BallButton;