import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { LanguageProvider } from '../../../../contexts/LanguageContext';
import JapanCumulativePointsTable from '../JapanCumulativePointsTable';
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

describe('JapanCumulativePointsTable', () => {
  const defaultSettings: JapanGameSettings = {
    handicapBalls: [5, 9],
    orderChangeInterval: 10,
    orderChangeEnabled: false
  };

  const mockGame: Game = {
    id: 'test-game',
    type: GameType.JAPAN,
    status: GameStatus.COMPLETED,
    players: [
      {
        id: 'player-1',
        name: 'プレイヤーA',
        score: 15,
        targetScore: undefined,
        isActive: false,
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
      }
    ],
    currentPlayerIndex: 0,
    startTime: new Date(),
    totalRacks: 3,
    currentRack: 4, // Game completed
    rackInProgress: false,
    shotHistory: [],
    scoreHistory: [],
    japanSettings: defaultSettings,
    japanRackHistory: [
      {
        rackNumber: 1,
        playerResults: [
          {
            playerId: 'player-1',
            earnedPoints: 5,
            deltaPoints: 2,
            totalPoints: 2
          },
          {
            playerId: 'player-2',
            earnedPoints: 3,
            deltaPoints: -2,
            totalPoints: -2
          }
        ]
      },
      {
        rackNumber: 2,
        playerResults: [
          {
            playerId: 'player-1',
            earnedPoints: 2,
            deltaPoints: -1,
            totalPoints: 1
          },
          {
            playerId: 'player-2',
            earnedPoints: 4,
            deltaPoints: 1,
            totalPoints: -1
          }
        ]
      },
      {
        rackNumber: 3,
        playerResults: [
          {
            playerId: 'player-1',
            earnedPoints: 7,
            deltaPoints: 4,
            totalPoints: 5
          },
          {
            playerId: 'player-2',
            earnedPoints: 3,
            deltaPoints: -4,
            totalPoints: -5
          }
        ]
      }
    ]
  };

  it('should render the cumulative points table', () => {
    renderWithProviders(<JapanCumulativePointsTable game={mockGame} />);
    
    expect(screen.getByText('ポイント累計')).toBeInTheDocument();
  });

  it('should display player names', () => {
    renderWithProviders(<JapanCumulativePointsTable game={mockGame} />);
    
    expect(screen.getByText('プレイヤーA')).toBeInTheDocument();
    expect(screen.getByText('プレイヤーB')).toBeInTheDocument();
  });

  it('should display rack numbers in header', () => {
    renderWithProviders(<JapanCumulativePointsTable game={mockGame} />);
    
    // Should show rack numbers - the table displays all racks in the interval (1-10)
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10').length).toBeGreaterThan(0); // Full interval displayed
  });

  it('should display earned, delta, and total points from rack history', () => {
    renderWithProviders(<JapanCumulativePointsTable game={mockGame} />);
    
    // Check for earned points (first column of top row)
    expect(screen.getAllByText('5').length).toBeGreaterThan(0); // Player A, Rack 1 earned
    expect(screen.getAllByText('7').length).toBeGreaterThan(0); // Player A, Rack 3 earned
    
    // Check for delta points (second column of top row) 
    expect(screen.getAllByText('2').length).toBeGreaterThan(0); // Player A, Rack 1 delta
    expect(screen.getAllByText('4').length).toBeGreaterThan(0); // Player A, Rack 3 delta
    
    // Check for total points (bottom row)
    expect(screen.getAllByText('-2').length).toBeGreaterThan(0); // Player B total after rack 1
    expect(screen.getAllByText('-5').length).toBeGreaterThan(0); // Player B final total
  });

  it('should show cumulative points when shouldShowCumulativePoints returns true', () => {
    renderWithProviders(
      <JapanCumulativePointsTable 
        game={mockGame} 
        shouldShowCumulativePoints={() => true}
      />
    );
    
    // Should show total points when function returns true
    expect(screen.getAllByText('-2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('-5').length).toBeGreaterThan(0);
  });

  it('should hide cumulative points when shouldShowCumulativePoints returns false', () => {
    const gameInProgress = {
      ...mockGame,
      currentRack: 2,
      rackInProgress: true
    };

    renderWithProviders(
      <JapanCumulativePointsTable 
        game={gameInProgress} 
        shouldShowCumulativePoints={() => false}
      />
    );
    
    // Component should render without errors even when hiding cumulative points
    expect(screen.getByText('ポイント累計')).toBeInTheDocument();
  });

  it('should handle empty rack history gracefully', () => {
    const gameWithNoHistory = {
      ...mockGame,
      japanRackHistory: []
    };

    renderWithProviders(<JapanCumulativePointsTable game={gameWithNoHistory} />);
    
    expect(screen.getByText('ポイント累計')).toBeInTheDocument();
    expect(screen.getByText('プレイヤーA')).toBeInTheDocument();
    expect(screen.getByText('プレイヤーB')).toBeInTheDocument();
  });
});