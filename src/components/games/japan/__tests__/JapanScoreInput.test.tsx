import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import JapanScoreInput from '../JapanScoreInput';
import type { Game } from '../../../../types/index';
import { GameType, GameStatus } from '../../../../types/index';
import type { JapanGameSettings } from '../../../../types/japan';
import { LanguageProvider } from '../../../../contexts/LanguageContext';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </LanguageProvider>
  );
};

describe('JapanScoreInput', () => {
  const mockOnRackComplete = vi.fn();
  const mockOnSwitchPlayer = vi.fn();
  const mockOnUndoLastShot = vi.fn();
  const mockOnApplyMultiplier = vi.fn();
  const mockOnApplyDeduction = vi.fn();
  
  const defaultSettings: JapanGameSettings = {
    handicapBalls: [5, 9],
    multipliers: [{ label: 'x2', value: 2 }],
    deductionEnabled: false,
    deductions: [],
    orderChangeInterval: 10,
    orderChangeEnabled: false,
    multipliersEnabled: false
  };

  const mockGame: Game = {
    id: 'test-game',
    type: GameType.JAPAN,
    status: GameStatus.IN_PROGRESS,
    players: [
      {
        id: 'player-1',
        name: 'Player 1',
        score: 15,
        targetScore: undefined,
        isActive: true,
        setsWon: 0,
        ballsPocketed: []
      },
      {
        id: 'player-2',
        name: 'Player 2',
        score: 8,
        targetScore: undefined,
        isActive: false,
        setsWon: 0,
        ballsPocketed: []
      }
    ],
    currentPlayerIndex: 0,
    startTime: new Date(),
    totalRacks: 5,
    currentRack: 1,
    rackInProgress: true,
    shotHistory: [],
    scoreHistory: [],
    japanSettings: defaultSettings
  };

  const defaultProps = {
    game: mockGame,
    onRackComplete: mockOnRackComplete,
    onSwitchPlayer: mockOnSwitchPlayer,
    onUndoLastShot: mockOnUndoLastShot,
    onApplyMultiplier: mockOnApplyMultiplier,
    onApplyDeduction: mockOnApplyDeduction,
    canUndoLastShot: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render rack input screen', () => {
    renderWithTheme(<JapanScoreInput {...defaultProps} />);
    
    expect(screen.getByText('ラック 1')).toBeInTheDocument();
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
  });

  it('should show ball count input for each player', () => {
    renderWithTheme(<JapanScoreInput {...defaultProps} />);
    
    // Each player should have a number input for ball count (0-10)
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(2); // One input per player
  });

  it('should allow inputting ball count 0-10', () => {
    renderWithTheme(<JapanScoreInput {...defaultProps} />);
    
    const input = screen.getAllByRole('spinbutton')[0];
    
    // Should accept values 0-10
    fireEvent.change(input, { target: { value: '5' } });
    expect(input).toHaveValue(5);
    
    fireEvent.change(input, { target: { value: '10' } });
    expect(input).toHaveValue(10);
    
    fireEvent.change(input, { target: { value: '0' } });
    expect(input).toHaveValue(0);
  });

  it('should not allow values outside 0-10 range', () => {
    renderWithTheme(<JapanScoreInput {...defaultProps} />);
    
    const input = screen.getAllByRole('spinbutton')[0];
    
    // Should not accept negative values
    fireEvent.change(input, { target: { value: '-1' } });
    expect(input).toHaveValue(0);
    
    // Should not accept values over 10
    fireEvent.change(input, { target: { value: '11' } });
    expect(input).toHaveValue(10);
  });

  it('should show rack complete button when inputs are valid', () => {
    renderWithTheme(<JapanScoreInput {...defaultProps} />);
    
    expect(screen.getByText('ラック完了')).toBeInTheDocument();
  });

  it('should call onRackComplete with correct ball counts', () => {
    renderWithTheme(<JapanScoreInput {...defaultProps} />);
    
    const inputs = screen.getAllByRole('spinbutton');
    
    // Set ball counts for each player
    fireEvent.change(inputs[0], { target: { value: '3' } });
    fireEvent.change(inputs[1], { target: { value: '7' } });
    
    // Click rack complete
    const completeButton = screen.getByText('ラック完了');
    fireEvent.click(completeButton);
    
    expect(mockOnRackComplete).toHaveBeenCalledWith({
      player1Balls: 3,
      player2Balls: 7,
      rackNumber: 1
    });
  });

  it('should show multiplier buttons when enabled', () => {
    const gameWithMultipliers = {
      ...mockGame,
      japanSettings: {
        ...defaultSettings,
        multipliersEnabled: true,
        multipliers: [{ label: 'x2', value: 2 }, { label: 'x3', value: 3 }]
      }
    };

    renderWithTheme(<JapanScoreInput {...defaultProps} game={gameWithMultipliers} />);
    
    expect(screen.getByText('x2')).toBeInTheDocument();
    expect(screen.getByText('x3')).toBeInTheDocument();
  });

  it('should show deduction buttons when enabled', () => {
    const gameWithDeductions = {
      ...mockGame,
      japanSettings: {
        ...defaultSettings,
        deductionEnabled: true,
        deductions: [{ label: '-1', value: 1 }, { label: '-2', value: 2 }]
      }
    };

    renderWithTheme(<JapanScoreInput {...defaultProps} game={gameWithDeductions} />);
    
    expect(screen.getByText('-1')).toBeInTheDocument();
    expect(screen.getByText('-2')).toBeInTheDocument();
  });

  it('should call onApplyMultiplier when multiplier clicked', () => {
    const gameWithMultipliers = {
      ...mockGame,
      japanSettings: {
        ...defaultSettings,
        multipliersEnabled: true,
        multipliers: [{ label: 'x2', value: 2 }]
      }
    };

    renderWithTheme(<JapanScoreInput {...defaultProps} game={gameWithMultipliers} />);
    
    const multiplierButton = screen.getByText('x2');
    fireEvent.click(multiplierButton);
    
    expect(mockOnApplyMultiplier).toHaveBeenCalledWith('player-1', 2);
  });

  it('should call onApplyDeduction when deduction clicked', () => {
    const gameWithDeductions = {
      ...mockGame,
      japanSettings: {
        ...defaultSettings,
        deductionEnabled: true,
        deductions: [{ label: '-1', value: 1 }]
      }
    };

    renderWithTheme(<JapanScoreInput {...defaultProps} game={gameWithDeductions} />);
    
    const deductionButton = screen.getByText('-1');
    fireEvent.click(deductionButton);
    
    expect(mockOnApplyDeduction).toHaveBeenCalledWith('player-1', 1);
  });

  it('should show current scores', () => {
    renderWithTheme(<JapanScoreInput {...defaultProps} />);
    
    expect(screen.getByText('15')).toBeInTheDocument(); // Player 1 score
    expect(screen.getByText('8')).toBeInTheDocument();  // Player 2 score
  });

  it('should show undo button when canUndoLastShot is true', () => {
    renderWithTheme(<JapanScoreInput {...defaultProps} canUndoLastShot={true} />);
    
    expect(screen.getByText('取り消し')).toBeInTheDocument();
  });

  it('should call onUndoLastShot when undo clicked', () => {
    renderWithTheme(<JapanScoreInput {...defaultProps} canUndoLastShot={true} />);
    
    const undoButton = screen.getByText('取り消し');
    fireEvent.click(undoButton);
    
    expect(mockOnUndoLastShot).toHaveBeenCalled();
  });
});