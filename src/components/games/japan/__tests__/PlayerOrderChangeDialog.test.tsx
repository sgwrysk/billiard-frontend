import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { LanguageProvider } from '../../../../contexts/LanguageContext';
import PlayerOrderChangeDialog from '../PlayerOrderChangeDialog';
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

describe('PlayerOrderChangeDialog', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnEndGame = vi.fn();

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
    shotHistory: [
      // Some previous rack shots
      {
        playerId: 'player-1',
        ballNumber: 5,
        isSunk: true,
        isFoul: false,
        timestamp: new Date(),
        customData: { type: 'ball_click', points: 1 }
      },
      {
        playerId: 'player-2',
        ballNumber: 9,
        isSunk: true,
        isFoul: false,
        timestamp: new Date(),
        customData: { type: 'ball_click', points: 2 }
      },
      // Rack complete shot
      {
        playerId: 'player-1',
        ballNumber: 0,
        isSunk: false,
        isFoul: false,
        timestamp: new Date(),
        customData: { type: 'rack_complete' }
      },
      // Current rack shots - player-3 scored last
      {
        playerId: 'player-1',
        ballNumber: 5,
        isSunk: true,
        isFoul: false,
        timestamp: new Date(),
        customData: { type: 'ball_click', points: 1 }
      },
      {
        playerId: 'player-3',
        ballNumber: 9,
        isSunk: true,
        isFoul: false,
        timestamp: new Date(),
        customData: { type: 'ball_click', points: 2 }
      }
    ],
    scoreHistory: [],
    japanSettings: defaultSettings
  };

  const defaultProps = {
    open: true,
    players: mockGame.players,
    currentRack: mockGame.currentRack,
    game: mockGame,
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
    onEndGame: mockOnEndGame
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display dialog when open', () => {
    renderWithProviders(<PlayerOrderChangeDialog {...defaultProps} />);
    
    expect(screen.getAllByText('順替え')).toHaveLength(2); // Title and button
    expect(screen.getByText('次のラックの一番目のプレイヤーを選択してください')).toBeInTheDocument();
  });

  it('should display all players as options', () => {
    renderWithProviders(<PlayerOrderChangeDialog {...defaultProps} />);
    
    expect(screen.getByText('プレイヤーA')).toBeInTheDocument();
    expect(screen.getByText('プレイヤーB')).toBeInTheDocument();
    expect(screen.getByText('プレイヤーC')).toBeInTheDocument();
  });

  it('should default to last scorer in current rack', () => {
    renderWithProviders(<PlayerOrderChangeDialog {...defaultProps} />);
    
    // Player-3 was the last to score in current rack, should be selected by default
    const player3Radio = screen.getByDisplayValue('player-3');
    expect(player3Radio).toBeChecked();
  });

  it('should display game end button', () => {
    renderWithProviders(<PlayerOrderChangeDialog {...defaultProps} />);
    
    expect(screen.getByText('ゲーム終了')).toBeInTheDocument();
  });

  it('should call onEndGame when game end button is clicked', () => {
    renderWithProviders(<PlayerOrderChangeDialog {...defaultProps} />);
    
    const gameEndButton = screen.getByText('ゲーム終了');
    fireEvent.click(gameEndButton);
    
    expect(mockOnEndGame).toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', () => {
    renderWithProviders(<PlayerOrderChangeDialog {...defaultProps} />);
    
    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should call onConfirm with selected player when confirm button is clicked', () => {
    renderWithProviders(<PlayerOrderChangeDialog {...defaultProps} />);
    
    // Select a different player
    const player1Radio = screen.getByDisplayValue('player-1');
    fireEvent.click(player1Radio);
    
    const confirmButton = screen.getByRole('button', { name: '順替え' });
    fireEvent.click(confirmButton);
    
    expect(mockOnConfirm).toHaveBeenCalledWith('player-1');
  });

  it('should fallback to first player if no shots found in current rack', () => {
    const gameWithNoCurrentRackShots = {
      ...mockGame,
      shotHistory: [
        // Only previous rack shots, no current rack shots
        {
          playerId: 'player-1',
          ballNumber: 5,
          isSunk: true,
          isFoul: false,
          timestamp: new Date(),
          customData: { type: 'ball_click', points: 1 }
        },
        {
          playerId: 'player-2',
          ballNumber: 0,
          isSunk: false,
          isFoul: false,
          timestamp: new Date(),
          customData: { type: 'rack_complete' }
        }
        // No current rack shots
      ]
    };

    renderWithProviders(
      <PlayerOrderChangeDialog 
        {...defaultProps} 
        game={gameWithNoCurrentRackShots} 
      />
    );
    
    // Should default to first player (player-1)
    const player1Radio = screen.getByDisplayValue('player-1');
    expect(player1Radio).toBeChecked();
  });
});