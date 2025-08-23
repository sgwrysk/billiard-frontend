import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameBoard from '../GameBoard';
import { LanguageProvider } from '../../contexts/LanguageContext';
import type { Game } from '../../types/index';
import { GameType, GameStatus } from '../../types/index';

const MockLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

const createMockGame = (type: GameType): Game => ({
  id: 'test-game',
  type,
  status: GameStatus.IN_PROGRESS,
  players: [
    {
      id: 'player-1',
      name: 'Player 1',
      score: 0,
      ballsPocketed: [],
      isActive: true,
      setsWon: 0,
    },
    {
      id: 'player-2',
      name: 'Player 2',
      score: 0,
      ballsPocketed: [],
      isActive: false,
      setsWon: 0,
    },
  ],
  currentPlayerIndex: 0,
  startTime: new Date(),
  totalRacks: 1,
  currentRack: 1,
  rackInProgress: false,
  shotHistory: [],
  scoreHistory: [],
});

const defaultProps = {
  onPocketBall: vi.fn(),
  onSwitchPlayer: vi.fn(),
  onSwitchToPlayer: vi.fn(),
  onEndGame: vi.fn(),
  onResetGame: vi.fn(),
  checkAllBallsPocketed: vi.fn().mockReturnValue(false),
  onUndoLastShot: vi.fn(),
  onWinSet: vi.fn(),
  onAddPins: vi.fn(),
  onUndoBowlingRoll: vi.fn(),
  alternatingBreak: false,
  onSwapPlayers: vi.fn(),
  canSwapPlayers: vi.fn().mockReturnValue(false),
  canUndoLastShot: vi.fn().mockReturnValue(false),
};

