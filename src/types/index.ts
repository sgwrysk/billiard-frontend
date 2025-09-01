// Player information type definition
export interface Player {
  id: string;
  name: string;
  score: number;
  ballsPocketed: number[];
  isActive: boolean;
  targetScore?: number; // Target score for Rotation game (handicap feature)
  targetSets?: number; // Target sets for Set Match game (handicap feature)
  setsWon?: number; // Sets won in Set Match game
  bowlingFrames?: BowlingFrame[]; // Bowling frames for Bowlard game
}

// Bowling frame type definition for Bowlard game
export interface BowlingFrame {
  frameNumber: number;
  rolls: number[]; // Array of pin counts for each roll (max 2 for frames 1-9, max 3 for frame 10)
  score?: number; // Cumulative score up to this frame
  isStrike: boolean;
  isSpare: boolean;
  isComplete: boolean;
}

// Chess clock settings type definition
export interface ChessClockSettings {
  enabled: boolean;
  individualTime: boolean; // Whether each player has different time limits
  timeLimit: number; // Time limit in minutes
  warningEnabled: boolean; // Whether warning time is enabled
  warningTime: number; // Warning time in minutes
  player1TimeLimit?: number; // Individual time limit for player 1 (minutes)
  player2TimeLimit?: number; // Individual time limit for player 2 (minutes)
}

// Chess clock time state for preserving remaining time
export interface ChessClockState {
  playerTimes: {
    remainingTime: number; // Remaining time in seconds
    isWarning: boolean;
    isTimeUp: boolean;
  }[];
  isRunning: boolean; // Whether timer is currently running
  lastUpdateTime: number; // Timestamp of last update
}


// Game type enumeration
export const GameType = {
  SET_MATCH: 'SET_MATCH',
  ROTATION: 'ROTATION',
  BOWLARD: 'BOWLARD',
  JAPAN: 'JAPAN',
} as const;

export type GameType = typeof GameType[keyof typeof GameType];

// Game status enumeration
export const GameStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED',
  COMPLETED: 'COMPLETED',
} as const;

export type GameStatus = typeof GameStatus[keyof typeof GameStatus];

// Game information type definition
export interface Game {
  id: string;
  type: GameType;
  status: GameStatus;
  players: Player[];
  currentPlayerIndex: number;
  startTime: Date;
  endTime?: Date;
  winner?: string;
  totalRacks: number;
  currentRack: number;
  rackInProgress: boolean; // Whether current rack is in progress
  shotHistory: Shot[]; // Shot history
  scoreHistory: ScoreHistory[]; // Score progression history
  chessClock?: ChessClockSettings; // Chess clock settings
  chessClockState?: ChessClockState; // Chess clock time state for preservation
  japanSettings?: import('./japan').JapanGameSettings; // Japan game settings
  japanRackHistory?: import('./japan').JapanRackResult[]; // Japan game rack history
  japanPlayerOrderHistory?: import('./japan').JapanPlayerOrder[]; // Japan player order history for different periods
  japanCurrentMultiplier?: number; // Current multiplier value (default: 1)
}

// Shot information type definition
export interface Shot {
  playerId: string;
  ballNumber: number;
  isSunk: boolean;
  isFoul: boolean;
  timestamp: Date;
  customData?: Record<string, unknown>; // For game-specific data
}

// Score history type definition
export interface ScoreHistory {
  playerId: string;
  score: number;
  timestamp: Date;
  ballNumber?: number;
}

// Notifications types
export type NotificationCategory = 'feature' | 'bugfix' | 'upcoming';

export interface Notification {
  id: string;
  date: string; // YYYY-MM-DD format
  category: NotificationCategory;
  content: {
    ja: string;
    en: string;
  };
}

export interface NotificationData {
  notifications: Notification[];
}


