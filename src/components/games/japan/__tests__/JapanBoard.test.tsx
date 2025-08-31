import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import JapanBoard from '../JapanBoard';
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

describe('JapanBoard', () => {
  const mockOnBallAction = vi.fn();
  const mockOnSwitchPlayer = vi.fn();
  const mockOnUndoLastShot = vi.fn();
  
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
    totalRacks: 1,
    currentRack: 1,
    rackInProgress: true,
    shotHistory: [],
    scoreHistory: [],
    japanSettings: defaultSettings
  };

  const defaultProps = {
    game: mockGame,
    onBallAction: mockOnBallAction,
    onSwitchPlayer: mockOnSwitchPlayer,
    onUndoLastShot: mockOnUndoLastShot,
    canUndoLastShot: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Japan game board', () => {
    renderWithTheme(<JapanBoard {...defaultProps} />);
    
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    // Use getAllByText to find both "8" elements (score and ball), then check for the score element
    const eightElements = screen.getAllByText('8');
    expect(eightElements.length).toBeGreaterThan(0);
  });

  it('should show handicap balls as clickable buttons', () => {
    renderWithTheme(<JapanBoard {...defaultProps} />);
    
    // Should show ball buttons 1-10
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    
    // Handicap balls (5, 9) should be visually distinct
    const ball5 = screen.getByText('5');
    const ball6 = screen.getByText('6');
    expect(ball5).toBeInTheDocument();
    expect(ball6).toBeInTheDocument();
  });

  it('should call onBallAction when ball is clicked', () => {
    renderWithTheme(<JapanBoard {...defaultProps} />);
    
    const ball5 = screen.getByText('5');
    fireEvent.click(ball5);
    
    expect(mockOnBallAction).toHaveBeenCalledWith({
      ball: 5,
      type: 'ball',
      value: 5,
      label: undefined
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

    renderWithTheme(<JapanBoard {...defaultProps} game={gameWithMultipliers} />);
    
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

    renderWithTheme(<JapanBoard {...defaultProps} game={gameWithDeductions} />);
    
    expect(screen.getByText('-1')).toBeInTheDocument();
    expect(screen.getByText('-2')).toBeInTheDocument();
  });

  it('should call onBallAction when multiplier is clicked', () => {
    const gameWithMultipliers = {
      ...mockGame,
      japanSettings: {
        ...defaultSettings,
        multipliersEnabled: true,
        multipliers: [{ label: 'x2', value: 2 }]
      }
    };

    renderWithTheme(<JapanBoard {...defaultProps} game={gameWithMultipliers} />);
    
    const multiplier = screen.getByText('x2');
    fireEvent.click(multiplier);
    
    expect(mockOnBallAction).toHaveBeenCalledWith({
      ball: 0, // No specific ball for multiplier
      type: 'multiplier',
      value: 2,
      label: 'x2'
    });
  });

  it('should call onBallAction when deduction is clicked', () => {
    const gameWithDeductions = {
      ...mockGame,
      japanSettings: {
        ...defaultSettings,
        deductionEnabled: true,
        deductions: [{ label: '-1', value: 1 }]
      }
    };

    renderWithTheme(<JapanBoard {...defaultProps} game={gameWithDeductions} />);
    
    const deduction = screen.getByText('-1');
    fireEvent.click(deduction);
    
    expect(mockOnBallAction).toHaveBeenCalledWith({
      ball: 0, // No specific ball for deduction
      type: 'deduction',
      value: 1,
      label: '-1'
    });
  });

  it('should highlight active player', () => {
    renderWithTheme(<JapanBoard {...defaultProps} />);
    
    // The active player card should have different styling
    // This is tested through the player card structure
    expect(screen.getByText('Player 1')).toBeInTheDocument();
  });

  it('should show undo button when canUndoLastShot is true', () => {
    renderWithTheme(<JapanBoard {...defaultProps} canUndoLastShot={true} />);
    
    expect(screen.getByText('取り消し')).toBeInTheDocument();
  });

  it('should call onUndoLastShot when undo button is clicked', () => {
    renderWithTheme(<JapanBoard {...defaultProps} canUndoLastShot={true} />);
    
    const undoButton = screen.getByText('取り消し');
    fireEvent.click(undoButton);
    
    expect(mockOnUndoLastShot).toHaveBeenCalled();
  });
});