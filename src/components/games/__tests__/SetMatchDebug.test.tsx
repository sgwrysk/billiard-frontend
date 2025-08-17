import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SetMatchBoard } from '../SetMatchBoard';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { GameType } from '../../../types/index';
import { useGame } from '../../../hooks/useGame';

// Test wrapper with LanguageProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    {children}
  </LanguageProvider>
);

describe('SetMatch Debug Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should debug undo button state through console logs', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.startGame(
        [{ name: 'Debug Player 1', targetSets: 3 }, { name: 'Debug Player 2', targetSets: 3 }],
        GameType.SET_MATCH
      );
    });

    let game = result.current.currentGame!;
    console.log('Initial game state:', {
      scoreHistoryLength: game.scoreHistory.length,
      scoreHistory: game.scoreHistory,
      setsWon: game.players.map(p => ({ name: p.name, setsWon: p.setsWon }))
    });

    // Render SetMatchBoard
    const { rerender } = render(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={(playerId: string) => {
            console.log('onWinSet called with playerId:', playerId);
            result.current.winSet(playerId);
          }}
          onUndoLastShot={() => {
            console.log('onUndoLastShot called');
            result.current.undoLastShot();
          }}
        />
      </TestWrapper>
    );

    // Check initial undo button state
    let undoButton = screen.getByText('取り消し');
    console.log('Initial undo button disabled:', undoButton.hasAttribute('disabled'));

    // Player 1 wins a set
    const player1Id = game.players[0].id;
    console.log('Triggering set win for player 1:', player1Id);
    
    act(() => {
      result.current.winSet(player1Id);
    });

    game = result.current.currentGame!;
    console.log('After set win:', {
      scoreHistoryLength: game.scoreHistory.length,
      scoreHistory: game.scoreHistory,
      setsWon: game.players.map(p => ({ name: p.name, setsWon: p.setsWon }))
    });

    // Re-render with updated state
    rerender(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={(playerId: string) => {
            console.log('onWinSet called with playerId:', playerId);
            result.current.winSet(playerId);
          }}
          onUndoLastShot={() => {
            console.log('onUndoLastShot called');
            result.current.undoLastShot();
          }}
        />
      </TestWrapper>
    );

    undoButton = screen.getByText('取り消し');
    console.log('After set win - undo button disabled:', undoButton.hasAttribute('disabled'));
    console.log('Expected: false (button should be enabled)');

    // Verify expectations
    expect(game.scoreHistory.length).toBe(1);
    expect(undoButton).not.toBeDisabled();

    // Test undo
    console.log('Clicking undo button');
    fireEvent.click(undoButton);

    game = result.current.currentGame!;
    console.log('After undo:', {
      scoreHistoryLength: game.scoreHistory.length,
      scoreHistory: game.scoreHistory,
      setsWon: game.players.map(p => ({ name: p.name, setsWon: p.setsWon }))
    });

    // Re-render after undo
    rerender(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={(playerId: string) => {
            console.log('onWinSet called with playerId:', playerId);
            result.current.winSet(playerId);
          }}
          onUndoLastShot={() => {
            console.log('onUndoLastShot called');
            result.current.undoLastShot();
          }}
        />
      </TestWrapper>
    );

    undoButton = screen.getByText('取り消し');
    console.log('After undo - undo button disabled:', undoButton.hasAttribute('disabled'));
    console.log('Expected: true (button should be disabled)');

    expect(game.scoreHistory.length).toBe(0);
    expect(undoButton).toBeDisabled();
  });

  it('should test real user interaction via card clicks', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.startGame(
        [{ name: 'Click Player 1', targetSets: 3 }, { name: 'Click Player 2', targetSets: 3 }],
        GameType.SET_MATCH
      );
    });

    let game = result.current.currentGame!;
    console.log('Starting card click test with game:', {
      scoreHistoryLength: game.scoreHistory.length,
      players: game.players.map(p => ({ id: p.id, name: p.name, setsWon: p.setsWon }))
    });

    const { rerender } = render(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={result.current.winSet}
          onUndoLastShot={result.current.undoLastShot}
        />
      </TestWrapper>
    );

    // Get player card and click it
    const player1Card = screen.getByText('Click Player 1').closest('.MuiCard-root');
    console.log('Player 1 card found:', !!player1Card);
    
    if (player1Card) {
      console.log('Clicking player 1 card');
      fireEvent.click(player1Card);
      
      game = result.current.currentGame!;
      console.log('After card click:', {
        scoreHistoryLength: game.scoreHistory.length,
        scoreHistory: game.scoreHistory,
        setsWon: game.players.map(p => ({ name: p.name, setsWon: p.setsWon }))
      });

      // Re-render to reflect state change
      rerender(
        <TestWrapper>
          <SetMatchBoard
            game={game}
            onWinSet={result.current.winSet}
            onUndoLastShot={result.current.undoLastShot}
          />
        </TestWrapper>
      );

      const undoButton = screen.getByText('取り消し');
      console.log('After card click - undo button disabled:', undoButton.hasAttribute('disabled'));
      
      expect(game.scoreHistory.length).toBe(1);
      expect(undoButton).not.toBeDisabled();
    }
  });
});
