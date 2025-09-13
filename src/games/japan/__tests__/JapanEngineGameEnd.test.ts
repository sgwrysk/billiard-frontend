import { JapanEngine } from '../JapanEngine';
import type { Game } from '../../../types/index';
import type { JapanGameSettings } from '../../../types/japan';

describe('JapanEngine - Game End', () => {
  let engine: JapanEngine;

  beforeEach(() => {
    engine = new JapanEngine();
  });

  const createTestGame = (): Game => {
    const japanSettings: JapanGameSettings = {
      handicapBalls: [5, 9],
      orderChangeInterval: 10,
      orderChangeEnabled: false
    };

    return engine.initializeGame([
      { name: 'Player 1' },
      { name: 'Player 2' }
    ], japanSettings);
  };

  describe('handleGameEnd', () => {
    it('should calculate current rack results when there are shots', () => {
      let game = createTestGame();
      
      // Add some ball clicks to current rack
      game = engine.handlePocketBall(game, 5); // Player 1 pockets ball 5
      game = engine.handleSwitchPlayer(game);
      game = engine.handlePocketBall(game, 9); // Player 2 pockets ball 9
      
      // Set multiplier
      game = engine.handleMultiplierChange(game, 2);
      
      const finalGame = engine.handleGameEnd(game);
      
      // Should have rack history with calculated results
      expect(finalGame.japanRackHistory).toHaveLength(1);
      expect(finalGame.japanRackHistory![0].rackNumber).toBe(1);
      expect(finalGame.japanRackHistory![0].playerResults).toHaveLength(2);
      
      // Check that player 1 and player 2 have calculated points
      const player1Result = finalGame.japanRackHistory![0].playerResults.find(p => p.playerId === game.players[0].id);
      const player2Result = finalGame.japanRackHistory![0].playerResults.find(p => p.playerId === game.players[1].id);
      
      expect(player1Result?.earnedPoints).toBe(2); // 1 point * 2 multiplier
      expect(player2Result?.earnedPoints).toBe(2); // 1 point * 2 multiplier
      
      // Should add game_complete shot to history
      const lastShot = finalGame.shotHistory[finalGame.shotHistory.length - 1];
      expect(lastShot.customData?.type).toBe('game_complete');
      expect(lastShot.customData?.finalRack).toBe(1);
      expect(lastShot.customData?.finalMultiplier).toBe(2);
    });

    it('should return game unchanged when there are no shots in current rack', () => {
      const game = createTestGame();
      
      // No shots added - should return unchanged
      const finalGame = engine.handleGameEnd(game);
      
      expect(finalGame).toBe(game); // Same reference - unchanged
      expect(finalGame.japanRackHistory).toHaveLength(0);
    });

    it('should work correctly after rack completion', () => {
      let game = createTestGame();
      
      // First rack - add shots and complete
      game = engine.handlePocketBall(game, 5);
      game = engine.handleNextRack(game); // Complete first rack
      
      // Second rack - add more shots
      game = engine.handlePocketBall(game, 9);
      game = engine.handleMultiplierChange(game, 3);
      
      const finalGame = engine.handleGameEnd(game);
      
      // Should have 2 rack results (first from nextRack, second from gameEnd)
      expect(finalGame.japanRackHistory).toHaveLength(2);
      expect(finalGame.japanRackHistory![1].rackNumber).toBe(2);
      
      // Second rack should have the new shot calculated
      const secondRackResult = finalGame.japanRackHistory![1];
      expect(secondRackResult.playerResults[0].earnedPoints).toBe(3); // 1 point * 3 multiplier
    });

    it('should calculate correct final scores for victory screen display', () => {
      let game = createTestGame();
      
      // First rack
      game = engine.handlePocketBall(game, 5); // Player 1: 1 point
      game = engine.handleSwitchPlayer(game);
      game = engine.handlePocketBall(game, 9); // Player 2: 1 point
      game = engine.handlePocketBall(game, 1); // Player 2: another 1 point
      game = engine.handleMultiplierChange(game, 2);
      game = engine.handleNextRack(game); // Complete first rack
      
      // Second rack - ensure we're starting with Player 1
      if (game.currentPlayerIndex !== 0) {
        game = engine.handleSwitchPlayer(game);
      }
      game = engine.handlePocketBall(game, 5); // Player 1: 1 point
      game = engine.handleMultiplierChange(game, 3);
      
      // End game (should calculate current rack)
      const finalGame = engine.handleGameEnd(game);
      
      // Check final scores
      const lastRack = finalGame.japanRackHistory![finalGame.japanRackHistory!.length - 1];
      const player1FinalScore = lastRack.playerResults.find(p => p.playerId === game.players[0].id)?.totalPoints || 0;
      const player2FinalScore = lastRack.playerResults.find(p => p.playerId === game.players[1].id)?.totalPoints || 0;
      
      // Player 1: 
      // Rack 1: earned 2 points (1*2), received 2*1=2 from Player2, gave 4*1=4 to Player2, delta = 2-4 = -2, total = -2
      // Rack 2: earned 3 points (1*3), received 3*1=3 from Player2, gave 0*1=0 to Player2, delta = 3-0 = 3, total = -2+3 = 1
      expect(player1FinalScore).toBe(1);
      
      // Player 2:
      // Rack 1: earned 4 points (2*2), received 4*1=4 from Player1, gave 2*1=2 to Player1, delta = 4-2 = 2, total = 2  
      // Rack 2: earned 0 points (0*3), received 0*1=0 from Player1, gave 3*1=3 to Player1, delta = 0-3 = -3, total = 2-3 = -1
      expect(player2FinalScore).toBe(-1);
    });

    it('should revert game end calculations when restoring game', () => {
      let game = createTestGame();
      
      // Add some shots and end the game
      game = engine.handlePocketBall(game, 5); // Player 1: 1 point
      game = engine.handleSwitchPlayer(game);
      game = engine.handlePocketBall(game, 9); // Player 2: 1 point
      game = engine.handleMultiplierChange(game, 2);
      
      // End the game (this should calculate and save rack results)
      const endedGame = engine.handleGameEnd(game);
      
      // Verify that game end calculations were applied
      expect(endedGame.japanRackHistory).toHaveLength(1);
      expect(endedGame.shotHistory.some(shot => shot.customData?.type === 'game_complete')).toBe(true);
      
      // Now restore the game (this should revert the game end calculations)
      const restoredGame = engine.handleGameRestore(endedGame);
      
      // Verify that game end calculations were reverted
      expect(restoredGame.japanRackHistory).toHaveLength(0);
      expect(restoredGame.shotHistory.some(shot => shot.customData?.type === 'game_complete')).toBe(false);
      
      // Verify that ball click shots are still there
      const ballClickShots = restoredGame.shotHistory.filter(shot => shot.customData?.type === 'ball_click');
      expect(ballClickShots).toHaveLength(2);
    });

    it('should not modify game if it was not ended', () => {
      let game = createTestGame();
      
      // Add some shots but don't end the game
      game = engine.handlePocketBall(game, 5); // Player 1: 1 point
      game = engine.handleSwitchPlayer(game);
      game = engine.handlePocketBall(game, 9); // Player 2: 1 point
      
      // Try to restore the game (should return unchanged since it wasn't ended)
      const restoredGame = engine.handleGameRestore(game);
      
      // Should be the same reference since no changes were made
      expect(restoredGame).toBe(game);
    });
  });
});