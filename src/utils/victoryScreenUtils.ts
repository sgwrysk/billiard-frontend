import { GameType } from '../types/index';
import type { Game } from '../types/index';

// Get game type display label
export const getGameTypeLabel = (type: GameType, t: (key: string) => string) => {
  switch (type) {
    case GameType.SET_MATCH:
      return t('setup.gameType.setMatch');
    case GameType.ROTATION:
      return t('setup.gameType.rotation');
    case GameType.BOWLARD:
      return t('setup.gameType.bowlard');
    case GameType.JAPAN:
      return t('setup.gameType.japan');
    default:
      return type;
  }
};

// Calculate game duration from start and end times
export const getGameDuration = (game: Game, language: string): { minutes: number; seconds: number; formatted: string } | string => {
  if (!game.endTime) return language === 'en' ? 'Unknown' : '不明';
  const duration = game.endTime.getTime() - game.startTime.getTime();
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  
  return {
    minutes,
    seconds,
    formatted: language === 'en' ? `${minutes}m ${seconds}s` : `${minutes}分${seconds}秒`
  };
};

// Generate base chart options for victory screen charts
export const getBaseChartOptions = (t: (key: string) => string, game: Game) => ({
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
      display: game.type !== GameType.BOWLARD, // Hide legend for single-player Bowlard
    },
    title: {
      display: true,
      text: t('victory.scoreProgression'),
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: t('game.score'),
      },
    },
    x: {
      title: {
        display: true,
        text: game.type === GameType.BOWLARD ? 'Frame' 
             : game.type === GameType.ROTATION ? 'Inning'
             : game.type === GameType.JAPAN ? 'Rack'
             : 'Shot',
      },
    },
  },
});