# 🎱 Billiard Frontend

A modern billiard score management application built with React + TypeScript + Material-UI.

[🌐 日本語版 README](README.ja.md)

## 🌐 Live Demo

🚀 **[Try it now!](https://billiard-frontend.onrender.com)**

## 🚀 Features

### Game Types
- **Set Match**: Simple set counting game (first to reach target sets wins)
- **Rotation**: Ball numbers equal points, target specific score to win (120, 180, 240 points)  
- **Bowlard**: Bowling-style game played with billiard balls (10 frames, strikes and spares)
- **Japan Rule (BETA)**: Multi-player handicap game with rotating player order
  - Support for 2-10 players with customizable handicap balls (default: 5, 9)
  - Point multiplication system for strategic scoring (1x to 100x multiplier)
  - Cumulative scoring across multiple racks with detailed history tracking
  - Automatic player order rotation every configurable number of racks (default: 10)
  - Advanced undo functionality with cross-rack support
  - Real-time cumulative points table with rack-by-rack breakdown

### Core Features
- 👥 **2-Player Games**: All games support exactly 2 players
- 🎯 **Real-time Scoring**: Live score updates during gameplay
- 🔄 **Undo Function**: Correct mistakenly entered scores
- ⏰ **Chess Clock**: Optional time management with individual player timers and warning alerts
- 🔄 **Player Swapping**: Switch player positions during gameplay
- 🎲 **Alternating Break**: Optional alternating break shots for fair play
- 🏆 **Victory Screen**: Celebrate wins with game statistics
- 📊 **Game History**: View past game results
- 🌍 **Internationalization**: Japanese/English language support
- 📱 **Responsive Design**: Works on mobile, tablet, and desktop
- 🎨 **Authentic Ball Design**: Realistic billiard ball colors and styling

### Set Match Game
- Simple set counting (e.g., first to 5 sets wins)
- Player-specific handicaps (e.g., Player 1 needs 5 sets, Player 2 needs 4 sets)
- Large scoreboard-style display
- Set history table showing which player won each set
- Alternating break functionality
- Player position swapping during gameplay

### Rotation Game
- Ball numbers equal points (1 ball = 1 point, 15 ball = 15 points)
- Target specific scores (120, 180, 240 points)
- Player-specific target scores for handicaps
- Re-racking when all 15 balls are pocketed
- Score progression graph on victory screen
- Player position swapping during gameplay

### Bowlard Game
- Bowling-style scoring system with billiard ball aesthetics
- 10 frames per game with strikes and spares
- Pin input interface with bowling terminology
- Frame-by-frame scoring display with cumulative totals
- Perfect mobile-responsive design with CSS Grid layout

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Library**: Material-UI (MUI) with Deep Blue theme
- **Build Tool**: Vite
- **State Management**: React Hooks + Context API
- **Charts**: Chart.js + react-chartjs-2
- **Internationalization**: Custom i18n context
- **Testing**: Vitest + React Testing Library (380+ tests, 90%+ coverage)
- **Deployment**: Render (Static Site)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm

### Local Development
```bash
# Clone the repository
git clone https://github.com/sgwrysk/billiard-frontend.git
cd billiard-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 How to Use

### 1. Game Setup
1. Select game type (Set Match, Rotation, Bowlard, or Japan Rule)
2. Enter player names (2-10 players for Japan Rule, 2 players for others)
3. Set target (sets for Set Match, points for Rotation, frames for Bowlard)
4. For Japan Rule: Configure handicap balls and player order rotation interval
5. Use preset buttons for common targets
6. Configure optional chess clock with time limits and warnings
7. Enable alternating break for Set Match (optional)
8. Click "Start Game"

### 2. Set Match Gameplay
1. Click on player info to add a set
2. Use "Undo" button to correct mistakes
3. Use "Swap Players" button to change player positions
4. Chess clock automatically switches between players (if enabled)
5. Game ends when a player reaches target sets

### 3. Rotation Gameplay
1. Click pocketed ball numbers to add points
2. Game automatically re-racks after all 15 balls
3. Use "Undo" button to correct ball entries
4. Use "Swap Players" button to change player positions
5. Game ends when a player reaches target score

### 4. Bowlard Gameplay
1. Enter number of pins knocked down for each roll
2. Game automatically calculates strikes and spares
3. Play 10 frames with up to 2 rolls per frame (3 for frame 10)
4. Game ends after completing all 10 frames

### 5. Japan Rule Gameplay
1. Click handicap ball numbers (configurable, default: 5, 9) to score points
2. Use multiplier input to apply strategic point multiplication (1x-100x)
3. Click "Next Rack" to complete current rack and advance to next
4. Player order automatically rotates based on configured interval
5. View cumulative points across all completed racks
6. Advanced undo supports cross-rack corrections
7. Game continues indefinitely until manually ended

### 6. Chess Clock Features (Optional)
- Individual time limits for each player
- Configurable warning time alerts
- Visual indicators for active player and time remaining
- Automatic switching between players
- Time up notifications

### 7. Victory Screen
- Displays game statistics and winner
- Shows score progression graph (Rotation) or set history table (Set Match)
- Displays final time remaining (if chess clock was used)
- Offers rematch with same settings
- Tracks cumulative wins per player

### 8. Language Support
- Switch between Japanese/English on home screen
- All UI text and player names are translated

## 🎨 Design Features

### Authentic Billiard Balls
- **Perfect Circles**: All balls are perfectly round
- **Realistic Colors**: Standard billiard ball color scheme
- **Stripe Design**: Balls 9-15 feature authentic stripe patterns
- **White Number Background**: Numbers displayed on white circles for visibility
- **Hover Effects**: Subtle scaling without color changes

### Color Pairs
- 1 & 9: Gold Yellow
- 2 & 10: Cornflower Blue  
- 3 & 11: Light Red
- 4 & 12: Plum Purple
- 5 & 13: Peach Orange
- 6 & 14: Light Green
- 7 & 15: Peru Brown
- 8: Black

### UI Theme
- **Deep Blue Theme**: Professional sports-oriented design
- **Outfit Font**: Modern, clean typography
- **Responsive Layout**: Optimized for all screen sizes
- **Intuitive Navigation**: Clear visual hierarchy and user flow

## 🔧 Customization

### Adding Game Types
Extend `src/types/index.ts` and implement logic in `src/hooks/useGame.ts`

### UI Theme Customization
Modify Material-UI theme in `src/App.tsx`

### Internationalization
Add translations in `src/contexts/LanguageContext.tsx`

### Ball Design
Customize ball colors and styling in `getBallColor()` functions

### Code Comments
All code comments must be written in **English only** to maintain consistency and readability for international contributors.

## 🌐 Deployment

This app is deployed as a static site on Render with automatic deployments from the main branch.

### Deployment Configuration
- **Platform**: Render Static Site
- **Build Command**: `npm ci && npm run build`
- **Publish Directory**: `dist`
- **Auto Deploy**: Enabled
- **SPA Routing**: Configured with `_redirects` file

## 📄 License

MIT License

## 🤝 Contributing

Bug reports and feature requests are welcome! Please use GitHub Issues.

### Development Guidelines
- **Code Comments**: All code comments must be written in **English only**
- **Commit Messages**: All commit messages must be written in **English only**
- **Testing**: Maintain 90%+ test coverage with comprehensive test suites

## 📁 Architecture

### Japan Rule Components
The Japan Rule game mode includes extensive specialized components:

#### UI Components (`src/components/games/japan/`)
- `JapanGameScreen.tsx` - Main game interface with player panels and multiplier controls
- `JapanGameSettings.tsx` - Handicap ball configuration and rotation settings
- `JapanCumulativePointsTable.tsx` - Real-time cumulative scoring table
- `JapanBoard.tsx` - Game board layout and ball interaction
- `JapanScoreInput.tsx` - Point input and multiplier interface
- `PlayerOrderChangeDialog.tsx` - Player order rotation management

#### Game Engine (`src/games/japan/`)
- `JapanEngine.ts` - Core game logic and state management
- `JapanScoreCalculator.ts` - Point calculation and rack scoring logic
- `JapanUndoHandler.ts` - Advanced undo functionality with cross-rack support
- `PlayerOrderCalculator.ts` - Player rotation and ordering logic

#### Type Definitions (`src/types/`)
- `japan.ts` - TypeScript interfaces for Japan Rule specific data structures

#### Comprehensive Testing
- 30+ dedicated test files covering all Japan Rule functionality
- Component tests, engine tests, and integration tests
- Cross-rack undo scenarios, multiplayer order changes, and edge cases

## 🧪 Testing

This project includes comprehensive test coverage:

### Test Framework
- **Vitest**: Fast and modern test runner
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Additional matchers

### Coverage
- **400+ Tests**: Comprehensive test suite including extensive Japan Rule testing
- **90%+ Coverage**: High code coverage across components, hooks, and utilities
- **Component Tests**: All UI components thoroughly tested, including Japan Rule components
- **Game Engine Tests**: Complete coverage of Japan Rule game logic and calculations
- **Utility Tests**: Complete coverage of utility functions
- **Integration Tests**: Game flow and user interaction tests
- **Japan Rule Speciality Tests**: Cross-rack undo, multiplayer scenarios, and edge cases

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## 🎯 Future Enhancements

- Database integration for persistent game history
- Additional game modes
- Tournament bracket support
- Advanced statistics and analytics
- Social features and player profiles
- Multiplayer online support

---

🎱 **Enjoy playing billiards!**