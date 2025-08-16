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

// Player statistics type definition
export interface PlayerStats {
  name: string;
  totalWins: number;
  totalGames: number;
}

// Game type enumeration
export const GameType = {
  SET_MATCH: 'SET_MATCH',
  ROTATION: 'ROTATION',
  BOWLARD: 'BOWLARD',
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
}

// Shot information type definition
export interface Shot {
  playerId: string;
  ballNumber: number;
  isSunk: boolean;
  isFoul: boolean;
  timestamp: Date;
}

// Score history type definition
export interface ScoreHistory {
  playerId: string;
  score: number;
  timestamp: Date;
  ballNumber?: number;
}

// Game history type definition
export interface GameHistory {
  game: Game;
  shots: Shot[];
}
