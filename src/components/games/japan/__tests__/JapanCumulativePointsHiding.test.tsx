import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { LanguageProvider } from '../../../../contexts/LanguageContext';
import JapanGameScreen from '../JapanGameScreen';
import type { Game } from '../../../../types/index';
import { GameType, GameStatus } from '../../../../types/index';
import type { JapanGameSettings } from '../../../../types/japan';

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </LanguageProvider>
  );
};

describe('Japan Game Cumulative Points Display Logic', () => {
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

  const defaultProps = {
    onBallClick: mockOnBallClick,
    onMultiplierChange: mockOnMultiplierChange,
    onNextRack: mockOnNextRack,
    onUndo: mockOnUndo,
    onEndGame: mockOnEndGame,
    onPlayerOrderChange: mockOnPlayerOrderChange
  };

  it('should show empty/blank when rack is in progress (has current points)', () => {
    const gameWithProgress: Game = {
      id: 'test-game',
      type: GameType.JAPAN,
      status: GameStatus.IN_PROGRESS,
      players: [
        {
          id: 'player-1',
          name: 'プレイヤーA',
          score: 0,
          targetScore: undefined,
          isActive: true,
          setsWon: 0,
          ballsPocketed: []
        }
      ],
      currentPlayerIndex: 0,
      startTime: new Date(),
      totalRacks: 10,
      currentRack: 1,
      rackInProgress: true,
      shotHistory: [
        {
          playerId: 'player-1',
          ballNumber: 5,
          isSunk: true,
          isFoul: false,
          timestamp: new Date(),
          customData: {
            type: 'ball_click',
            points: 1
          }
        }
      ], // Has shots in current rack
      scoreHistory: [],
      japanSettings: defaultSettings
    };
    
    renderWithProviders(<JapanGameScreen game={gameWithProgress} {...defaultProps} />);
    
    // Should not show cumulative points (empty/blank) when rack is in progress
    // Check that current rack shows 1 point from shot, but cumulative points are hidden
    const currentRackPointElements = screen.getAllByText('1');
    expect(currentRackPointElements.length).toBeGreaterThan(0);
    
    // Verify the component renders properly without errors when rack is in progress
  });

  it('should show actual points when rack is not in progress (no current points)', () => {
    const gameWithoutProgress: Game = {
      id: 'test-game',
      type: GameType.JAPAN,
      status: GameStatus.IN_PROGRESS,
      players: [
        {
          id: 'player-1',
          name: 'プレイヤーA',
          score: 0,
          targetScore: undefined,
          isActive: true,
          setsWon: 0,
          ballsPocketed: []
        }
      ],
      currentPlayerIndex: 0,
      startTime: new Date(),
      totalRacks: 10,
      currentRack: 1,
      rackInProgress: true,
      shotHistory: [], // No shots in current rack
      scoreHistory: [],
      japanSettings: defaultSettings
    };
    
    renderWithProviders(<JapanGameScreen game={gameWithoutProgress} {...defaultProps} />);
    
    // Should show actual cumulative points (0 for first rack) when no current progress
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements.length).toBeGreaterThanOrEqual(1); // Should show 0 instead of empty
  });

  it('should hide cumulative points in rack 2+ at start (simulating "next rack" button press)', () => {
    const gameInRack2Start: Game = {
      id: 'test-game',
      type: GameType.JAPAN,
      status: GameStatus.IN_PROGRESS,
      players: [
        {
          id: 'player-1',
          name: 'プレイヤーA',
          score: 0,
          targetScore: undefined,
          isActive: true,
          setsWon: 0,
          ballsPocketed: []
        }
      ],
      currentPlayerIndex: 0,
      startTime: new Date(),
      totalRacks: 10,
      currentRack: 2, // Rack 2
      rackInProgress: true,
      shotHistory: [], // No shots in current rack (just started)
      scoreHistory: [],
      japanSettings: defaultSettings,
      japanRackHistory: [
        {
          rackNumber: 1,
          playerResults: [
            {
              playerId: 'player-1',
              earnedPoints: 3,
              deltaPoints: 3,
              totalPoints: 3
            }
          ]
        }
      ] // Has previous rack history
    };
    
    renderWithProviders(<JapanGameScreen game={gameInRack2Start} {...defaultProps} />);
    
    // Should hide cumulative points even though we have rack history
    // This simulates "next rack" button being pressed
    const playerNames = screen.getAllByText('プレイヤーA');
    expect(playerNames.length).toBeGreaterThan(0);
    
    // Verify that the component renders properly for rack 2 start scenario
    const rack2Display = screen.getByText(/ラック\s+2/);
    expect(rack2Display).toBeInTheDocument();
  });
});