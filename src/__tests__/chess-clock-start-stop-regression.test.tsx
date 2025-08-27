import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LanguageProvider } from '../contexts/LanguageContext';
import ChessClock from '../components/ChessClock';
import type { ChessClockSettings, Player } from '../types/index';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    {children}
  </LanguageProvider>
);

describe('Chess Clock Start/Stop Button Regression Test', () => {
  // Mock window.scrollTo to avoid test warnings
  const mockScrollTo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'scrollTo', {
      value: mockScrollTo,
      writable: true
    });
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

  it('should reproduce chess clock start/stop button not working issue', async () => {
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

    // Verify chess clock renders
    expect(screen.getByTestId('PlayArrowIcon')).toBeInTheDocument();
    
    // Find the start/stop button
    const startButton = screen.getByTestId('PlayArrowIcon').closest('button');
    expect(startButton).toBeInTheDocument();
    
    // Initial state: timer should show 30:00 for both players
    const timeDisplays = screen.getAllByText('30:00');
    expect(timeDisplays).toHaveLength(2);
    
    console.log('Initial state - Start button found:', !!startButton);
    console.log('Initial time displays:', timeDisplays.length);
    
    // Click start button
    if (startButton) {
      fireEvent.click(startButton);
      
      // After clicking start, should show pause icon
      await waitFor(() => {
        const pauseIcon = screen.queryByTestId('PauseIcon');
        console.log('After start click - Pause icon found:', !!pauseIcon);
        expect(pauseIcon).toBeInTheDocument();
      }, { timeout: 1000 });
      
      // Wait a bit and check if time has decremented
      await waitFor(() => {
        // Check if any time display shows less than 30:00
        const allTimeTexts = screen.getAllByText(/\d{2}:\d{2}/);
        const hasDecrementedTime = allTimeTexts.some(element => {
          const timeText = element.textContent;
          return timeText && timeText !== '30:00';
        });
        
        console.log('After waiting - Time texts found:', allTimeTexts.map(el => el.textContent));
        console.log('Has decremented time:', hasDecrementedTime);
        
        // This should pass if timer is working
        expect(hasDecrementedTime).toBe(true);
      }, { timeout: 2000 });
      
    } else {
      throw new Error('Start button not found');
    }
  });

  it('should verify chess clock state change callback is called', async () => {
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

    // Find and click start button
    const startButton = screen.getByTestId('PlayArrowIcon').closest('button');
    
    if (startButton) {
      fireEvent.click(startButton);
      
      // Verify onStateChange callback was called
      await waitFor(() => {
        console.log('onStateChange call count:', mockOnStateChange.mock.calls.length);
        expect(mockOnStateChange).toHaveBeenCalled();
      }, { timeout: 1000 });
    }
  });

  it('should verify chess clock player button functionality', async () => {
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

    // Find player buttons by looking for player names
    const player1Button = screen.getByText('Player 1').closest('button');
    const player2Button = screen.getByText('Player 2').closest('button');
    
    expect(player1Button).toBeInTheDocument();
    expect(player2Button).toBeInTheDocument();
    
    // Click player 1 button (should switch to player 2)
    if (player1Button) {
      fireEvent.click(player1Button);
      
      await waitFor(() => {
        console.log('onPlayerSelect call count:', mockOnPlayerSelect.mock.calls.length);
        expect(mockOnPlayerSelect).toHaveBeenCalledWith(1); // Should switch to player 2 (index 1)
      });
    }
  });
});