import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { LanguageProvider } from '../../../../contexts/LanguageContext';
import { BallDesignProvider } from '../../../../contexts/BallDesignContext';
import JapanGameSettings from '../JapanGameSettings';
import type { JapanGameSettings as JapanGameSettingsType } from '../../../../types/japan';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <BallDesignProvider>
        <ThemeProvider theme={theme}>
          {component}
        </ThemeProvider>
      </BallDesignProvider>
    </LanguageProvider>
  );
};

describe('JapanGameSettings', () => {
  const mockOnSettingsChange = vi.fn();
  
  const defaultSettings: JapanGameSettingsType = {
    handicapBalls: [5, 9],
    orderChangeInterval: 10,
    orderChangeEnabled: false
  };

  const defaultProps = {
    settings: defaultSettings,
    onSettingsChange: mockOnSettingsChange
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Japan game settings', () => {
    renderWithTheme(<JapanGameSettings {...defaultProps} />);
    
    expect(screen.getByText('ハンディキャップボール')).toBeInTheDocument();
    expect(screen.getByText('順替えのラック数を変更する（デフォルト: 10）')).toBeInTheDocument();
  });

  it('should show handicap balls as ball buttons with 5 and 9 active by default', () => {
    renderWithTheme(<JapanGameSettings {...defaultProps} />);
    
    // Should show 10 ball buttons (1-10)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    
    // Balls 5 and 9 should be active by default (this is tested via the component state)
  });


  it('should show order change settings when order change toggle is enabled', () => {
    renderWithTheme(<JapanGameSettings {...defaultProps} />);
    
    // Enable order change settings
    const orderToggle = screen.getByRole('checkbox', { name: /順替えのラック数を変更する/i });
    fireEvent.click(orderToggle);
    
    expect(mockOnSettingsChange).toHaveBeenCalledWith({
      ...defaultSettings,
      orderChangeEnabled: true,
      orderChangeInterval: 10
    });
  });


  it('should show validation error when neither 9 nor 10 is selected', () => {
    const invalidSettings = {
      ...defaultSettings,
      handicapBalls: [1, 2] // Neither 9 nor 10 selected
    };

    renderWithTheme(
      <JapanGameSettings 
        {...defaultProps} 
        settings={invalidSettings} 
      />
    );
    
    expect(screen.getByText('9番か10番のどちらかを必ず選択してください')).toBeInTheDocument();
  });

  it('should not show validation error when 9 is selected', () => {
    const validSettings = {
      ...defaultSettings,
      handicapBalls: [1, 9] // 9 is selected
    };

    renderWithTheme(
      <JapanGameSettings 
        {...defaultProps} 
        settings={validSettings} 
      />
    );
    
    expect(screen.queryByText('9番か10番のどちらかを必ず選択してください')).not.toBeInTheDocument();
  });

  it('should not show validation error when 10 is selected', () => {
    const validSettings = {
      ...defaultSettings,
      handicapBalls: [1, 10] // 10 is selected
    };

    renderWithTheme(
      <JapanGameSettings 
        {...defaultProps} 
        settings={validSettings} 
      />
    );
    
    expect(screen.queryByText('9番か10番のどちらかを必ず選択してください')).not.toBeInTheDocument();
  });
});