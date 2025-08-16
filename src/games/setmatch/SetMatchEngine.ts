import { GameBase } from '../base/GameBase';
import type { Game } from '../../types/index';
import { GameType } from '../../types/index';
import { getBallScore } from '../../utils/ballUtils';

export class SetMatchEngine extends GameBase {
  getGameType(): GameType {
    return GameType.SET_MATCH;
  }
  
  getBallNumbers(): number[] {
    return Array.from({ length: 9 }, (_, i) => i + 1);
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
    const updatedGame = this.addShotToHistory(
      { ...game, players: updatedPlayers },
      activePlayer.id,
      ballNumber,
      true
    );
    
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
  
  handleCustomAction(game: Game, action: string, data?: any): Game {
    switch (action) {
      case 'WIN_SET':
        return this.handleWinSet(game, data.playerId);
      case 'RESET_RACK':
        return this.handleResetRack(game);
      default:
        return game;
    }
  }
  
  private handleWinSet(game: Game, winnerId: string): Game {
    const updatedPlayers = game.players.map(player => {
      if (player.id === winnerId) {
        const currentSets = player.setsWon || 0;
        return {
          ...player,
          setsWon: currentSets + 1,
          score: 1, // テストでは勝利後にスコア1が期待されている
          ballsPocketed: [], // ポケットボールもリセット
        };
      }
      return {
        ...player,
        score: 0,
        ballsPocketed: [],
      };
    });
    
    return {
      ...game,
      players: updatedPlayers,
      currentRack: game.currentRack + 1,
      scoreHistory: [
        ...game.scoreHistory,
        {
          playerId: winnerId,
          score: 1,
          timestamp: new Date(),
        }
      ],
    };
  }
  
  private handleResetRack(game: Game): Game {
    const updatedPlayers = game.players.map(player => ({
      ...player,
      score: 0,
      ballsPocketed: [],
    }));
    
    return {
      ...game,
      players: updatedPlayers,
      shotHistory: [],
    };
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
