/**
 * Application-wide color constants and style settings
 * Common colors and font settings to achieve consistent design
 */

/**
 * Common style settings used throughout the app
 */
export const AppStyles = {
  // Monospace font settings for number display
  // Used for times, scores, pin counts, etc. where uniform number width is desired
  monoFont: {
    fontFamily: '"Courier New", Courier, "Lucida Console", Monaco, monospace',
  },
} as const;

export const AppColors = {
  // Neutral colors
  neutral: {
    // Basic background color (number buttons, score table background, etc.)
    background: '#f5f5f5',
    // Basic text color
    text: '#333333',
    // Border color
    border: '#ddd',
  },

  // Colors expressing disappointment/failure
  disappointment: {
    // Background color (gutter, miss, etc.)
    background: '#e0e0e0',
    // Text color
    text: '#666666',
  },

  // Colors expressing success/emphasis (gradual)
  success: {
    // Mild success (spare, etc.)
    mild: {
      background: '#f0f4f8', // Gray with a slight blue tint added
      text: '#1976d2',       // Title-based blue color
    },
    // Strong success (strike, etc.)
    strong: {
      background: '#e8f2fd', // Stronger blue tint than spare
      text: '#1565c0',       // Darker blue color
    },
  },

  // App theme colors (from existing theme)
  theme: {
    primary: '#1976d2',      // Main blue color
    primaryLight: '#42a5f5', // Light blue color
    primaryDark: '#1565c0',  // Dark blue color
    secondary: '#ffc107',    // Gold accent
    secondaryLight: '#fff350', // Light gold
    secondaryDark: '#c79100',  // Dark gold
  },

  // Chess clock colors
  chessClock: {
    activePlayer: '#d4e4f7',      // Low-brightness blue for active player
    activePlayerHover: '#e8f2fd', // Bowlard strike color (on mouse over)
  },

  // Shadow/effects
  effects: {
    shadow: {
      light: 'rgba(0,0,0,0.1)',
      medium: 'rgba(0,0,0,0.15)',
      dark: 'rgba(0,0,0,0.2)',
    },
  },
} as const;

/**
 * Color settings for Bowlard game
 * Define Bowlard-specific colors using AppColors
 */
export const BowlardColors = {
  // Number buttons
  number: {
    background: AppColors.neutral.background,
    text: AppColors.neutral.text,
  },
  // Gutter/miss
  gutter: {
    background: AppColors.disappointment.background,
    text: AppColors.disappointment.text,
  },
  // Spare
  spare: {
    background: AppColors.success.mild.background,
    text: AppColors.success.mild.text,
  },
  // Strike
  strike: {
    background: AppColors.success.strong.background,
    text: AppColors.success.strong.text,
  },
} as const;


/**
 * Common color settings for UI elements
 * Borders, shadows, hover effects, etc.
 */
export const UIColors = {
  // Borders and frames
  border: {
    light: '#e0e0e0',    // Light gray border
    medium: '#ddd',      // Medium gray border
    dark: '#333',        // Dark gray border
  },
  
  // Background colors
  background: {
    white: 'white',
    lightGray: '#f5f5f5',
    mediumGray: '#ddd',
    disabled: '#999',
    success: '#e8f5e8',  // Success/completion state background color
    default: '#f8fafc',  // App default background
    paper: '#ffffff',    // Paper/card background
  },
  
  // Text colors
  text: {
    black: '#000',
    darkGray: '#333',
    mediumGray: '#666',
    lightGray: '#999',
    white: 'white',
  },
  
  // Hover effects
  hover: {
    lightBackground: '#f5f5f5',
    shadow: '0 8px 16px rgba(0,0,0,0.15)',
  },
  
  // Shadow effects
  shadow: {
    light: '0 2px 4px rgba(0,0,0,0.1)',
    medium: '0 2px 8px rgba(0,0,0,0.1)',
    strong: '0 4px 12px rgba(0,0,0,0.15)',
    inset: 'inset 0 1px 3px rgba(0,0,0,0.2)',
  },
  
  // Chart/graph colors
  chart: {
    playerColors: ['#2196F3', '#F44336', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4'],
    primary: '#2196F3',
    primaryBackground: '#2196F320',
  },
} as const;

/**
 * Color settings for other games can be defined similarly
 * Example: Color settings for Set Match, Rotation
 */
export const GameColors = {
  // Player selected state
  playerSelected: {
    background: AppColors.theme.primary,
    text: 'white',
    border: `3px solid ${AppColors.theme.primary}`,
  },
  // Player unselected state
  playerUnselected: {
    background: UIColors.background.white,
    text: AppColors.neutral.text,
    border: `1px solid ${UIColors.border.light}`,
  },
  // Victory/success state
  victory: {
    background: AppColors.success.strong.background,
    text: AppColors.success.strong.text,
  },
  // Reach state (one set away from victory)
  reach: {
    background: '#ffebee', // Light red background
    text: '#d32f2f',       // Dark red text
    border: '#d32f2f',     // Dark red border
  },
} as const;

/**
 * Chess clock color settings
 * Colors to visually represent time management states
 */
export const ChessClockColors = {
  // Chess clock overall background color (light gray like Bowlard inning table)
  background: UIColors.background.lightGray,
  
  // Player button colors
  player: {
    // Default state (inactive) - grayish feel
    default: {
      background: UIColors.background.lightGray,
      text: UIColors.text.mediumGray,
      border: `1px solid ${UIColors.border.medium}`,
      hover: '#e0e0e0', // Darker gray
    },
    // Active player (selected) - using low-brightness blue
    active: {
      background: AppColors.chessClock.activePlayer,
      text: AppColors.success.strong.text,
      border: `1px solid ${AppColors.chessClock.activePlayer}`,
    },
    // Warning state (when warning time is exceeded)
    warning: {
      background: AppColors.theme.secondary, // Gold accent
      text: 'white',
      border: `1px solid ${AppColors.theme.secondary}`,
      hover: '#f57c00', // Darker orange color
    },
    // Time up state
    timeUp: {
      background: '#d32f2f', // Red color (time up)
      text: 'white',
      border: `1px solid #d32f2f`,
      hover: '#b71c1c', // Darker red color
    },
  },
  
  // Start/stop button colors
  control: {
    start: {
      background: '#4caf50', // Green color (start)
      text: 'white',
      hover: '#388e3c',
    },
    stop: {
      background: '#f44336', // Red color (stop)
      text: 'white',
      hover: '#d32f2f',
    },
  },
} as const;
