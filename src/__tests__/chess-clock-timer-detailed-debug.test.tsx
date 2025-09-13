import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LanguageProvider } from '../contexts/LanguageContext';
import ChessClock from '../components/ChessClock';
import type { ChessClockSettings, Player } from '../types/index';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    {children}
  </LanguageProvider>
);

describe('Chess Clock Timer Detailed Debug', () => {
  // Mock window.scrollTo to avoid test warnings
  const mockScrollTo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'scrollTo', {
      value: mockScrollTo,
      writable: true
    });
    
    // Mock Date.now to control time progression
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createChessClockSettings = (): ChessClockSettings => ({
    enabled: true,
    individualTime: false,
    timeLimit: 30, // 30 minutes
    warningEnabled: true,
    warningTime: 5, // 5 minutes warning
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

  it('should verify basic timer functionality without time advance', async () => {
    // Use real timers for this test to avoid fake timer conflicts
    vi.useRealTimers();
    
    const chessClock = createChessClockSettings();
    const players = createTestPlayers();
    const mockOnTimeUp = vi.fn();
    const mockOnPlayerSelect = vi.fn();
    const mockOnStateChange = vi.fn();
    
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

    // Verify initial state
    expect(screen.getByTestId('PlayArrowIcon')).toBeInTheDocument();
    const initialTimeDisplays = screen.getAllByText('30:00');
    expect(initialTimeDisplays).toHaveLength(2);
    
    // Click start button
    const startButton = screen.getByTestId('PlayArrowIcon').closest('button');
    fireEvent.click(startButton!);

    // Verify timer started (pause icon appears)
    await waitFor(() => {
      expect(screen.getByTestId('PauseIcon')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Verify onStateChange was called with running state
    await waitFor(() => {
      expect(mockOnStateChange).toHaveBeenCalled();
    }, { timeout: 1000 });
    
    const lastCall = mockOnStateChange.mock.calls[mockOnStateChange.mock.calls.length - 1];
    expect(lastCall[0]).toMatchObject({
      isRunning: true,
      playerTimes: expect.arrayContaining([
        expect.objectContaining({
          remainingTime: 1800, // 30 minutes in seconds
          isWarning: false,
          isTimeUp: false
        })
      ])
    });

    // Click pause to stop timer
    const pauseButton = screen.getByTestId('PauseIcon').closest('button');
    fireEvent.click(pauseButton!);

    // Verify timer stopped (start icon appears)
    await waitFor(() => {
      expect(screen.getByTestId('PlayArrowIcon')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Restore fake timers for other tests
    vi.useFakeTimers();
  }, 10000);

  it('should check if setInterval is being called correctly', async () => {
    const chessClock = createChessClockSettings();
    const players = createTestPlayers();
    const mockOnTimeUp = vi.fn();
    const mockOnPlayerSelect = vi.fn();
    const mockOnStateChange = vi.fn();

    // Spy on setInterval to see if it's being called
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

    console.log('=== INTERVAL DEBUG TEST ===');
    
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

    console.log('📊 Initial setInterval calls:', setIntervalSpy.mock.calls.length);

    const startButton = screen.getByTestId('PlayArrowIcon').closest('button');
    
    await act(async () => {
      fireEvent.click(startButton!);
    });

    console.log('📊 After start click - setInterval calls:', setIntervalSpy.mock.calls.length);
    console.log('📊 After start click - clearInterval calls:', clearIntervalSpy.mock.calls.length);

    // Check if setInterval was called with 100ms interval
    const intervalCalls = setIntervalSpy.mock.calls;
    const hasCorrectInterval = intervalCalls.some((call: [TimerHandler, number?, ...unknown[]]) => call[1] === 100);
    console.log('📊 Has setInterval with 100ms:', hasCorrectInterval);

    if (intervalCalls.length > 0) {
      console.log('📊 setInterval calls details:', intervalCalls.map((call: [TimerHandler, number?, ...unknown[]]) => ({ interval: call[1] })));
    }

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
    
    console.log('=== END INTERVAL DEBUG TEST ===');
  });
});