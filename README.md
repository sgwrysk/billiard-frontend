# 🎱 Billiard Frontend

A modern billiard score management application built with React + TypeScript + Material-UI.

## 🌐 Live Demo

🚀 **[Try it now!](https://billiard-frontend.onrender.com)**

## 🚀 Features

### Game Types
- **Set Match**: Simple set counting game (first to reach target sets wins)
- **Rotation**: Ball numbers equal points, target specific score to win (120, 180, 240 points)  
- **Bowlard**: Bowling-style game played with billiard balls (10 frames, strikes and spares)

### Core Features
- 👥 **2-Player Games**: All games support exactly 2 players
- 🎯 **Real-time Scoring**: Live score updates during gameplay
- 🔄 **Undo Function**: Correct mistakenly entered scores
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

### Rotation Game
- Ball numbers equal points (1 ball = 1 point, 15 ball = 15 points)
- Target specific scores (120, 180, 240 points)
- Player-specific target scores for handicaps
- Re-racking when all 15 balls are pocketed
- Score progression graph on victory screen

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
- **Deployment**: Render (Static Site)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm

### Local Development
```bash
# Clone the repository
git clone https://github.com/sgwrysk/billiard_frontend.git
cd billiard_frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 How to Use

### 1. Game Setup
1. Select game type (Set Match or Rotation)
2. Enter player names (default: Player 1, Player 2)
3. Set target (sets for Set Match, points for Rotation)
4. Use preset buttons for common targets
5. Click "Start Game"

### 2. Set Match Gameplay
1. Click on player info to add a set
2. Use "Undo" button to correct mistakes
3. Game ends when a player reaches target sets

### 3. Rotation Gameplay
1. Click pocketed ball numbers to add points
2. Game automatically re-racks after all 15 balls
3. Use "Undo" button to correct ball entries
4. Game ends when a player reaches target score

### 4. Bowlard Gameplay
1. Enter number of pins knocked down for each roll
2. Game automatically calculates strikes and spares
3. Play 10 frames with up to 2 rolls per frame (3 for frame 10)
4. Game ends after completing all 10 frames

### 5. Victory Screen
- Displays game statistics and winner
- Shows score progression graph (Rotation) or set history table (Set Match)
- Offers rematch with same settings
- Tracks cumulative wins per player

### 6. Language Support
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

## 🎯 Future Enhancements

- Database integration for persistent game history
- Additional game modes
- Tournament bracket support
- Advanced statistics and analytics
- Social features and player profiles

---

🎱 **Enjoy playing billiards!**