import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LanguageProvider } from '../contexts/LanguageContext';
import ChessClock from '../components/ChessClock';
import type { ChessClockSettings, Player } from '../types/index';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    {children}
  </LanguageProvider>
);

describe('Chess Clock State Debug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'scrollTo', {
      value: vi.fn(),
      writable: true
    });
  });

  const createChessClockSettings = (): ChessClockSettings => ({
    enabled: true,
    individualTime: false,
    timeLimit: 30,
    warningEnabled: true,
    warningTime: 5,
  });

  const createTestPlayers = (): Player[] => [
    {
      id: 'player-1',
      name: 'Player 1',
      score: 0,
      isActive: true,
      ballsPocketed: [],
    },
    {
      id: 'player-2',
      name: 'Player 2', 
      score: 0,
      isActive: false,
      ballsPocketed: [],
    }
  ];

  it('should log state changes when timer starts', () => {
    const chessClock = createChessClockSettings();
    const players = createTestPlayers();
    const mockOnTimeUp = vi.fn();
    const mockOnPlayerSelect = vi.fn();
    const mockOnStateChange = vi.fn((state: any) => {
      console.log('🔍 Chess Clock State Change:', {
        playerTimes: state.playerTimes.map((pt: any) => ({
          remainingTime: pt.remainingTime,
          isWarning: pt.isWarning,
          isTimeUp: pt.isTimeUp
        })),
        isRunning: state.isRunning,
        lastUpdateTime: state.lastUpdateTime
      });
    });
    
    console.log('=== CHESS CLOCK STATE DEBUG ===');
    
    render(
      <TestWrapper>
        <ChessClock
          chessClock={chessClock}
          players={players}
          currentPlayerIndex={0}
          onTimeUp={mockOnTimeUp}
          onPlayerSelect={mockOnPlayerSelect}
          onStateChange={mockOnStateChange}
        />
      </TestWrapper>
    );

    console.log('📊 Component rendered');
    
    // Check initial state
    const initialTimeDisplays = screen.getAllByText('30:00');
    console.log('📊 Initial time displays:', initialTimeDisplays.length);
    
    // Click start button
    const startButton = screen.getByTestId('PlayArrowIcon').closest('button');
    console.log('📊 Found start button:', !!startButton);
    
    if (startButton) {
      console.log('📊 Clicking start button...');
      fireEvent.click(startButton);
      
      // Check if pause icon appears
      const pauseIcon = screen.queryByTestId('PauseIcon');
      console.log('📊 Pause icon appears:', !!pauseIcon);
    }
    
    console.log('📊 Total state changes recorded:', mockOnStateChange.mock.calls.length);
    console.log('=== END STATE DEBUG ===');
    
    // Just pass the test - we're interested in the console logs
    expect(true).toBe(true);
  });
});