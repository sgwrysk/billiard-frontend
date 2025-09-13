/* eslint-disable react-refresh/only-export-components */
// Common test utilities and helpers
import React from 'react';
import { vi } from 'vitest';
import { GameType, GameStatus, type Game, type Player, type ChessClockSettings } from '../../types/index';
import { LanguageProvider } from '../../contexts/LanguageContext';

// Mock Chart.js for VictoryScreen tests - move this to individual test files

// Test wrapper component
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

// Mock functions factory
export const createMockFunctions = () => ({
  mockOnWinSet: vi.fn(),
  mockOnUndoLastShot: vi.fn(),
  mockOnSwapPlayers: vi.fn(),
  mockOnPocketBall: vi.fn(),
  mockOnSwitchPlayer: vi.fn(),
  mockOnSwitchToPlayer: vi.fn(),
  mockOnEndGame: vi.fn(),
  mockOnResetGame: vi.fn(),
  mockOnAddPins: vi.fn(),
  mockOnUndoBowlingRoll: vi.fn(),
  mockOnRematch: vi.fn(),
  mockOnBackToMenu: vi.fn(),
  mockOnTimeUp: vi.fn(),
  mockOnPlayerSelect: vi.fn(),
});

// Base player factory
export const createBasePlayer = (overrides: Partial<Player> = {}): Player => ({
  id: 'player-1',
  name: 'Test Player',
  score: 0,
  setsWon: 0,
  targetSets: 5,
  targetScore: 61,
  isActive: false,
  ballsPocketed: [],
  ...overrides
});

// Base game factory
export const createBaseGame = (gameType: GameType, overrides: Partial<Game> = {}): Game => ({
  id: 'test-game',
  type: gameType,
  status: GameStatus.IN_PROGRESS,
  currentPlayerIndex: 0,
  currentRack: 1,
  rackInProgress: false,
  totalRacks: 1,
  startTime: new Date('2023-01-01T10:00:00Z'),
  endTime: undefined,
  scoreHistory: [],
  shotHistory: [],
  players: [
    createBasePlayer({ id: 'player-1', name: 'Player 1', isActive: true }),
    createBasePlayer({ id: 'player-2', name: 'Player 2' }),
  ],
  ...overrides
});

// SetMatch specific game factory
export const createSetMatchGame = (overrides: Partial<Game> = {}): Game => 
  createBaseGame(GameType.SET_MATCH, overrides);

// Rotation specific game factory  
export const createRotationGame = (overrides: Partial<Game> = {}): Game =>
  createBaseGame(GameType.ROTATION, overrides);

// Bowlard specific game factory
export const createBowlardGame = (overrides: Partial<Game> = {}): Game =>
  createBaseGame(GameType.BOWLARD, {
    players: [createBasePlayer({ id: 'player-1', name: 'Player 1', isActive: true })],
    ...overrides
  });

// Chess clock settings factory
export const createChessClockSettings = (overrides: Partial<ChessClockSettings> = {}): ChessClockSettings => ({
  enabled: true,
  individualTime: false,
  timeLimit: 5,
  warningEnabled: true,
  warningTime: 1,
  player1TimeLimit: 5,
  player2TimeLimit: 5,
  ...overrides
});

// Common DOM query helpers
export const getPlayerCard = (playerName: string) => {
  const element = document.querySelector(`[data-testid="${playerName}-card"]`) ||
                  Array.from(document.querySelectorAll('.MuiCard-root'))
                    .find(card => card.textContent?.includes(playerName));
  return element;
};

export const getButton = (text: string) => {
  const element = Array.from(document.querySelectorAll('button'))
    .find(button => button.textContent?.includes(text));
  return element;
};

// Wait for async operations
export const waitForRender = () => new Promise(resolve => setTimeout(resolve, 0));