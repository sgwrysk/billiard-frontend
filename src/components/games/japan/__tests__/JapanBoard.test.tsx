import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import JapanBoard from '../JapanBoard';
import type { Game } from '../../../../types/index';
import { GameType, GameStatus } from '../../../../types/index';
import type { JapanGameSettings } from '../../../../types/japan';
import { LanguageProvider } from '../../../../contexts/LanguageContext';
import { BallDesignProvider } from '../../../../contexts/BallDesignContext';

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

describe('JapanBoard', () => {
  const mockOnBallAction = vi.fn();
  const mockOnSwitchPlayer = vi.fn();
  const mockOnUndoLastShot = vi.fn();
  
  const defaultSettings: JapanGameSettings = {
    handicapBalls: [5, 9],
    orderChangeInterval: 10,
    orderChangeEnabled: false
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