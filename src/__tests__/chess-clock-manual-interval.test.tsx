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

  it('should verify timer setup and interval registration', () => {
    const chessClock = createChessClockSettings();
    const players = createTestPlayers();
    const mockOnTimeUp = vi.fn();
    const mockOnPlayerSelect = vi.fn();
    const mockOnStateChange = vi.fn();

    // Mock timers
    const mockSetInterval = vi.fn(() => 123 as unknown as NodeJS.Timeout);
    const mockClearInterval = vi.fn();
    
    vi.spyOn(globalThis, 'setInterval').mockImplementation(mockSetInterval);
    vi.spyOn(globalThis, 'clearInterval').mockImplementation(mockClearInterval);
    
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

    // Verify timer is not started initially
    expect(mockSetInterval).not.toHaveBeenCalled();

    // Click start button
    const startButton = screen.getByTestId('PlayArrowIcon').closest('button');
    fireEvent.click(startButton!);

    // Verify setInterval was called with correct delay (optimized for battery)
    expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 500);
    expect(mockSetInterval).toHaveBeenCalledTimes(1);

    // Verify pause button appears (timer is running)
    expect(screen.getByTestId('PauseIcon')).toBeInTheDocument();
    
    // Click pause button
    const pauseButton = screen.getByTestId('PauseIcon').closest('button');
    fireEvent.click(pauseButton!);

    // Verify clearInterval was called
    expect(mockClearInterval).toHaveBeenCalledWith(123);
    
    // Verify start button appears again
    expect(screen.getByTestId('PlayArrowIcon')).toBeInTheDocument();
  });
});