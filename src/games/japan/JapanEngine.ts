import { GameBase } from '../base/GameBase';
import { GameType } from '../../types/index';
import type { Game, Shot, Player } from '../../types/index';
import type { JapanGameSettings, JapanRackResult, JapanPlayerRackResult } from '../../types/japan';

interface RackData {
  player1Balls: number;
  player2Balls: number;
  rackNumber: number;
}

export class JapanEngine extends GameBase {
  getGameType(): GameType {
    return GameType.JAPAN;
  }
  
  getBallNumbers(): number[] {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }
  
  initializeGame(playerSetups: {name: string, targetScore?: number, targetSets?: number}[], japanSettings?: JapanGameSettings): Game {
    const baseGame = super.initializeGame(playerSetups);
    
    return {
      ...baseGame,
      japanSettings: japanSettings || {
        handicapBalls: [5, 9],
        multipliers: [{ label: 'x2', value: 2 }],
        deductionEnabled: false,
        deductions: [],
        orderChangeInterval: 10,
        orderChangeEnabled: false,
        multipliersEnabled: false
      },
      japanRackHistory: [],
      japanPlayerOrderHistory: [{
        fromRack: 1,
        toRack: japanSettings?.orderChangeInterval || 10,
        playerOrder: baseGame.players.map(p => p.id)
      }]
    };
  }
  
  handleRackComplete(game: Game, rackData: RackData): Game {
    const japanSettings = game.japanSettings!;
    const handicapBalls = japanSettings.handicapBalls;
    
    // Calculate scores for each player based on ball counts
    const updatedPlayers = game.players.map((player, index) => {
      const ballCount = index === 0 ? rackData.player1Balls : rackData.player2Balls;
      
      // Calculate score: assume handicap balls are distributed proportionally
      // If player gets X balls out of 10 total, they get X/10 of each handicap ball type
      let score = 0;
      
      if (ballCount === 10) {
        // Player got all balls - include all handicap balls with double points
        score = 10 + handicapBalls.length * 5; // Regular balls + handicap bonus (5 points each handicap)
      } else {
        // More deterministic approach: 
        // If player gets >= 5 balls, they probably got at least one handicap
        const likelyHandicapBalls = ballCount >= 5 ? Math.min(Math.floor(ballCount / 5), handicapBalls.length) : 0;
        const regularBalls = ballCount - likelyHandicapBalls;
        
        score = regularBalls + (likelyHandicapBalls * 10); // Regular + (handicap * 2 * 5)
      }
      
      return {
        ...player,
        score: player.score + Math.max(0, score),
      };
    });
    
    // Create shot history entry for the rack
    const shot: Shot = {
      playerId: game.players[0].id, // Track for first player (could be extended)
      ballNumber: rackData.player1Balls, // Use ball count as identifier
      isSunk: true,
      isFoul: false,
      timestamp: new Date(),
      customData: {
        type: 'rack_complete',
        rackNumber: rackData.rackNumber,
        player1Balls: rackData.player1Balls,
        player2Balls: rackData.player2Balls
      }
    };
    
    return {
      ...game,
      players: updatedPlayers,
      currentRack: game.currentRack + 1,
      shotHistory: [...game.shotHistory, shot],
    };
  }
  
  handleMultiplier(game: Game, playerId: string, multiplier: number): Game {
    const updatedPlayers = game.players.map(player => {
      if (player.id === playerId) {
        return {
          ...player,
          score: player.score * multiplier,
        };
      }
      return player;
    });
    
    // Create shot history entry
    const shot: Shot = {
      playerId,
      ballNumber: 0,
      isSunk: false,
      isFoul: false,
      timestamp: new Date(),
      customData: {
        type: 'multiplier',
        value: multiplier,
        oldScore: game.players.find(p => p.id === playerId)?.score || 0
      }
    };
    
    return {
      ...game,
      players: updatedPlayers,
      shotHistory: [...game.shotHistory, shot],
    };
  }

  // Apply multiplier to all players
  handleMultiplierAll(game: Game, multiplier: number): Game {
    const oldScores = game.players.map(p => ({ id: p.id, score: p.score }));
    
    const updatedPlayers = game.players.map(player => ({
      ...player,
      score: Math.round(player.score * multiplier),
    }));
    
    // Create shot history entry
    const shot: Shot = {
      playerId: 'all',
      ballNumber: 0,
      isSunk: false,
      isFoul: false,
      timestamp: new Date(),
      customData: {
        type: 'multiplier_all',
        value: multiplier,
        oldScores,
      }
    };
    
    return {
      ...game,
      players: updatedPlayers,
      shotHistory: [...game.shotHistory, shot],
    };
  }
  
  handleDeduction(game: Game, playerId: string, deduction: number): Game {
    const updatedPlayers = game.players.map(player => {
      if (player.id === playerId) {
        return {
          ...player,
          score: Math.max(0, player.score - deduction),
        };
      }
      return player;
    });
    
    // Create shot history entry
    const shot: Shot = {
      playerId,
      ballNumber: 0,
      isSunk: false,
      isFoul: true, // Mark as foul for deduction
      timestamp: new Date(),
      customData: {
        type: 'deduction',
        value: deduction,
        oldScore: game.players.find(p => p.id === playerId)?.score || 0
      }
    };
    
    return {
      ...game,
      players: updatedPlayers,
      shotHistory: [...game.shotHistory, shot],
    };
  }
  
