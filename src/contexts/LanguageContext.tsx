import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { storage } from '../utils/storageUtils';

export type Language = 'ja' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

interface Translation {
  [key: string]: string;
}

interface Translations {
  ja: Translation;
  en: Translation;
}

const translations: Translations = {
  ja: {
    // Home screen
    'app.title': 'ビリヤードスコア',
    'home.newGame': '新しいゲーム',
    'language.japanese': '日本語',
    'language.english': 'English',
    'language.select': '言語選択',
    
    // Menu
    'menu.scoreInput': 'スコア入力',
    'menu.settings': '設定',
    'menu.buyMeCoffee': '開発者にコーヒーをおごる',

    // Game setup
    'setup.title': '新しいゲーム',
    'setup.gameType': 'ゲームタイプ',
    'setup.gameType.setmatch': 'セットマッチ',
    'setup.gameType.rotation': 'ローテーション',
    'setup.gameType.bowlard': 'ボーラード',

    'setup.players': 'プレイヤー',
    'setup.player': 'プレイヤー',
    'setup.playerName': 'プレイヤー名',
    'setup.targetScore': '目標得点',
    'setup.targetSets': '目標セット数',
    'setup.sets': 'セット',
    'setup.addPlayer': 'プレイヤー追加',
    'setup.removePlayer': 'プレイヤー削除',
    'setup.startGame': 'ゲーム開始',
    'setup.back': '戻る',
    'setup.alternatingBreak': '交互ブレイク',

    // Chess clock settings
    'setup.chessClock.enabled': 'チェスクロック',
    'setup.chessClock.title': 'チェスクロック設定',
    'setup.chessClock.individualTime': 'プレイヤー別に設定',
    'setup.chessClock.timeLimit': '制限時間',
    'setup.chessClock.warningEnabled': '警告時間を設定する（デフォルト3分）',
    'setup.chessClock.warningTime': '警告時間',
    'setup.chessClock.minutes': '分',

    // Game rules
    'rules.nineball': '1番から9番までのボールを順番に狙い、9番ボールを入れた人が勝利',
    'rules.rotation': 'ボール番号がそのまま得点となり、目標得点に最初に到達した人が勝利',

    // Game board
    'game.currentPlayer': '現在のプレイヤー',
    'game.score': '得点',
    'game.remaining': '残り',
    'game.target': '目標',
    'game.targetSets': 'セット数',
    'game.balls': 'ボール',
    'game.ballSelect': 'ポケットしたボール',
    'game.rack': 'ラック',
    'game.totalRacks': '総ラック数',
    'game.playing': 'プレイ中',
    'game.clickToSelect': 'クリックして選択',
    'game.nextRack': '🎉 次のラックへ 🎉',
    'game.undo': '取り消し',
    'game.complete': '完了',
    'game.switchPlayer': 'プレイヤー交代',
    'game.backToHome': 'ホームに戻る',
    'game.swapPlayers': 'プレイヤー入れ替え',
    'game.break': 'ブレイク',
    'game.start': 'スタート',
    'game.pause': '一時停止',
    'game.unsupportedGameType': 'サポートされていないゲームタイプ',
    'game.pocketedBalls': 'ポケットしたボール',
    'game.setMatchActions': 'セット勝利',
    'game.winSet': 'セット勝利',
    
    // Bowlard game
    'bowlard.frame': 'フレーム',
    'bowlard.roll': '投球',
    'bowlard.pins': 'ピン',
    'bowlard.strike': 'ストライク',
    'bowlard.spare': 'スペア',
    'bowlard.total': '合計',
    'bowlard.enterPins': 'ピン数を入力',
    'bowlard.frameComplete': 'フレーム完了',
    'bowlard.scoreSheet': 'スコアシート',


    // Victory screen
    'victory.title': '{winner} さんの勝利！',
    'victory.congratulations': 'おめでとうございます！',
    'victory.gameResult': 'ゲーム結果',
    'victory.gameType': 'ゲームタイプ',
    'victory.playTime': 'プレイ時間',
    'victory.totalRacks': '総ラック数',
    'victory.finalScore': '最終スコア',
    'victory.scoreProgression': 'スコア推移',
    'victory.setHistory': 'セット獲得履歴',
    'victory.player': 'プレイヤー',
    'victory.pocketedBalls': 'ポケットしたボール',
    'victory.noBalls': 'ポケットしたボールなし',
    'victory.rematch': '再戦する',
    'victory.backToMenu': 'メニューに戻る',
    'victory.minutes': '分',
    'victory.points': '点',
    'victory.wins': '勝',
    'victory.gameEnd': 'ゲーム終了',
    'victory.unknown': '不明',



    // Common
    'common.back': '戻る',
    'common.start': 'スタート',
    'common.cancel': 'キャンセル',
    'common.ok': 'OK',
    'common.yes': 'はい',
    'common.no': 'いいえ',
    'common.confirm': '確認',
    
    // Confirm dialogs
    'confirm.exitGame.title': 'ゲームを中断',
    'confirm.exitGame.message': 'ゲームが進行中です。ゲームを中断してホームに戻りますか？\n※進行中のデータは失われます。',
    'confirm.exitGame.confirm': 'ホームに戻る',
    'confirm.exitGame.cancel': 'ゲームを続ける',
  },
  en: {
    // Home screen
    'app.title': 'Billiard Score',
    'home.newGame': 'New Game',
    'language.japanese': '日本語',
    'language.english': 'English',
    'language.select': 'Language Selection',
    
    // Menu
    'menu.scoreInput': 'Score Input',
    'menu.settings': 'Settings',
    'menu.buyMeCoffee': 'Buy Coffee for Developer',

    // Game setup
    'setup.title': 'New Game',
    'setup.gameType': 'Game Type',
    'setup.gameType.setmatch': 'Set Match',
    'setup.gameType.rotation': 'Rotation',
    'setup.gameType.bowlard': 'Bowlard',

    'setup.players': 'Players',
    'setup.player': 'Player',
    'setup.playerName': 'Player Name',
    'setup.targetScore': 'Target Score',
    'setup.targetSets': 'Target Sets',
    'setup.sets': 'Sets',
    'setup.addPlayer': 'Add Player',
    'setup.removePlayer': 'Remove Player',
    'setup.startGame': 'Start Game',
    'setup.back': 'Back',
    'setup.alternatingBreak': 'Alternating Break',

    // Chess clock settings
    'setup.chessClock.enabled': 'Chess Clock',
    'setup.chessClock.title': 'Chess Clock Settings',
    'setup.chessClock.individualTime': 'Individual Settings',
    'setup.chessClock.timeLimit': 'Time Limit',
    'setup.chessClock.warningEnabled': 'Set warning time (default 3 minutes)',
    'setup.chessClock.warningTime': 'Warning Time',
    'setup.chessClock.minutes': 'min',

    // Game rules
    'rules.nineball': 'Aim for balls 1-9 in order, the player who pockets the 9-ball wins',
    'rules.rotation': 'Ball numbers equal points, the first player to reach the target score wins',

    // Game board
    'game.currentPlayer': 'Current Player',
    'game.score': 'Score',
    'game.remaining': 'Remaining',
    'game.target': 'Target',
    'game.targetSets': 'Sets',
    'game.balls': 'Balls',
    'game.ballSelect': 'Pocketed Balls',
    'game.rack': 'Rack',
    'game.totalRacks': 'Total Racks',
    'game.playing': 'Playing',
    'game.clickToSelect': 'Click to Select',
    'game.nextRack': '🎉 Next Rack 🎉',
    'game.undo': 'Undo',
    'game.complete': 'Complete',
    'game.switchPlayer': 'Switch Player',
    'game.backToHome': 'Back to Home',
    'game.swapPlayers': 'Swap Players',
    'game.break': 'Break',
    'game.start': 'Start',
    'game.pause': 'Pause',
    'game.unsupportedGameType': 'Unsupported Game Type',
    'game.pocketedBalls': 'Pocketed Balls',
    'game.setMatchActions': 'Set Victory',
    'game.winSet': 'Win Set',
    
    // Bowlard game
    'bowlard.frame': 'Frame',
    'bowlard.roll': 'Roll',
    'bowlard.pins': 'Pins',
    'bowlard.strike': 'Strike',
    'bowlard.spare': 'Spare',
    'bowlard.total': 'Total',
    'bowlard.enterPins': 'Enter Pins',
    'bowlard.frameComplete': 'Frame Complete',


    // Victory screen
    'victory.title': '{winner} Wins!',
    'victory.congratulations': 'Congratulations!',
    'victory.gameResult': 'Game Result',
    'victory.gameType': 'Game Type',
    'victory.playTime': 'Play Time',
    'victory.totalRacks': 'Total Racks',
    'victory.finalScore': 'Final Score',
    'victory.scoreProgression': 'Score Progression',
    'victory.setHistory': 'Set History',
    'victory.player': 'Player',
    'victory.pocketedBalls': 'Pocketed Balls',
    'victory.noBalls': 'No balls pocketed',
    'victory.rematch': 'Rematch',
    'victory.backToMenu': 'Back to Menu',
    'victory.minutes': 'min',
    'victory.points': 'pts',
    'victory.wins': 'wins',
    'victory.gameEnd': 'Game End',
    'victory.unknown': 'Unknown',



    // Common
    'common.back': 'Back',
    'common.start': 'Start',
    'common.cancel': 'Cancel',
    'common.ok': 'OK',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.confirm': 'Confirm',
    
    // Confirm dialogs
    'confirm.exitGame.title': 'Exit Game',
    'confirm.exitGame.message': 'A game is in progress. Do you want to exit the game and return to home?\n※Progress will be lost.',
    'confirm.exitGame.confirm': 'Return to Home',
    'confirm.exitGame.cancel': 'Continue Game',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ja');

  // Load saved language from localStorage
  useEffect(() => {
    const savedLanguage = storage.getString('billiard-language', 'ja') as Language;
    if (savedLanguage === 'ja' || savedLanguage === 'en') {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when changed
  useEffect(() => {
    storage.setString('billiard-language', language);
  }, [language]);

  const t = (key: string, params?: Record<string, string>): string => {
    let text = translations[language][key] || key;
    
    // Replace parameters in translation text
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, value);
      });
    }
    
    return text;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
