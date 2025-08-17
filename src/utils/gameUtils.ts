import type { Game } from '../types/index';
import { GameType } from '../types/index';

/**
 * ゲームが進行中かどうかを判定する
 * @param game ゲームオブジェクト
 * @returns ゲームが進行中の場合true
 */
export const isGameInProgress = (game: Game): boolean => {
  if (!game) return false;

  switch (game.type) {
    case GameType.SET_MATCH:
      // セットマッチ: いずれかのプレイヤーがセットを獲得している
      return game.players.some(player => (player.setsWon || 0) > 0);
      
    case GameType.ROTATION:
      // ローテーション: いずれかのプレイヤーがボールをポケットしている、またはスコアがある
      return game.players.some(player => 
        player.score > 0 || 
        (player.ballsPocketed && player.ballsPocketed.length > 0)
      );
      
    case GameType.BOWLARD:
      // ボーラード: ボーリングフレームが存在し、いずれかのフレームでロールが記録されている
      const player = game.players[0];
      if (!player.bowlingFrames || player.bowlingFrames.length === 0) {
        return false;
      }
      return player.bowlingFrames.some(frame => frame.rolls.length > 0);
      
    default:
      return false;
  }
};
