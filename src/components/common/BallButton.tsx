import React from 'react';
import { Button } from '@mui/material';
import { useBallDesign } from '../../contexts/BallDesignContext';
import { BallRenderer } from '../../utils/BallRenderer';
import { BallColors } from '../../utils/BallRenderer';
import { UIColors, AppStyles } from '../../constants/colors';

interface BallButtonProps {
  ballNumber: number;
  isActive?: boolean;
  onClick?: (ballNumber: number) => void;
  disabled?: boolean;
  size?: 'scoreDisplay' | 'medium';
}

const BallButton: React.FC<BallButtonProps> = ({
  ballNumber,
  isActive = false,
  onClick,
  disabled = false,
  size = 'medium'
}) => {
  const { currentDesign } = useBallDesign();

  // Get unified ball style from BallRenderer / BallRendererから統一ボールスタイルを取得
  const ballStyle = BallRenderer.getStyle(ballNumber, currentDesign.id, size);
  
  return (
    <Button
      variant="contained"
      disabled={disabled}
      onClick={() => onClick?.(ballNumber)}
      sx={{
        // Use unified ball style as base / 統一ボールスタイルをベースとして使用
        ...ballStyle,
        
        // Override for disabled/inactive states / 無効/非アクティブ状態の上書き
        ...(disabled && {
          background: `${BallColors.pocketed.background} !important`,
          boxShadow: BallColors.pocketed.shadow,
        }),
        
        ...(!isActive && !disabled && {
          background: `${UIColors.background.mediumGray} !important`,
          boxShadow: UIColors.shadow.light,
        }),
        
        // Button-specific properties / ボタン固有プロパティ
        cursor: disabled ? 'default' : 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        
        // Override pseudo-elements for disabled state / 無効状態の疑似要素上書き
        '&::before': {
          ...(ballStyle as any)['&::before'],
          backgroundColor: disabled ? UIColors.background.mediumGray : UIColors.background.white,
          boxShadow: UIColors.shadow.inset,
        },
        
        // Color overrides / 色の上書き
        color: disabled ? UIColors.text.lightGray : UIColors.text.black,
        
        // Hover effects / ホバー効果
        '&:hover': !disabled ? {
          transform: 'scale(1.08)',
          background: (ballStyle as any).background, // Preserve original ball color
          '& span': {
            transform: 'scale(1.15)',
          }
        } : {},
        
        // Disabled state / 無効状態
        '&:disabled': {
          background: `${BallColors.pocketed.background} !important`,
          boxShadow: BallColors.pocketed.shadow,
          color: `${UIColors.text.lightGray} !important`,
        }
      }}
    >
      <span style={{ 
        position: 'relative', 
        zIndex: 3,
        ...AppStyles.monoFont
      }}>
        {ballNumber}
      </span>
    </Button>
  );
};

export default BallButton;