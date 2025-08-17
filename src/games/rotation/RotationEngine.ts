import { GameBase } from '../base/GameBase';
import type { Game, Player } from '../../types/index';
import { GameType } from '../../types/index';
import { getBallScore } from '../../utils/ballUtils';

export class RotationEngine extends GameBase {
  getGameType(): GameType {
    return GameType.ROTATION;
  }
  
  getBallNumbers(): number[] {
    return Array.from({ length: 15 }, (_, i) => i + 1);
  }
  
  handlePocketBall(game: Game, ballNumber: number): Game {
    const activePlayer = game.players[game.currentPlayerIndex];
    
    // ボールが既にポケットされているかチェック
    if (this.isBallPocketed(game, ballNumber)) {
      return game;
    }
    
    const score = getBallScore(ballNumber, this.getGameType());
    
    // プレイヤーの状態を更新
    const updatedPlayers = game.players.map(player => {
      if (player.id === activePlayer.id) {
        return {
          ...player,
          ballsPocketed: [...player.ballsPocketed, ballNumber],
          score: player.score + score,
        };
      }
      return player;
    });
    
    // ショット履歴を追加
    const gameWithShotHistory = this.addShotToHistory(
      { ...game, players: updatedPlayers },
      activePlayer.id,
      ballNumber,
      true
    );
    
    // スコア履歴も追加（グラフ表示のため）
    const scoreEntry = {
      playerId: activePlayer.id,
      score: score, // このボールで獲得したスコア
      timestamp: new Date(),
    };
    
    const updatedGame = {
      ...gameWithShotHistory,
      scoreHistory: [...gameWithShotHistory.scoreHistory, scoreEntry],
    };
    
    return updatedGame;
  }
  
  handleSwitchPlayer(game: Game): Game {
    const updatedPlayers = game.players.map(player => ({
      ...player,
      isActive: false,
    }));
    
    const nextPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    updatedPlayers[nextPlayerIndex].isActive = true;
    
    return {
      ...game,
      players: updatedPlayers,
      currentPlayerIndex: nextPlayerIndex,
    };
  }
  
  checkVictoryCondition(game: Game): { isGameOver: boolean; winnerId?: string } {
    for (const player of game.players) {
      if (player.targetScore && player.score >= player.targetScore) {
        return { isGameOver: true, winnerId: player.id };
      }
    }
    return { isGameOver: false };
  }
  
  hasCustomLogic(): boolean {
    return true;
  }
  
  handleCustomAction(game: Game, action: string, _data?: any): Game {
    switch (action) {
      case 'RESET_RACK':
        return this.handleResetRack(game);
      case 'CHECK_ALL_BALLS_POCKETED':
        // booleanを返すため、ゲーム状態は変更しない
        return game;
      case 'UNDO_LAST_SHOT':
        // ROTATIONではデフォルトのアンドゥ処理を使用
        return this.handleUndo(game);
      default:
        return game;
    }
  }
  
  private handleResetRack(game: Game): Game {
    const updatedPlayers = game.players.map(player => ({
      ...player,
      ballsPocketed: [],
    }));
    
    return {
      ...game,
      players: updatedPlayers,
      shotHistory: [],
      currentRack: game.currentRack + 1,
      totalRacks: game.totalRacks + 1,
    };
  }
  
  checkAllBallsPocketed(game: Game): boolean {
    const totalBalls = this.getBallNumbers();
    const pocketedBalls = game.players.reduce((acc, player) => {
      return acc.concat(player.ballsPocketed);
    }, [] as number[]);
    
    return totalBalls.every(ball => pocketedBalls.includes(ball));
  }
  
  getRemainingScore(player: Player): number {
    if (!player.targetScore) return 0;
    return Math.max(0, player.targetScore - player.score);
  }
  
  private isBallPocketed(game: Game, ballNumber: number): boolean {
    return game.players.some(player => 
      player.ballsPocketed.includes(ballNumber)
    );
  }
  
  protected getBallScore(ballNumber: number): number {
    return getBallScore(ballNumber, this.getGameType());
  }
}
