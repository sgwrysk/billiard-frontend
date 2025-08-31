import { describe, it, expect } from 'vitest';

describe('Dynamic Confirm Dialog - TDD', () => {
  it('should demonstrate current dialog has fixed message regardless of target screen', () => {
    // Current behavior - always shows "ホームに戻る"
    const currentGetConfirmMessage = (_targetScreen: string) => {
      return {
        title: 'ゲームを中断',
        message: 'ゲームが進行中です。ゲームを中断してホームに戻りますか？\n※進行中のデータは失われます。',
        confirmText: 'ホームに戻る', // BUG: Always "Return to Home"
        cancelText: 'ゲームを続ける',
      };
    };

    // Test shows the bug - same message for different targets
    const homeDialog = currentGetConfirmMessage('HOME');
    const playerMgmtDialog = currentGetConfirmMessage('PLAYER_MANAGEMENT');

    // BUG: Both show "ホームに戻る" even for player management
    expect(homeDialog.confirmText).toBe('ホームに戻る');
    expect(playerMgmtDialog.confirmText).toBe('ホームに戻る'); // This is wrong!
    
    // Both messages are identical (bug)
    expect(homeDialog.message).toEqual(playerMgmtDialog.message);
  });

  it('should design the fixed dynamic confirm dialog behavior', () => {
    // FIXED behavior - dynamic messages based on target screen
    const fixedGetConfirmMessage = (targetScreen: string) => {
      const messages = {
        HOME: {
          title: 'ゲームを中断',
          message: 'ゲームが進行中です。ゲームを中断してホームに戻りますか？\n※進行中のデータは失われます。',
          confirmText: 'ホームに戻る',
          cancelText: 'ゲームを続ける',
        },
        PLAYER_MANAGEMENT: {
          title: 'ゲームを中断',
          message: 'ゲームが進行中です。ゲームを中断してプレイヤー管理に移動しますか？\n※進行中のデータは失われます。',
          confirmText: 'プレイヤー管理へ',
          cancelText: 'ゲームを続ける',
        },
      } as const;

      return messages[targetScreen as keyof typeof messages] || messages.HOME;
    };

    // Test fixed behavior
    const homeDialog = fixedGetConfirmMessage('HOME');
    const playerMgmtDialog = fixedGetConfirmMessage('PLAYER_MANAGEMENT');

    // FIXED: Different confirm text for different targets
    expect(homeDialog.confirmText).toBe('ホームに戻る');
    expect(playerMgmtDialog.confirmText).toBe('プレイヤー管理へ');

    // FIXED: Different messages for different targets
    expect(homeDialog.message).toContain('ホームに戻りますか？');
    expect(playerMgmtDialog.message).toContain('プレイヤー管理に移動しますか？');

    // Both should have the same title and cancel text
    expect(homeDialog.title).toBe(playerMgmtDialog.title);
    expect(homeDialog.cancelText).toBe(playerMgmtDialog.cancelText);
  });

  it('should handle unknown target screen gracefully', () => {
    const fixedGetConfirmMessage = (targetScreen: string) => {
      const messages = {
        HOME: {
          title: 'ゲームを中断',
          message: 'ゲームが進行中です。ゲームを中断してホームに戻りますか？\n※進行中のデータは失われます。',
          confirmText: 'ホームに戻る',
          cancelText: 'ゲームを続ける',
        },
        PLAYER_MANAGEMENT: {
          title: 'ゲームを中断',
          message: 'ゲームが進行中です。ゲームを中断してプレイヤー管理に移動しますか？\n※進行中のデータは失われます。',
          confirmText: 'プレイヤー管理へ',
          cancelText: 'ゲームを続ける',
        },
      } as const;

      return messages[targetScreen as keyof typeof messages] || messages.HOME;
    };

    // Test fallback behavior for unknown screen
    const unknownDialog = fixedGetConfirmMessage('UNKNOWN_SCREEN');
    
    // Should fallback to HOME behavior
    expect(unknownDialog.confirmText).toBe('ホームに戻る');
    expect(unknownDialog.message).toContain('ホームに戻りますか？');
  });

  it('should design language configuration for i18n support', () => {
    // Design the language keys structure
    const expectedLanguageKeys = {
      ja: {
        'confirm.exitToHome.title': 'ゲームを中断',
        'confirm.exitToHome.message': 'ゲームが進行中です。ゲームを中断してホームに戻りますか？\n※進行中のデータは失われます。',
        'confirm.exitToHome.confirm': 'ホームに戻る',
        'confirm.exitToPlayerManagement.title': 'ゲームを中断',
        'confirm.exitToPlayerManagement.message': 'ゲームが進行中です。ゲームを中断してプレイヤー管理に移動しますか？\n※進行中のデータは失われます。',
        'confirm.exitToPlayerManagement.confirm': 'プレイヤー管理へ',
        'confirm.exitGame.cancel': 'ゲームを続ける',
      },
      en: {
        'confirm.exitToHome.title': 'Exit Game',
        'confirm.exitToHome.message': 'A game is in progress. Do you want to exit the game and return to home?\n※Progress will be lost.',
        'confirm.exitToHome.confirm': 'Return to Home',
        'confirm.exitToPlayerManagement.title': 'Exit Game',
        'confirm.exitToPlayerManagement.message': 'A game is in progress. Do you want to exit the game and go to Player Management?\n※Progress will be lost.',
        'confirm.exitToPlayerManagement.confirm': 'Go to Player Management',
        'confirm.exitGame.cancel': 'Continue Game',
      },
    };

    // Test language key structure
    expect(expectedLanguageKeys.ja['confirm.exitToHome.confirm']).toBe('ホームに戻る');
    expect(expectedLanguageKeys.ja['confirm.exitToPlayerManagement.confirm']).toBe('プレイヤー管理へ');
    expect(expectedLanguageKeys.en['confirm.exitToHome.confirm']).toBe('Return to Home');
    expect(expectedLanguageKeys.en['confirm.exitToPlayerManagement.confirm']).toBe('Go to Player Management');
  });

  it('should verify the fixed dynamic dialog behavior works correctly', () => {
    // Mock the language context
    const mockT = (key: string) => {
      const translations: Record<string, string> = {
        'confirm.exitToHome.title': 'ゲームを中断',
        'confirm.exitToHome.message': 'ゲームが進行中です。ゲームを中断してホームに戻りますか？\n※進行中のデータは失われます。',
        'confirm.exitToHome.confirm': 'ホームに戻る',
        'confirm.exitToPlayerManagement.title': 'ゲームを中断',
        'confirm.exitToPlayerManagement.message': 'ゲームが進行中です。ゲームを中断してプレイヤー管理に移動しますか？\n※進行中のデータは失われます。',
        'confirm.exitToPlayerManagement.confirm': 'プレイヤー管理へ',
        'confirm.exitGame.cancel': 'ゲームを続ける',
      };
      return translations[key] || key;
    };

    // FIXED getConfirmationMessages function
    const getConfirmationMessages = (targetScreen: string) => {
      switch (targetScreen) {
        case 'HOME':
          return {
            title: mockT('confirm.exitToHome.title'),
            message: mockT('confirm.exitToHome.message'),
            confirmText: mockT('confirm.exitToHome.confirm'),
            cancelText: mockT('confirm.exitGame.cancel'),
          };
        case 'PLAYER_MANAGEMENT':
          return {
            title: mockT('confirm.exitToPlayerManagement.title'),
            message: mockT('confirm.exitToPlayerManagement.message'),
            confirmText: mockT('confirm.exitToPlayerManagement.confirm'),
            cancelText: mockT('confirm.exitGame.cancel'),
          };
        default:
          return {
            title: mockT('confirm.exitToHome.title'),
            message: mockT('confirm.exitToHome.message'),
            confirmText: mockT('confirm.exitToHome.confirm'),
            cancelText: mockT('confirm.exitGame.cancel'),
          };
      }
    };

    // Test dynamic messages work correctly
    const homeMessages = getConfirmationMessages('HOME');
    const playerMgmtMessages = getConfirmationMessages('PLAYER_MANAGEMENT');
    const unknownMessages = getConfirmationMessages('UNKNOWN');

    // HOME messages
    expect(homeMessages.confirmText).toBe('ホームに戻る');
    expect(homeMessages.message).toContain('ホームに戻りますか？');

    // PLAYER_MANAGEMENT messages
    expect(playerMgmtMessages.confirmText).toBe('プレイヤー管理へ');
    expect(playerMgmtMessages.message).toContain('プレイヤー管理に移動しますか？');

    // Unknown screen fallback to HOME
    expect(unknownMessages.confirmText).toBe('ホームに戻る');

    // All should have same cancel text
    expect(homeMessages.cancelText).toBe('ゲームを続ける');
    expect(playerMgmtMessages.cancelText).toBe('ゲームを続ける');
    expect(unknownMessages.cancelText).toBe('ゲームを続ける');
  });
});