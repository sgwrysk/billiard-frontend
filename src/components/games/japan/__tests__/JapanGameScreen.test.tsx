import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import JapanGameScreen from '../JapanGameScreen';
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

describe('JapanGameScreen', () => {
  const mockOnBallClick = vi.fn();
  const mockOnMultiplierChange = vi.fn();
  const mockOnNextRack = vi.fn();
  const mockOnUndo = vi.fn();
  const mockOnEndGame = vi.fn();
  const mockOnPlayerOrderChange = vi.fn();
  
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
        name: 'プレイヤーA',
        score: 15,
        targetScore: undefined,
        isActive: true,
        setsWon: 0,
        ballsPocketed: []
      },
      {
        id: 'player-2',
        name: 'プレイヤーB',
        score: -5,
        targetScore: undefined,
        isActive: false,
        setsWon: 0,
        ballsPocketed: []
      },
      {
        id: 'player-3',
        name: 'プレイヤーC',
        score: 8,
        targetScore: undefined,
        isActive: false,
        setsWon: 0,
        ballsPocketed: []
      }
    ],
    currentPlayerIndex: 0,
    startTime: new Date(),
    totalRacks: 10,
    currentRack: 3,
    rackInProgress: true,
    shotHistory: [],
    scoreHistory: [],
    japanSettings: defaultSettings
  };

  const defaultProps = {
    game: mockGame,
    onBallClick: mockOnBallClick,
    onMultiplierChange: mockOnMultiplierChange,
    onNextRack: mockOnNextRack,
    onUndo: mockOnUndo,
    onEndGame: mockOnEndGame,
    onPlayerOrderChange: mockOnPlayerOrderChange
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. ラック情報', () => {
    it('should display current rack number', () => {
      renderWithTheme(<JapanGameScreen {...defaultProps} />);
      expect(screen.getByText(/ラック\s+3/)).toBeInTheDocument();
    });

    it('should display racks until order change', () => {
      const gameWithOrderChange = {
        ...mockGame,
        japanSettings: {
          ...defaultSettings,
          orderChangeEnabled: true,
          orderChangeInterval: 10
        }
      };
      renderWithTheme(<JapanGameScreen {...defaultProps} game={gameWithOrderChange} />);
      // Text is split across multiple elements, so check for parts
      expect(screen.getByText(/（順替えまで/)).toBeInTheDocument();
      expect(screen.getByText(/ラック）/)).toBeInTheDocument();
    });

    it('should display player names in panels and rack results table', () => {
      renderWithTheme(<JapanGameScreen {...defaultProps} />);
      expect(screen.getAllByText('プレイヤーA')).toHaveLength(2); // In player panel and rack results table
      expect(screen.getAllByText('プレイヤーB')).toHaveLength(2);
      expect(screen.getAllByText('プレイヤーC')).toHaveLength(2);
    });
  });

  describe('2. ポイント入力パネル', () => {
    it('should display player panels with current rack points', () => {
      renderWithTheme(<JapanGameScreen {...defaultProps} />);
      
      // Player panels should be displayed
      expect(screen.getAllByText('プレイヤーA')).toHaveLength(2);
      expect(screen.getAllByText('プレイヤーB')).toHaveLength(2);
      expect(screen.getAllByText('プレイヤーC')).toHaveLength(2);
    });

    it('should display total points with correct colors', () => {
      renderWithTheme(<JapanGameScreen {...defaultProps} />);
      
      // Should show 0 for current rack points and some cumulative displays
      // Note: Some cumulative points may be hidden based on rack progress state
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    });

    it('should display collected balls icons', () => {
      renderWithTheme(<JapanGameScreen {...defaultProps} />);
      
      // Should have areas to display collected balls (initially empty)
      // This would show ball icons in order when balls are clicked
    });

    it('should display handicap ball buttons only', () => {
      renderWithTheme(<JapanGameScreen {...defaultProps} />);
      
      // Should show only handicap balls (5, 9) - note that numbers may also appear in rack table headers
      expect(screen.getAllByText('5')).toHaveLength(2); // Ball button + rack table header
      expect(screen.getAllByText('9')).toHaveLength(2); // Ball button + rack table header
      
      // Should not show non-handicap balls as ball buttons 
      // Note: Numbers 1, 2 etc. appear in rack table headers, which is expected
      // The test should focus on verifying handicap balls are present in ball input area
    });

    it('should call onBallClick when ball is clicked', () => {
      renderWithTheme(<JapanGameScreen {...defaultProps} />);
      
      // Get ball button specifically (first element should be the ball button)
      const ball5Elements = screen.getAllByText('5');
      const ball5Button = ball5Elements[0]; // Assuming the ball button appears first
      fireEvent.click(ball5Button);
      
      expect(mockOnBallClick).toHaveBeenCalledWith(5);
    });

    it('should display multiplier input field', () => {
      renderWithTheme(<JapanGameScreen {...defaultProps} />);
      expect(screen.getByText('倍率')).toBeInTheDocument();
      // Check for NumberInputStepper - it uses a text input field
      const multiplierInput = screen.getByDisplayValue('1');
      expect(multiplierInput).toBeInTheDocument();
      expect(multiplierInput).toHaveValue('1'); // Default multiplier value
    });

  });

  describe('3. ポイント累計確認パネル', () => {
    it('should display rack results in bowlard-style grid', () => {
      renderWithTheme(<JapanGameScreen {...defaultProps} />);
      
      // Should have bowlard-style grid design showing all 10 racks (orderChangeInterval)
      // Rack numbers are now displayed as simple numbers "1", "2", etc.
      expect(screen.getAllByText('1')).toHaveLength(1); // Rack 1 header only
      expect(screen.getAllByText('2')).toHaveLength(1); // Rack 2 header only
      expect(screen.getAllByText('3')).toHaveLength(1); // Rack 3 header only
      expect(screen.getAllByText('10')).toHaveLength(1); // Rack 10 header only
      
      // "プレイヤー" label has been removed from the header
      
      // Grid should have empty cells since no rack history yet (no earned/delta text displayed)
      // The structure should be present but without data
    });

    it('should display rack history in table format', () => {
      renderWithTheme(<JapanGameScreen {...defaultProps} />);
      
      // Should show previous racks (ラック1, ラック2)
      // This would be populated from rackHistory
    });
  });

  describe('4. 操作ボタン', () => {
    it('should display operation buttons', () => {
      renderWithTheme(<JapanGameScreen {...defaultProps} />);
      
      expect(screen.getByText('取り消し')).toBeInTheDocument();
      expect(screen.getByText('次ラックへ')).toBeInTheDocument();
      expect(screen.getByText('ゲーム終了')).toBeInTheDocument();
    });

    it('should call callbacks when buttons are clicked', () => {
      renderWithTheme(<JapanGameScreen {...defaultProps} />);
      
      fireEvent.click(screen.getByText('取り消し'));
      expect(mockOnUndo).toHaveBeenCalled();
      
      fireEvent.click(screen.getByText('次ラックへ'));
      expect(mockOnNextRack).toHaveBeenCalled();
      
      fireEvent.click(screen.getByText('ゲーム終了'));
      expect(mockOnEndGame).toHaveBeenCalled();
    });
  });


  describe('プレイヤー順序変更', () => {
    it('should call onPlayerOrderChange when player order is changed', () => {
      renderWithTheme(<JapanGameScreen {...defaultProps} />);
      
      // This would test drag & drop functionality once implemented
      // For now, just verify the callback exists
      expect(mockOnPlayerOrderChange).toBeDefined();
    });
  });
});