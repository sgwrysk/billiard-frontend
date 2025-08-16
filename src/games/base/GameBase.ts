import type { Game, Player, Shot, GameType } from '../../types/index';

export interface IGameEngine {
  /** ゲームタイプ */
  getGameType(): GameType;
  
  /** プレイヤーを初期化 */
  initializePlayers(playerSetups: {name: string, targetScore?: number, targetSets?: number}[]): Player[];
  
  /** ボールポケット処理 */
  handlePocketBall(game: Game, ballNumber: number): Game;
  
  /** プレイヤー交代処理 */
  handleSwitchPlayer(game: Game): Game;
  
  /** 勝利条件チェック */
  checkVictoryCondition(game: Game): { isGameOver: boolean; winnerId?: string };
  
  /** ゲーム固有の処理があるかチェック */
  hasCustomLogic(): boolean;
  
  /** ゲーム固有処理 */
  handleCustomAction?(game: Game, action: string, data?: any): Game;
  
  /** 使用するボール番号を取得 */
  getBallNumbers(): number[];
  
  /** アクション取り消し処理 */
  handleUndo(game: Game): Game;
}

export abstract class GameBase implements IGameEngine {
  abstract getGameType(): GameType;
  abstract getBallNumbers(): number[];
  
  initializePlayers(playerSetups: {name: string, targetScore?: number, targetSets?: number}[]): Player[] {
    return playerSetups.map((setup, index) => ({
      id: `player-${index + 1}`,
      name: setup.name,
      score: 0,
      ballsPocketed: [],
      isActive: index === 0,
      targetScore: setup.targetScore,
      targetSets: setup.targetSets,
    }));
  }
  
  abstract handlePocketBall(game: Game, ballNumber: number): Game;
  abstract handleSwitchPlayer(game: Game): Game;
  abstract checkVictoryCondition(game: Game): { isGameOver: boolean; winnerId?: string };
  
  hasCustomLogic(): boolean {
    return false;
  }
  
  handleUndo(game: Game): Game {
    // デフォルトのUndo処理（最後のshotHistoryを削除）
    if (game.shotHistory.length === 0) return game;
    
    const lastShot = game.shotHistory[game.shotHistory.length - 1];
    const updatedGame = { ...game };
    
    // shotHistoryから最後のエントリを削除
    updatedGame.shotHistory = updatedGame.shotHistory.slice(0, -1);
    
    // プレイヤーから最後にポケットしたボールを削除
    updatedGame.players = updatedGame.players.map(player => {
      if (player.id === lastShot.playerId && lastShot.isSunk) {
        return {
          ...player,
          ballsPocketed: player.ballsPocketed.filter(ball => ball !== lastShot.ballNumber),
          score: Math.max(0, player.score - this.getBallScore(lastShot.ballNumber)),
        };
      }
      return player;
    });
    
    return updatedGame;
  }
  
  protected getBallScore(_ballNumber: number): number {
    // デフォルトは1点、必要に応じてオーバーライド
    return 1;
  }
  
  protected addShotToHistory(game: Game, playerId: string, ballNumber: number, isSunk: boolean): Game {
    const shot: Shot = {
      playerId,
      ballNumber,
      isSunk,
      isFoul: false,
      timestamp: new Date(),
    };
    
    return {
      ...game,
      shotHistory: [...game.shotHistory, shot],
    };
  }
}
