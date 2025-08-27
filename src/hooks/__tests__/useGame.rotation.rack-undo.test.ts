import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useGame } from '../useGame';
import { GameType } from '../../types/index';

describe('useGame - Rotation Rack Transition Undo Comprehensive Test', () => {
  it('should handle complete rack transition and undo scenario correctly', () => {
    const { result } = renderHook(() => useGame());
    
    console.log('\n=== COMPREHENSIVE RACK TRANSITION UNDO TEST ===');
    
    // Start ROTATION game
    act(() => {
      result.current.startGame([
        { name: 'Player 1', targetScore: 150 },
        { name: 'Player 2', targetScore: 150 }
      ], GameType.ROTATION);
    });

    console.log('\n1. INITIAL STATE:');
    console.log('  Rack:', result.current.currentGame?.currentRack);
    console.log('  Players:', result.current.currentGame?.players.map(p => ({
      name: p.name,
      score: p.score,
      ballsPocketed: p.ballsPocketed?.length || 0,
      balls: p.ballsPocketed
    })));
    
    // Pocket balls 1-14 (not 15 yet)
    console.log('\n2. POCKETING BALLS 1-14:');
    for (let ball = 1; ball <= 14; ball++) {
      act(() => {
        result.current.pocketBall(ball);
      });
    }
    
    console.log('  After pocketing 1-14:');
    console.log('    Rack:', result.current.currentGame?.currentRack);
    console.log('    Score:', result.current.currentGame?.players[0].score);
    console.log('    Balls pocketed:', result.current.currentGame?.players[0].ballsPocketed?.length);
    console.log('    Available balls should be: [15]');
    
    // Check what balls are actually pocketed
    const pocketedBalls = result.current.currentGame?.players.reduce((acc, p) => acc.concat(p.ballsPocketed || []), [] as number[]);
    const availableBalls = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].filter(b => !pocketedBalls?.includes(b));
    console.log('    Actually pocketed:', pocketedBalls?.sort());
    console.log('    Actually available:', availableBalls.sort());
    
    // Now pocket ball 15 (should trigger rack reset)
    console.log('\n3. POCKETING BALL 15 (should trigger rack reset):');
    act(() => {
      result.current.pocketBall(15);
    });
    
    console.log('  After pocketing 15:');
    console.log('    Rack:', result.current.currentGame?.currentRack);
    console.log('    Total racks:', result.current.currentGame?.totalRacks);
    console.log('    Score:', result.current.currentGame?.players[0].score);
    console.log('    Balls pocketed:', result.current.currentGame?.players[0].ballsPocketed?.length);
    console.log('    Shot history length:', result.current.currentGame?.shotHistory?.length);
    console.log('    Score history length:', result.current.currentGame?.scoreHistory?.length);
    
    // Verify we're in rack 2 with all balls available
    expect(result.current.currentGame?.currentRack).toBe(2);
    expect(result.current.currentGame?.players[0].ballsPocketed?.length).toBe(0); // Should be clear for new rack
    
    // Check what balls appear pocketed in UI
    const rack2PocketedBalls = result.current.currentGame?.players.reduce((acc, p) => acc.concat(p.ballsPocketed || []), [] as number[]);
    const rack2AvailableBalls = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].filter(b => !rack2PocketedBalls?.includes(b));
    console.log('    Rack 2 pocketed balls:', rack2PocketedBalls?.sort());
    console.log('    Rack 2 available balls:', rack2AvailableBalls.sort());
    console.log('    Expected available balls: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]');
    
    // Now test undo - should go back to rack 1 state
    console.log('\n4. TESTING UNDO FROM RACK 2:');
    console.log('  Can undo:', result.current.canUndoLastShot());
    
    expect(result.current.canUndoLastShot()).toBe(true); // Should be able to undo
    
    act(() => {
      result.current.undoLastShot();
    });
    
    console.log('  After undo:');
    console.log('    Rack:', result.current.currentGame?.currentRack);
    console.log('    Score:', result.current.currentGame?.players[0].score);
    console.log('    Balls pocketed count:', result.current.currentGame?.players[0].ballsPocketed?.length);
    console.log('    Balls pocketed:', result.current.currentGame?.players[0].ballsPocketed?.sort());
    console.log('    Shot history length:', result.current.currentGame?.shotHistory?.length);
    console.log('    Score history length:', result.current.currentGame?.scoreHistory?.length);
    
    // Check final ball state after undo
    const undoPocketedBalls = result.current.currentGame?.players.reduce((acc, p) => acc.concat(p.ballsPocketed || []), [] as number[]);
    const undoAvailableBalls = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].filter(b => !undoPocketedBalls?.includes(b));
    console.log('    Final pocketed balls:', undoPocketedBalls?.sort());
    console.log('    Final available balls:', undoAvailableBalls.sort());
    console.log('    Expected pocketed: [1,2,3,4,5,6,7,8,9,10,11,12,13,14]');
    console.log('    Expected available: [15]');
    
    // Assertions for correct undo state
    expect(result.current.currentGame?.currentRack).toBe(1); // Should be back to rack 1
    expect(result.current.currentGame?.players[0].score).toBe(105); // Score should be 120 - 15 = 105
    expect(result.current.currentGame?.players[0].ballsPocketed?.length).toBe(14); // Should have balls 1-14
    
    // Check that player has all balls 1-14 (order doesn't matter, so sort both for comparison)
    const playerBalls = result.current.currentGame?.players[0].ballsPocketed || [];
    const sortedPlayerBalls = [...playerBalls].sort((a, b) => a - b);
    const expectedBalls = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    
    expect(sortedPlayerBalls).toEqual(expectedBalls); // Should have balls 1-14 in order
    expect(playerBalls.includes(15)).toBe(false); // Ball 15 should NOT be pocketed
    
    // Test that only ball 15 is available (UI state)
    const finalAvailableBalls = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].filter(ball => 
      !result.current.currentGame?.players.some(p => p.ballsPocketed?.includes(ball))
    );
    expect(finalAvailableBalls).toEqual([15]);
    
    console.log('\n5. FINAL VERIFICATION:');
    console.log('  ✓ Rack should be 1:', result.current.currentGame?.currentRack === 1);
    console.log('  ✓ Score should be 105:', result.current.currentGame?.players[0].score === 105);
    console.log('  ✓ Should have 14 balls pocketed:', result.current.currentGame?.players[0].ballsPocketed?.length === 14);
    console.log('  ✓ Only ball 15 should be available:', finalAvailableBalls.length === 1 && finalAvailableBalls[0] === 15);
  });
});