  // Handle individual ball clicks for Japan game
  handlePocketBall(game: Game, ballNumber: number): Game {
    const currentPlayer = game.players[game.currentPlayerIndex];
    const points = 1; // All balls are worth 1 point
    
    // Update the current player's score
    const updatedPlayers = game.players.map((player) => {
      if (player.id === currentPlayer.id) {
        return {
          ...player,
          score: player.score + points,
          ballsPocketed: [...(player.ballsPocketed || []), ballNumber], // Track pocketed balls
        };
      }
      return player;
    });
    
    // Create shot history entry
    const shot = {
      playerId: currentPlayer.id,
      ballNumber,
      isSunk: true,
      isFoul: false,
      timestamp: new Date(),
      customData: {
        type: 'ball_click',
        points,
      }
    };
    
    return {
      ...game,
      players: updatedPlayers,
      shotHistory: [...game.shotHistory, shot],
    };
  }
  
  handleSwitchPlayer(game: Game): Game {
    const nextPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    
    const updatedPlayers = game.players.map((player, index) => ({
      ...player,
      isActive: index === nextPlayerIndex,
    }));
    
    return {
      ...game,
      players: updatedPlayers,
      currentPlayerIndex: nextPlayerIndex,
    };
  }
  
  checkVictoryCondition(_game: Game): { isGameOver: boolean; winnerId?: string } {
    // Japan game doesn't have a specific victory condition
    // It's typically played for a set time or until manual end
    return { isGameOver: false };
  }
  
  hasCustomLogic(): boolean {
    return true;
  }
  
  // Handle next rack - calculate current rack results and move to next rack
  handleNextRack(game: Game): Game {
    // Calculate current rack results
    const currentRackResults = this.calculateCurrentRackResults(game);
    
    // Add to rack history
    const newRackHistory = [...(game.japanRackHistory || []), currentRackResults];
    
    // Reset current rack data and move to next rack
    const updatedPlayers = game.players.map(player => ({
      ...player,
      ballsPocketed: [], // Clear collected balls for new rack
    }));
    
    return {
      ...game,
      players: updatedPlayers,
      currentRack: game.currentRack + 1,
      japanRackHistory: newRackHistory,
      shotHistory: [], // Clear shot history for new rack
    };
  }
  
  // Get previous rack total points for a player
  private getPreviousRackTotalPoints(game: Game, playerId: string): number {
    if (!game.japanRackHistory || game.japanRackHistory.length === 0) {
      return 0;
    }
    
    // Find the most recent rack result for this player
    for (let i = game.japanRackHistory.length - 1; i >= 0; i--) {
      const rackResult = game.japanRackHistory[i];
      const playerResult = rackResult.playerResults.find(pr => pr.playerId === playerId);
      if (playerResult) {
        return playerResult.totalPoints;
      }
    }
    
    return 0;
  }
  
