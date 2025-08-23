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

describe('SetMatchBoard Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should properly manage undo button state through actual game flow', () => {
    // Use actual useGame hook for realistic test
    const { result } = renderHook(() => useGame());
    
    // Start a set match game
    act(() => {
      result.current.startGame(
        [{ name: 'Player 1', targetSets: 3 }, { name: 'Player 2', targetSets: 3 }],
        GameType.SET_MATCH
      );
    });

    const game = result.current.currentGame!;
    expect(game.scoreHistory).toHaveLength(0);

    // Render SetMatchBoard with real game state
    const { rerender } = render(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={result.current.winSet}
          onUndoLastShot={result.current.undoLastShot}
        />
      </TestWrapper>
    );

    // Initially, undo button should be disabled
    let undoButton = screen.getByText('取り消し');
    expect(undoButton).toBeDisabled();

    // Player 1 wins a set
    const player1Id = game.players[0].id;
    act(() => {
      result.current.winSet(player1Id);
    });

    const updatedGame = result.current.currentGame!;
    expect(updatedGame.scoreHistory).toHaveLength(1);
    expect(updatedGame.players[0].setsWon).toBe(1);

    // Re-render with updated game state
    rerender(
      <TestWrapper>
        <SetMatchBoard
          game={updatedGame}
          onWinSet={result.current.winSet}
          onUndoLastShot={result.current.undoLastShot}
        />
      </TestWrapper>
    );

    // Now undo button should be enabled
    undoButton = screen.getByText('取り消し');
    expect(undoButton).not.toBeDisabled();

    // Click undo button
    fireEvent.click(undoButton);

    const revertedGame = result.current.currentGame!;
    expect(revertedGame.scoreHistory).toHaveLength(0);
    expect(revertedGame.players[0].setsWon).toBe(0);

    // Re-render with reverted game state
    rerender(
      <TestWrapper>
        <SetMatchBoard
          game={revertedGame}
          onWinSet={result.current.winSet}
          onUndoLastShot={result.current.undoLastShot}
        />
      </TestWrapper>
    );

    // Undo button should be disabled again
    undoButton = screen.getByText('取り消し');
    expect(undoButton).toBeDisabled();
  });

  it('should handle multiple set wins and undos correctly', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.startGame(
        [{ name: 'Alice', targetSets: 2 }, { name: 'Bob', targetSets: 2 }],
        GameType.SET_MATCH
      );
    });

    const aliceId = result.current.currentGame!.players[0].id;
    const bobId = result.current.currentGame!.players[1].id;

    // Alice wins set 1
    act(() => {
      result.current.winSet(aliceId);
    });

    let game = result.current.currentGame!;
    expect(game.scoreHistory).toHaveLength(1);
    expect(game.players[0].setsWon).toBe(1);

    const { rerender } = render(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={result.current.winSet}
          onUndoLastShot={result.current.undoLastShot}
        />
      </TestWrapper>
    );

    // Undo button should be enabled
    let undoButton = screen.getByText('取り消し');
    expect(undoButton).not.toBeDisabled();

    // Bob wins set 2
    act(() => {
      result.current.winSet(bobId);
    });

    game = result.current.currentGame!;
    expect(game.scoreHistory).toHaveLength(2);
    expect(game.players[0].setsWon).toBe(1);
    expect(game.players[1].setsWon).toBe(1);

    rerender(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={result.current.winSet}
          onUndoLastShot={result.current.undoLastShot}
        />
      </TestWrapper>
    );

    // Undo button should still be enabled
    undoButton = screen.getByText('取り消し');
    expect(undoButton).not.toBeDisabled();

    // Undo Bob's win
    fireEvent.click(undoButton);

    game = result.current.currentGame!;
    expect(game.scoreHistory).toHaveLength(1);
    expect(game.players[0].setsWon).toBe(1);
    expect(game.players[1].setsWon).toBe(0);

    rerender(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={result.current.winSet}
          onUndoLastShot={result.current.undoLastShot}
        />
      </TestWrapper>
    );

    // Undo button should still be enabled (Alice's win can be undone)
    undoButton = screen.getByText('取り消し');
    expect(undoButton).not.toBeDisabled();

    // Undo Alice's win
    fireEvent.click(undoButton);

    game = result.current.currentGame!;
    expect(game.scoreHistory).toHaveLength(0);
    expect(game.players[0].setsWon).toBe(0);
    expect(game.players[1].setsWon).toBe(0);

    rerender(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={result.current.winSet}
          onUndoLastShot={result.current.undoLastShot}
        />
      </TestWrapper>
    );

    // Now undo button should be disabled
    undoButton = screen.getByText('取り消し');
    expect(undoButton).toBeDisabled();
  });

  it('should handle clicking player cards for set wins', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.startGame(
        [{ name: 'Player A', targetSets: 3 }, { name: 'Player B', targetSets: 3 }],
        GameType.SET_MATCH
      );
    });

    let game = result.current.currentGame!;

    const { rerender } = render(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={result.current.winSet}
          onUndoLastShot={result.current.undoLastShot}
        />
      </TestWrapper>
    );

    // Click on Player A's card
    const playerACard = screen.getAllByText('Player A')[0].closest('.MuiCard-root');
    expect(playerACard).toBeInTheDocument();
    
    if (playerACard) {
      fireEvent.click(playerACard);
    }

    // Check that Player A won a set
    game = result.current.currentGame!;
    expect(game.scoreHistory).toHaveLength(1);
    expect(game.players[0].setsWon).toBe(1);

    rerender(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={result.current.winSet}
          onUndoLastShot={result.current.undoLastShot}
        />
      </TestWrapper>
    );

    // Verify the updated set count is displayed (may appear in multiple places due to set history)
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);

    // Undo button should be enabled
    const undoButton = screen.getByText('取り消し');
    expect(undoButton).not.toBeDisabled();
  });

  it('should show correct set counts for each player', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.startGame(
        [{ name: 'Alpha', targetSets: 3 }, { name: 'Beta', targetSets: 3 }],
        GameType.SET_MATCH
      );
    });

    const alphaId = result.current.currentGame!.players[0].id;
    const betaId = result.current.currentGame!.players[1].id;

    // Alpha wins 2 sets, Beta wins 1 set
    act(() => {
      result.current.winSet(alphaId);  // Alpha: 1, Beta: 0
    });
    act(() => {
      result.current.winSet(betaId);   // Alpha: 1, Beta: 1
    });
    act(() => {
      result.current.winSet(alphaId);  // Alpha: 2, Beta: 1
    });

    const game = result.current.currentGame!;
    expect(game.players[0].setsWon).toBe(2);
    expect(game.players[1].setsWon).toBe(1);

    render(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={result.current.winSet}
          onUndoLastShot={result.current.undoLastShot}
        />
      </TestWrapper>
    );

    // Check that both players' names and set counts are displayed (allow multiple occurrences)
    expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Beta').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2').length).toBeGreaterThan(0); // Alpha's sets
    expect(screen.getAllByText('1').length).toBeGreaterThan(0); // Beta's sets may appear in multiple places
  });

  it('should handle game start to first set win undo sequence', () => {
    // This test specifically covers the scenario user might be experiencing
    const { result } = renderHook(() => useGame());
    
    // Start game exactly as user would
    act(() => {
      result.current.startGame(
        [{ name: 'プレイヤー1', targetSets: 3 }, { name: 'プレイヤー2', targetSets: 3 }],
        GameType.SET_MATCH
      );
    });

    const initialGame = result.current.currentGame!;
    
    // Verify initial state matches what user expects
    expect(initialGame.scoreHistory).toEqual([]);
    expect(initialGame.players[0].setsWon).toBe(0);
    expect(initialGame.players[1].setsWon).toBe(0);

    const { rerender } = render(
      <TestWrapper>
        <SetMatchBoard
          game={initialGame}
          onWinSet={result.current.winSet}
          onUndoLastShot={result.current.undoLastShot}
        />
      </TestWrapper>
    );

    // Undo button should be disabled initially
    let undoButton = screen.getByText('取り消し');
    expect(undoButton).toBeDisabled();

    // User clicks プレイヤー1's card to win first set
    const player1Card = screen.getAllByText('プレイヤー1')[0].closest('.MuiCard-root');
    expect(player1Card).toBeInTheDocument();
    
    fireEvent.click(player1Card!);

    // Get updated game state
    const gameAfterWin = result.current.currentGame!;
    expect(gameAfterWin.scoreHistory).toHaveLength(1);
    expect(gameAfterWin.players[0].setsWon).toBe(1);

    // Re-render with new state
    rerender(
      <TestWrapper>
        <SetMatchBoard
          game={gameAfterWin}
          onWinSet={result.current.winSet}
          onUndoLastShot={result.current.undoLastShot}
        />
      </TestWrapper>
    );

    // Now undo button MUST be enabled
    undoButton = screen.getByText('取り消し');
    expect(undoButton).not.toBeDisabled();

    // User clicks undo
    fireEvent.click(undoButton);

    // Verify undo worked
    const gameAfterUndo = result.current.currentGame!;
    expect(gameAfterUndo.scoreHistory).toEqual([]);
    expect(gameAfterUndo.players[0].setsWon).toBe(0);

    // Re-render after undo
    rerender(
      <TestWrapper>
        <SetMatchBoard
          game={gameAfterUndo}
          onWinSet={result.current.winSet}
          onUndoLastShot={result.current.undoLastShot}
        />
      </TestWrapper>
    );

    // Undo button should be disabled again
    undoButton = screen.getByText('取り消し');
    expect(undoButton).toBeDisabled();
  });

  it('should verify undo button behavior matches scoreHistory exactly', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.startGame(
        [{ name: 'Test A', targetSets: 5 }, { name: 'Test B', targetSets: 5 }],
        GameType.SET_MATCH
      );
    });

    const player1Id = result.current.currentGame!.players[0].id;
    const player2Id = result.current.currentGame!.players[1].id;

    // Test each scoreHistory length corresponds to correct button state
    const testScenarios = [
      { description: 'Initial state', expectedLength: 0, expectedDisabled: true },
      { description: 'After 1 set win', expectedLength: 1, expectedDisabled: false },
      { description: 'After 2 set wins', expectedLength: 2, expectedDisabled: false },
      { description: 'After 3 set wins', expectedLength: 3, expectedDisabled: false },
    ];

    let game = result.current.currentGame!;
    
    const { rerender } = render(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={result.current.winSet}
          onUndoLastShot={result.current.undoLastShot}
        />
      </TestWrapper>
    );

    testScenarios.forEach(({ description, expectedLength, expectedDisabled }, index) => {
      if (index > 0) {
        // Trigger a set win (alternating between players)
        const winnerId = index % 2 === 1 ? player1Id : player2Id;
        act(() => {
          result.current.winSet(winnerId);
        });

        game = result.current.currentGame!;
        
        rerender(
          <TestWrapper>
            <SetMatchBoard
              game={game}
              onWinSet={result.current.winSet}
              onUndoLastShot={result.current.undoLastShot}
            />
          </TestWrapper>
        );
      }

      // Verify scoreHistory length
      expect(game.scoreHistory).toHaveLength(expectedLength);
      
      // Verify button state
      const undoButton = screen.getByText('取り消し');
      if (expectedDisabled) {
        expect(undoButton).toBeDisabled();
      } else {
        expect(undoButton).not.toBeDisabled();
      }

      console.log(`${description}: scoreHistory.length=${game.scoreHistory.length}, disabled=${expectedDisabled}`);
    });
  });
});
