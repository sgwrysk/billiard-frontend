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

  it('should debug timer initialization and countdown with mocked time', async () => {
    const chessClock = createChessClockSettings();
    const players = createTestPlayers();
    const mockOnTimeUp = vi.fn();
    const mockOnPlayerSelect = vi.fn();
    const mockOnStateChange = vi.fn();
    
    console.log('=== CHESS CLOCK TIMER DEBUG TEST ===');
    
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

    // Verify chess clock renders
    expect(screen.getByTestId('PlayArrowIcon')).toBeInTheDocument();
    
    // Initial state: timer should show 30:00 for both players
    const initialTimeDisplays = screen.getAllByText('30:00');
    expect(initialTimeDisplays).toHaveLength(2);
    console.log('✓ Initial time displays found:', initialTimeDisplays.length);
    
    // Find and click start button
    const startButton = screen.getByTestId('PlayArrowIcon').closest('button');
    expect(startButton).toBeInTheDocument();
    
    console.log('📌 Clicking start button...');
    
    await act(async () => {
      fireEvent.click(startButton!);
    });

    // After clicking start, should show pause icon
    await waitFor(() => {
      const pauseIcon = screen.queryByTestId('PauseIcon');
      expect(pauseIcon).toBeInTheDocument();
      console.log('✓ Pause icon appears - timer should be running');
    });

    // Check onStateChange was called
    console.log('📊 onStateChange calls:', mockOnStateChange.mock.calls.length);
    console.log('📊 Latest state:', mockOnStateChange.mock.calls[mockOnStateChange.mock.calls.length - 1]?.[0]);

    // Advance time by 2 seconds
    console.log('⏰ Advancing time by 2000ms...');
    
    await act(async () => {
      vi.advanceTimersByTime(2000); // Advance by 2 seconds
    });

    // Wait for UI to update
    await waitFor(() => {
      const allTimeTexts = screen.getAllByText(/\d{2}:\d{2}/);
      console.log('📊 Time displays after 2s:', allTimeTexts.map(el => el.textContent));
      
      // Check if any display shows 29:58 (2 seconds less)
      const hasDecrementedTime = allTimeTexts.some(element => {
        const timeText = element.textContent;
        return timeText === '29:58';
      });
      
      console.log('📊 Has decremented to 29:58:', hasDecrementedTime);
      
      if (!hasDecrementedTime) {
        // Check for any time different from 30:00
        const hasAnyChange = allTimeTexts.some(element => {
          const timeText = element.textContent;
          return timeText && timeText !== '30:00';
        });
        console.log('📊 Has any time change:', hasAnyChange);
      }
      
      // For debugging, let's check if timer is actually running by checking state changes
      console.log('📊 Total onStateChange calls:', mockOnStateChange.mock.calls.length);
      
      return true; // Always return true to see the logs
    });

    // Additional debugging: advance more time
    console.log('⏰ Advancing another 5000ms...');
    
    await act(async () => {
      vi.advanceTimersByTime(5000); // Advance by 5 more seconds (total 7s)
    });

    await waitFor(() => {
      const allTimeTexts = screen.getAllByText(/\d{2}:\d{2}/);
      console.log('📊 Time displays after total 7s:', allTimeTexts.map(el => el.textContent));
      
      // Should show 29:53 after 7 seconds
      const hasSevenSecondDecrease = allTimeTexts.some(element => {
        const timeText = element.textContent;
        return timeText === '29:53';
      });
      
      console.log('📊 Has decremented to 29:53 after 7s:', hasSevenSecondDecrease);
      console.log('📊 Final onStateChange calls:', mockOnStateChange.mock.calls.length);
      
      return true;
    });

    console.log('=== END DEBUG TEST ===');
  });

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
    const hasCorrectInterval = intervalCalls.some((call: any[]) => call[1] === 100);
    console.log('📊 Has setInterval with 100ms:', hasCorrectInterval);

    if (intervalCalls.length > 0) {
      console.log('📊 setInterval calls details:', intervalCalls.map((call: any[]) => ({ interval: call[1] })));
    }

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
    
    console.log('=== END INTERVAL DEBUG TEST ===');
  });
});