  // Calculate current rack results based on shot history
  private calculateCurrentRackResults(game: Game): JapanRackResult {
    // Calculate earned points for each player in current rack
    const playerEarnedPoints = new Map<string, number>();
    
    // Initialize with 0 points for all players
    game.players.forEach(player => {
      playerEarnedPoints.set(player.id, 0);
    });
    
    // Sum up earned points from shot history (ball clicks only)
    game.shotHistory.forEach(shot => {
      if (shot.customData?.type === 'ball_click') {
        const currentPoints = playerEarnedPoints.get(shot.playerId) || 0;
        const shotPoints = typeof shot.customData?.points === 'number' ? shot.customData.points : 0;
        playerEarnedPoints.set(shot.playerId, currentPoints + shotPoints);
      }
    });
    
    // Apply multipliers from shot history
    game.shotHistory.forEach(shot => {
      if (shot.customData?.type === 'multiplier') {
        const multiplier = typeof shot.customData?.value === 'number' ? shot.customData.value : 1;
        const currentPoints = playerEarnedPoints.get(shot.playerId) || 0;
        playerEarnedPoints.set(shot.playerId, currentPoints * multiplier);
      } else if (shot.customData?.type === 'multiplier_all') {
        const multiplier = typeof shot.customData?.value === 'number' ? shot.customData.value : 1;
        // Apply to all players
        game.players.forEach(player => {
          const currentPoints = playerEarnedPoints.get(player.id) || 0;
          playerEarnedPoints.set(player.id, currentPoints * multiplier);
        });
      }
    });
    
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
      const previousTotal = this.getPreviousRackTotalPoints(game, player.id);
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
  
  // Handle player order change
  private handlePlayerOrderChange(game: Game, selectedPlayerId: string): Game {
    const selectedPlayerIndex = game.players.findIndex(p => p.id === selectedPlayerId);
    if (selectedPlayerIndex === -1) {
      return game;
    }
    
    const newPlayerOrder = this.calculateNewPlayerOrder(game.players, selectedPlayerId);
    const orderChangeInterval = game.japanSettings?.orderChangeInterval || 10;
    
    // Add new player order period to history
    const newOrderHistory = [...(game.japanPlayerOrderHistory || [])];
    const nextPeriodStart = game.currentRack + 1;
    const nextPeriodEnd = nextPeriodStart + orderChangeInterval - 1;
    
    newOrderHistory.push({
      fromRack: nextPeriodStart,
      toRack: nextPeriodEnd,
      playerOrder: newPlayerOrder.map(p => p.id)
    });
    
    // Update game with new player order
    const updatedGame = {
      ...game,
      players: newPlayerOrder.map((player, index) => ({
        ...player,
        isActive: index === 0, // First player is active
      })),
      currentPlayerIndex: 0, // Start with first player
      japanPlayerOrderHistory: newOrderHistory,
    };
    
    return updatedGame;
  }
  
  // Calculate new player order based on rules
  private calculateNewPlayerOrder(players: Player[], selectedPlayerId: string): Player[] {
    const selectedPlayer = players.find(p => p.id === selectedPlayerId)!;
    const otherPlayers = players.filter(p => p.id !== selectedPlayerId);
    
    if (players.length === 2) {
      // 2 players: no order change (this shouldn't happen based on requirements)
      return players;
    } else if (players.length === 3) {
      // 3 players: selected player first, then remaining players in reverse order
      return [selectedPlayer, ...otherPlayers.reverse()];
    } else {
      // 4+ players: selected player first, then randomize others while avoiding same cycle
      return this.randomizePlayersAvoidingSameCycle(players, selectedPlayer, otherPlayers);
    }
  }
  
  // Randomize players for 4+ player case, avoiding same cycle order
  private randomizePlayersAvoidingSameCycle(
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
      if (!this.isSameCycle(originalPlayers, newOrder)) {
        return newOrder;
      }
      
      attempts++;
    }
    
    // Fallback: if we can't find a different cycle, just reverse the others
    return [selectedPlayer, ...otherPlayers.reverse()];
  }
  
  // Check if two player orders create the same cycle
  private isSameCycle(order1: Player[], order2: Player[]): boolean {
    if (order1.length !== order2.length) {
      return false;
    }
    
    // Create cycle maps: player -> next player
    const cycle1 = new Map<string, string>();
    const cycle2 = new Map<string, string>();
    
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
  
  // Check if order change is needed (public for testing)
  shouldShowOrderChangeDialog(game: Game): boolean {
    // Order change occurs for 3+ players only
    if (game.players.length <= 2) {
      return false;
    }
    
    const orderChangeInterval = game.japanSettings?.orderChangeInterval || 10;
    return game.currentRack > 0 && game.currentRack % orderChangeInterval === 0;
  }

  handleCustomAction(game: Game, action: string, data?: unknown): Game {
    switch (action) {
      case 'rackComplete': {
        return this.handleRackComplete(game, data as RackData);
      }
      case 'nextRack': {
        return this.handleNextRack(game);
      }
      case 'multiplier': {
        const { playerId: mPlayerId, value: mValue } = data as { playerId: string; value: number };
        return this.handleMultiplier(game, mPlayerId, mValue);
      }
      case 'multiplier_all': {
        const { value: maValue } = data as { value: number };
        return this.handleMultiplierAll(game, maValue);
      }
      case 'deduction': {
        const { playerId: dPlayerId, value: dValue } = data as { playerId: string; value: number };
        return this.handleDeduction(game, dPlayerId, dValue);
      }
      case 'playerOrderChange': {
        const { selectedPlayerId } = data as { selectedPlayerId: string };
        return this.handlePlayerOrderChange(game, selectedPlayerId);
      }
      default:
        return game;
    }
  }
  
  handleUndo(game: Game): Game {
    if (game.shotHistory.length === 0) {
      return game;
    }
    
    const lastShot = game.shotHistory[game.shotHistory.length - 1];
    const lastAction = lastShot.customData;
    
    const updatedGame = { ...game };
    
    // Undo based on the last action type
    if (lastAction?.type === 'rack_complete') {
      // Undo rack completion - revert scores and rack number
      updatedGame.currentRack = Math.max(1, updatedGame.currentRack - 1);
      
      // Would need to recalculate and subtract the scores that were added
      // This is complex, so for now just mark as undoable
    } else if (lastAction?.type === 'multiplier') {
      // Undo multiplier - restore old score
      const oldScore = lastAction.oldScore as number;
      updatedGame.players = updatedGame.players.map(player => {
        if (player.id === lastShot.playerId) {
          return { ...player, score: oldScore };
        }
        return player;
      });
    } else if (lastAction?.type === 'deduction') {
      // Undo deduction - restore old score
      const oldScore = lastAction.oldScore as number;
      updatedGame.players = updatedGame.players.map(player => {
        if (player.id === lastShot.playerId) {
          return { ...player, score: oldScore };
        }
        return player;
      });
    }
    
    // Remove the last shot from history
    updatedGame.shotHistory = updatedGame.shotHistory.slice(0, -1);
    
    return updatedGame;
  }
}