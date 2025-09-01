import type { Player } from '../../types/index';

/**
 * Utility class for calculating new player orders in Japan billiard games
 */
export class PlayerOrderCalculator {
  /**
   * Calculate new player order based on Japan billiard rules
   * @param players Current player order
   * @param selectedPlayerId ID of the player selected to go first
   * @returns New player order array
   */
  static calculateNewPlayerOrder(players: Player[], selectedPlayerId: string): Player[] {
    const selectedPlayer = players.find(p => p.id === selectedPlayerId)!;
    
    if (players.length === 2) {
      // 2 players: no order change (this shouldn't happen based on requirements)
      return players;
    } else if (players.length === 3) {
      // 3 players: Selected player first, then counter-clockwise arrangement
      // A→B→C: select A → A→C→B, select B → B→A→C, select C → C→B→A
      
      const selectedIndex = players.findIndex(p => p.id === selectedPlayerId);
      
      // Create counter-clockwise arrangement starting from selected player
      if (selectedIndex === 0) {
        // Select A: A→C→B (skip B, then reverse remaining)
        return [players[0], players[2], players[1]];
      } else if (selectedIndex === 1) {
        // Select B: B→A→C (selected first, then maintain A→C order)
        return [players[1], players[0], players[2]];
      } else {
        // Select C: C→B→A (selected first, then reverse remaining)
        return [players[2], players[1], players[0]];
      }
    } else {
      // 4+ players: selected player first, then randomize others while avoiding same cycle
      const otherPlayers = players.filter(p => p.id !== selectedPlayerId);
      return PlayerOrderCalculator.randomizePlayersAvoidingSameCycle(players, selectedPlayer, otherPlayers);
    }
  }

  /**
   * Randomize players for 4+ player case, avoiding same cycle order
   * @param originalPlayers Original player order
   * @param selectedPlayer Selected player to go first
   * @param otherPlayers Other players to randomize
   * @returns New player order with selected player first and others randomized
   */
  private static randomizePlayersAvoidingSameCycle(
    originalPlayers: Player[],
    selectedPlayer: Player,
    otherPlayers: Player[]
  ): Player[] {
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loop
    
    while (attempts < maxAttempts) {
      // Shuffle other players
      const shuffledOthers = [...otherPlayers].sort(() => Math.random() - 0.5);
      const newOrder = [selectedPlayer, ...shuffledOthers];
      
      // Check if this creates the same cycle as original
      if (!PlayerOrderCalculator.isSameCycle(originalPlayers, newOrder)) {
        return newOrder;
      }
      
      attempts++;
    }
    
    // Fallback: if we can't find a different cycle, just reverse the others
    return [selectedPlayer, ...otherPlayers.reverse()];
  }

  /**
   * Check if two player orders create the same cycle
   * @param order1 First player order
   * @param order2 Second player order
   * @returns True if both orders create identical cycles
   */
  private static isSameCycle(order1: Player[], order2: Player[]): boolean {
    if (order1.length !== order2.length) return false;
    
    const cycle1 = new Map<string, string>();
    const cycle2 = new Map<string, string>();
    
    // Build cycle maps: each player points to the next player in sequence
    for (let i = 0; i < order1.length; i++) {
      const nextIndex = (i + 1) % order1.length;
      cycle1.set(order1[i].id, order1[nextIndex].id);
      cycle2.set(order2[i].id, order2[nextIndex].id);
    }
    
    // Check if cycles are identical
    for (const [playerId, nextPlayerId] of cycle1) {
      if (cycle2.get(playerId) !== nextPlayerId) {
        return false;
      }
    }
    
    return true;
  }
}