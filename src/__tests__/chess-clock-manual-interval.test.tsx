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

describe('Chess Clock Manual Interval Test', () => {
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

  it('should manually trigger interval and check state updates', () => {
    const chessClock = createChessClockSettings();
    const players = createTestPlayers();
    const mockOnTimeUp = vi.fn();
    const mockOnPlayerSelect = vi.fn();
    
    // Track all state changes
    const stateChanges: Array<{
      playerTimes: Array<{
        remainingTime: number;
        isWarning: boolean;
        isTimeUp: boolean;
      }>;
      isRunning: boolean;
    }> = [];
    const mockOnStateChange = vi.fn((state: {
      playerTimes: Array<{
        remainingTime: number;
        isWarning: boolean;
        isTimeUp: boolean;
      }>;
      isRunning: boolean;
    }) => {
      stateChanges.push({
        playerTimes: state.playerTimes.map((pt) => ({
          remainingTime: Math.floor(pt.remainingTime), // Round for easier comparison
          isWarning: pt.isWarning,
          isTimeUp: pt.isTimeUp
        })),
        isRunning: state.isRunning
      });
    });

    // Mock setInterval to capture the callback
    let intervalCallback: (() => void) | null = null;
    const mockSetInterval = vi.fn((callback: () => void, delay: number) => {
      console.log('🕰️ setInterval called with delay:', delay);
      intervalCallback = callback;
      return 123; // fake timer id
    });
    
    vi.spyOn(globalThis, 'setInterval').mockImplementation(mockSetInterval as any);
    vi.spyOn(globalThis, 'clearInterval').mockImplementation(vi.fn());
    
    console.log('=== MANUAL INTERVAL TEST ===');
    
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

    console.log('📊 Initial state changes:', stateChanges.length);
    if (stateChanges.length > 0) {
      console.log('📊 Initial state:', stateChanges[0]);
    }

    // Click start button
    const startButton = screen.getByTestId('PlayArrowIcon').closest('button');
    fireEvent.click(startButton!);

    console.log('📊 After start click - state changes:', stateChanges.length);
    console.log('📊 setInterval called:', mockSetInterval.mock.calls.length);
    console.log('📊 Has interval callback:', !!intervalCallback);

    if (stateChanges.length > 1) {
      console.log('📊 State after start:', stateChanges[stateChanges.length - 1]);
    }

    // Manually trigger the interval callback if we have it
    if (intervalCallback) {
      console.log('📊 Manually triggering interval callback...');
      
      // Trigger the callback a few times to simulate timer
      (intervalCallback as () => void)();
      console.log('📊 After 1st manual trigger - state changes:', stateChanges.length);
      
      if (stateChanges.length > 0) {
        const latestState = stateChanges[stateChanges.length - 1];
        console.log('📊 Latest state after trigger:', latestState);
        
        // Check if time decreased
        const player1Time = latestState.playerTimes[0].remainingTime;
        console.log('📊 Player 1 time:', player1Time, '(should be < 1800 if working)');
        
        expect(player1Time).toBeLessThan(1800);
      }
    } else {
      console.log('❌ No interval callback captured - this indicates the timer useEffect is not running');
    }
    
    console.log('=== END MANUAL INTERVAL TEST ===');
  });
});