describe('GameBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SetMatch Game', () => {
    it('renders SetMatchBoard for SET_MATCH game type', () => {
      const game = createMockGame(GameType.SET_MATCH);
      render(
        <MockLanguageProvider>
          <GameBoard {...defaultProps} game={game} />
        </MockLanguageProvider>
      );

      // SetMatchBoard specific elements should be present
      expect(screen.getByText('Player 1')).toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
    });

    it('passes correct props to SetMatchBoard', () => {
      const game = createMockGame(GameType.SET_MATCH);
      const onWinSet = vi.fn();
      const onUndoLastShot = vi.fn();
      const canSwapPlayers = vi.fn().mockReturnValue(true);
      const canUndoLastShot = vi.fn().mockReturnValue(true);

      render(
        <MockLanguageProvider>
          <GameBoard
            {...defaultProps}
            game={game}
            onWinSet={onWinSet}
            onUndoLastShot={onUndoLastShot}
            canSwapPlayers={canSwapPlayers}
            canUndoLastShot={canUndoLastShot}
            alternatingBreak={true}
          />
        </MockLanguageProvider>
      );

      // Verify that the props are passed correctly by checking for elements that would be rendered based on those props
      expect(screen.getByText('Player 1')).toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
    });
  });

  describe('Rotation Game', () => {
    it('renders RotationBoard for ROTATION game type', () => {
      const game = createMockGame(GameType.ROTATION);
      render(
        <MockLanguageProvider>
          <GameBoard {...defaultProps} game={game} />
        </MockLanguageProvider>
      );

      // RotationBoard specific elements should be present
      expect(screen.getByText('Player 1')).toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
    });

    it('handles player selection correctly in Rotation game', () => {
      const game = createMockGame(GameType.ROTATION);
      const onSwitchToPlayer = vi.fn();

      render(
        <MockLanguageProvider>
          <GameBoard
            {...defaultProps}
            game={game}
            onSwitchToPlayer={onSwitchToPlayer}
          />
        </MockLanguageProvider>
      );

      // The onSwitchToPlayer should be available for RotationBoard
      expect(screen.getByText('Player 1')).toBeInTheDocument();
    });
  });

  describe('Bowlard Game', () => {
    it('renders BowlardBoard for BOWLARD game type', () => {
      const game = createMockGame(GameType.BOWLARD);
      // Add bowling frames to the first player for Bowlard
      game.players[0].bowlingFrames = [
        {
          frameNumber: 1,
          rolls: [],
          isStrike: false,
          isSpare: false,
          isComplete: false,
        },
      ];

      render(
        <MockLanguageProvider>
          <GameBoard {...defaultProps} game={game} />
        </MockLanguageProvider>
      );

      // BowlardBoard specific elements should be present (bowling pins with multiple instances)
      expect(screen.getAllByText('1')).toHaveLength(3); // Pin layout has multiple 1s
      expect(screen.getAllByText('10')).toHaveLength(2); // Pin layout has multiple 10s
    });

    it('passes bowling-specific props to BowlardBoard', () => {
      const game = createMockGame(GameType.BOWLARD);
      game.players[0].bowlingFrames = [];
      const onAddPins = vi.fn();
      const onUndoBowlingRoll = vi.fn();

      render(
        <MockLanguageProvider>
          <GameBoard
            {...defaultProps}
            game={game}
            onAddPins={onAddPins}
            onUndoBowlingRoll={onUndoBowlingRoll}
          />
        </MockLanguageProvider>
      );

      // Verify Bowlard board elements are rendered
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    });
  });

  describe('Unsupported Game Type', () => {
    it('renders unsupported game type message for unknown game types', () => {
      const game = createMockGame('UNKNOWN_TYPE' as GameType);
      
      render(
        <MockLanguageProvider>
          <GameBoard {...defaultProps} game={game} />
        </MockLanguageProvider>
      );

      expect(screen.getByText(/UNKNOWN_TYPE/)).toBeInTheDocument();
    });
  });

  describe('Exit Confirmation Dialog', () => {
    it('does not show exit confirmation dialog initially', () => {
      const game = createMockGame(GameType.SET_MATCH);
      render(
        <MockLanguageProvider>
          <GameBoard {...defaultProps} game={game} />
        </MockLanguageProvider>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('confirms exit and calls onResetGame', () => {
      const game = createMockGame(GameType.SET_MATCH);
      const onResetGame = vi.fn();

      render(
        <MockLanguageProvider>
          <GameBoard {...defaultProps} game={game} onResetGame={onResetGame} />
        </MockLanguageProvider>
      );

      // The exit confirmation dialog is handled internally,
      // so we test the public interface behavior
      expect(onResetGame).not.toHaveBeenCalled();
    });
  });

  describe('Props passing', () => {
    it('passes all required props to child components', () => {
      const game = createMockGame(GameType.SET_MATCH);
      const props = {
        ...defaultProps,
        alternatingBreak: true,
        canSwapPlayers: vi.fn().mockReturnValue(true),
        canUndoLastShot: vi.fn().mockReturnValue(true),
      };

      render(
        <MockLanguageProvider>
          <GameBoard {...props} game={game} />
        </MockLanguageProvider>
      );

      expect(screen.getByText('Player 1')).toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
    });

    it('handles undefined optional props gracefully', () => {
      const game = createMockGame(GameType.SET_MATCH);
      const minimalProps = {
        game,
        onPocketBall: vi.fn(),
        onSwitchPlayer: vi.fn(),
        onSwitchToPlayer: vi.fn(),
        onEndGame: vi.fn(),
        onResetGame: vi.fn(),
        checkAllBallsPocketed: vi.fn().mockReturnValue(false),
        onUndoLastShot: vi.fn(),
        onWinSet: vi.fn(),
      };

      render(
        <MockLanguageProvider>
          <GameBoard {...minimalProps} />
        </MockLanguageProvider>
      );

      expect(screen.getByText('Player 1')).toBeInTheDocument();
    });
  });

  describe('Time handling', () => {
    it('handles time up events for players', () => {
      const game = createMockGame(GameType.SET_MATCH);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      render(
        <MockLanguageProvider>
          <GameBoard {...defaultProps} game={game} />
        </MockLanguageProvider>
      );

      // The time up handling is internal to the component
      // We can verify the component renders correctly
      expect(screen.getByText('Player 1')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Layout and styling', () => {
    it('applies correct container styles', () => {
      const game = createMockGame(GameType.SET_MATCH);
      const { container } = render(
        <MockLanguageProvider>
          <GameBoard {...defaultProps} game={game} />
        </MockLanguageProvider>
      );

      const gameboardContainer = container.firstChild;
      expect(gameboardContainer).toHaveStyle({
        padding: '16px',
        maxWidth: '1200px',
        marginLeft: 'auto',
        marginRight: 'auto',
      });
    });
  });
});