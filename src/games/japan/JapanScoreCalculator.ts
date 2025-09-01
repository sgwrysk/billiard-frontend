import type { Game } from '../../types/index';
import type { JapanRackResult, JapanPlayerRackResult } from '../../types/japan';

/**
 * Utility class for calculating scores and rack results in Japan billiard games
 */
export class JapanScoreCalculator {
  /**
   * Calculate the results for the current rack including earned points, delta points, and total points
   * @param game Current game state
   * @returns Rack result with player scores and statistics
   */
  static calculateCurrentRackResults(game: Game): JapanRackResult {
    // Calculate earned points for each player in current rack
    const playerEarnedPoints = new Map<string, number>();
    
    // Initialize with 0 points for all players
    game.players.forEach(player => {
      playerEarnedPoints.set(player.id, 0);
    });
    
    // Sum up earned points from current rack only (ball clicks only)
    // Find the last rack completion shot to identify current rack start
    let currentRackStartIndex = 0;
    for (let i = game.shotHistory.length - 1; i >= 0; i--) {
      if (game.shotHistory[i].customData?.type === 'rack_complete') {
        currentRackStartIndex = i + 1;
        break;
      }
    }
    
    // Only count shots from current rack
    const currentRackShots = game.shotHistory.slice(currentRackStartIndex);
    currentRackShots.forEach(shot => {
      if (shot.customData?.type === 'ball_click') {
        const currentPoints = playerEarnedPoints.get(shot.playerId) || 0;
        const shotPoints = typeof shot.customData?.points === 'number' ? shot.customData.points : 0;
        playerEarnedPoints.set(shot.playerId, currentPoints + shotPoints);
      }
    });

    // Apply multiplier to earned points for rack completion calculation
    const multiplier = game.japanCurrentMultiplier || 1;
    game.players.forEach(player => {
      const basePoints = playerEarnedPoints.get(player.id) || 0;
      playerEarnedPoints.set(player.id, basePoints * multiplier);
    });
    
    // Multipliers are now applied to earned points before delta calculation
    
    // Calculate delta points (redistribution)
    const playerResults: JapanPlayerRackResult[] = game.players.map(player => {
      const earnedPoints = playerEarnedPoints.get(player.id) || 0;
      
      // Delta calculation: each player receives points from others equal to their earned points
      // and gives points to others equal to what those others earned
      let deltaPoints = 0;
      
      // Receive points: other players give me points equal to what I earned
      const otherPlayers = game.players.filter(p => p.id !== player.id);
      const pointsReceived = earnedPoints * otherPlayers.length;
      
      // Give points: I give points to other players equal to what they earned
      let pointsGiven = 0;
      otherPlayers.forEach(otherPlayer => {
        const otherEarnedPoints = playerEarnedPoints.get(otherPlayer.id) || 0;
        pointsGiven += otherEarnedPoints;
      });
      
      deltaPoints = pointsReceived - pointsGiven;
      
      // Calculate cumulative total points from previous racks
      const previousTotal = JapanScoreCalculator.getPreviousRackTotalPoints(game, player.id);
      const totalPoints = previousTotal + deltaPoints;
      
      return {
        playerId: player.id,
        earnedPoints,
        deltaPoints,
        totalPoints,
      };
    });
    
    return {
      rackNumber: game.currentRack,
      playerResults,
    };
  }

  /**
   * Get the total points for a player up to the previous rack (not including current rack)
   * @param game Current game state
   * @param playerId Player ID to get points for
   * @returns Total points from all previous racks
   */
  static getPreviousRackTotalPoints(game: Game, playerId: string): number {
    if (!game.japanRackHistory || game.japanRackHistory.length === 0) {
      return 0;
    }
    
    // Find the latest rack result for the player
    const lastRackResult = game.japanRackHistory[game.japanRackHistory.length - 1];
    const playerResult = lastRackResult?.playerResults.find(result => result.playerId === playerId);
    
    return playerResult?.totalPoints || 0;
  }

  /**
   * Calculate current rack points for a player from shot history
   * @param game Current game state
   * @param playerId Player ID to calculate points for
   * @returns Points earned in current rack with multiplier applied
   */
  static getCurrentRackPoints(game: Game, playerId: string): number {
    // Find the last rack complete shot index
    let lastRackCompleteIndex = -1;
    for (let i = game.shotHistory.length - 1; i >= 0; i--) {
      if (game.shotHistory[i].customData?.type === 'rack_complete') {
        lastRackCompleteIndex = i;
        break;
      }
    }
    
    // Get shots after the last rack complete
    const currentRackShots = game.shotHistory.slice(lastRackCompleteIndex + 1);
    const playerShots = currentRackShots.filter(shot => 
      shot.playerId === playerId && 
      shot.customData?.type === 'ball_click'
    );
    
    // Calculate points from current rack shots and apply multiplier
    const basePoints = playerShots.reduce((total, shot) => {
      const points = typeof shot.customData?.points === 'number' ? shot.customData.points : 0;
      return total + points;
    }, 0);
    
    // Apply multiplier
    const multiplier = game.japanCurrentMultiplier || 1;
    return basePoints * multiplier;
  }
}