import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { GameType, GameStatus } from '../../../types/index';
import type { Game } from '../../../types/index';
import BowlardVictoryContent from '../BowlardVictoryContent';

// Mock Chart.js
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="chart">Chart</div>,
}));

// Test wrapper with LanguageProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    {children}
  </LanguageProvider>
);

describe('BowlardVictoryContent', () => {
  it('should render BOWLARD victory screen with bowling frames', () => {
    const bowlardGame: Game = {
      id: 'bowlard-test',
      type: GameType.BOWLARD,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Bowler',
          score: 150,
          ballsPocketed: [],
          isActive: false,
          bowlingFrames: [
            {
              frameNumber: 1,
              rolls: [7, 3],
              score: 15,
              isComplete: true,
              isStrike: false,
              isSpare: true
            },
            {
              frameNumber: 2,
              rolls: [10],
              score: 35,
              isComplete: true,
              isStrike: true,
              isSpare: false
            }
          ]
        }
      ],
      currentPlayerIndex: 0,
      currentRack: 1,
      rackInProgress: false,
      totalRacks: 0,
      startTime: new Date(),
      endTime: new Date(),
      scoreHistory: [],
      shotHistory: []
    };

    render(
      <TestWrapper>
        <BowlardVictoryContent game={bowlardGame} />
      </TestWrapper>
    );

    // Check if Bowlard specific content is displayed  
    expect(screen.getAllByText((_, node) => {
      return node?.textContent?.includes('ボーラード') ?? false;
    })[0]).toBeInTheDocument();
    expect(screen.getByText(/最終スコア/)).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('should handle BOWLARD with no bowling frames', () => {
    const bowlardGame: Game = {
      id: 'bowlard-empty',
      type: GameType.BOWLARD,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Bowler',
          score: 0,
          ballsPocketed: [],
          isActive: false,
          bowlingFrames: []
        }
      ],
      currentPlayerIndex: 0,
      currentRack: 1,
      rackInProgress: false,
      totalRacks: 0,
      startTime: new Date(),
      endTime: new Date(),
      scoreHistory: [],
      shotHistory: []
    };

    render(
      <TestWrapper>
        <BowlardVictoryContent game={bowlardGame} />
      </TestWrapper>
    );

    // Should still render the victory screen
    expect(screen.getByText((_, node) => {
      return node?.textContent?.includes('ボーラード') ?? false;
    })).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should display bowling scoresheet with frame details', () => {
    const bowlardGameWithFrames: Game = {
      id: 'bowlard-detailed',
      type: GameType.BOWLARD,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Pro Bowler',
          score: 267,
          ballsPocketed: [],
          isActive: false,
          bowlingFrames: [
            // Strike in frame 1
            {
              frameNumber: 1,
              rolls: [10],
              score: 30,
              isComplete: true,
              isStrike: true,
              isSpare: false
            },
            // Spare in frame 2
            {
              frameNumber: 2,
              rolls: [7, 3],
              score: 50,
              isComplete: true,
              isStrike: false,
              isSpare: true
            },
            // Regular score in frame 3
            {
              frameNumber: 3,
              rolls: [8, 1],
              score: 59,
              isComplete: true,
              isStrike: false,
              isSpare: false
            }
          ]
        }
      ],
      currentPlayerIndex: 0,
      currentRack: 1,
      rackInProgress: false,
      totalRacks: 0,
      startTime: new Date('2023-01-01T10:00:00Z'),
      endTime: new Date('2023-01-01T10:45:00Z'),
      scoreHistory: [],
      shotHistory: []
    };

    render(
      <TestWrapper>
        <BowlardVictoryContent game={bowlardGameWithFrames} />
      </TestWrapper>
    );

    // Should display final score
    expect(screen.getByText('267')).toBeInTheDocument();
    
    // Should display frame numbers in scoresheet
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Should display game type
    expect(screen.getByText((_, node) => {
      return node?.textContent?.includes('ボーラード') ?? false;
    })).toBeInTheDocument();
  });

  it('should render bowling scoresheet for 10th frame with three rolls', () => {
    const bowlardWith10thFrame: Game = {
      id: 'bowlard-10th-frame',
      type: GameType.BOWLARD,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Bowler',
          score: 300,
          ballsPocketed: [],
          isActive: false,
          bowlingFrames: [
            // Frames 1-9 (all strikes)
            ...Array.from({ length: 9 }, (_, i) => ({
              frameNumber: i + 1,
              rolls: [10],
              score: 30 * (i + 1),
              isComplete: true,
              isStrike: true,
              isSpare: false
            })),
            // 10th frame with three strikes
            {
              frameNumber: 10,
              rolls: [10, 10, 10],
              score: 300,
              isComplete: true,
              isStrike: true,
              isSpare: false
            }
          ]
        }
      ],
      currentPlayerIndex: 0,
      currentRack: 1,
      rackInProgress: false,
      totalRacks: 0,
      startTime: new Date(),
      endTime: new Date(),
      scoreHistory: [],
      shotHistory: []
    };

    render(
      <TestWrapper>
        <BowlardVictoryContent game={bowlardWith10thFrame} />
      </TestWrapper>
    );

    // Should display perfect game score
    expect(screen.getByText('300')).toBeInTheDocument();
    
    // Should display all 10 frame numbers
    expect(screen.getByText('10')).toBeInTheDocument();
    
    // Should display game type
    expect(screen.getByText((_, node) => {
      return node?.textContent?.includes('ボーラード') ?? false;
    })).toBeInTheDocument();
  });

  it('should generate and display score progression chart for BOWLARD', () => {
    const bowlardWithChart: Game = {
      id: 'bowlard-chart',
      type: GameType.BOWLARD,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Chart Bowler',
          score: 180,
          ballsPocketed: [],
          isActive: false,
          bowlingFrames: [
            {
              frameNumber: 1,
              rolls: [10],
              score: 30,
              isComplete: true,
              isStrike: true,
              isSpare: false
            },
            {
              frameNumber: 2,
              rolls: [9, 1],
              score: 50,
              isComplete: true,
              isStrike: false,
              isSpare: true
            },
            {
              frameNumber: 3,
              rolls: [8, 2],
              score: 70,
              isComplete: true,
              isStrike: false,
              isSpare: true
            }
          ]
        }
      ],
      currentPlayerIndex: 0,
      currentRack: 1,
      rackInProgress: false,
      totalRacks: 0,
      startTime: new Date(),
      endTime: new Date(),
      scoreHistory: [],
      shotHistory: []
    };

    render(
      <TestWrapper>
        <BowlardVictoryContent game={bowlardWithChart} />
      </TestWrapper>
    );

    // Should display chart
    expect(screen.getByTestId('chart')).toBeInTheDocument();
    expect(screen.getByText('スコア推移')).toBeInTheDocument();
    
    // Should display final score
    expect(screen.getByText('180')).toBeInTheDocument();
  });

  it('should handle empty or incomplete bowling frames gracefully', () => {
    const bowlardIncomplete: Game = {
      id: 'bowlard-incomplete',
      type: GameType.BOWLARD,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Incomplete Bowler',
          score: 45,
          ballsPocketed: [],
          isActive: false,
          bowlingFrames: [
            // Incomplete frame - no score defined
            {
              frameNumber: 1,
              rolls: [10],
              score: undefined,
              isComplete: false,
              isStrike: true,
              isSpare: false
            }
          ]
        }
      ],
      currentPlayerIndex: 0,
      currentRack: 1,
      rackInProgress: false,
      totalRacks: 0,
      startTime: new Date(),
      endTime: new Date(),
      scoreHistory: [],
      shotHistory: []
    };

    render(
      <TestWrapper>
        <BowlardVictoryContent game={bowlardIncomplete} />
      </TestWrapper>
    );

    // Should display final score
    expect(screen.getByText('45')).toBeInTheDocument();
    
    // Should not display chart since there are no completed frames with scores
    expect(screen.queryByTestId('chart')).not.toBeInTheDocument();
    expect(screen.queryByText('スコア推移')).not.toBeInTheDocument();
  });
});