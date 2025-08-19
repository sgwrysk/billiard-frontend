import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GameSetup from '../GameSetup';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { GameType } from '../../types/index';

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </LanguageProvider>
);

const renderGameSetup = (onStartGame = vi.fn()) => {
  return render(
    <TestWrapper>
      <GameSetup onStartGame={onStartGame} />
    </TestWrapper>
  );
};

describe('GameSetup', () => {
  it('should render game type selection', () => {
    renderGameSetup();
    
    expect(screen.getByText('セットマッチ')).toBeInTheDocument();
  });

  it('should render player name inputs', () => {
    renderGameSetup();
    
    const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
    expect(playerInputs).toHaveLength(2);
  });

  it('should have start game button disabled when no player names entered', () => {
    renderGameSetup();
    
    // Clear default player names first
    const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
    fireEvent.change(playerInputs[0], { target: { value: '' } });
    fireEvent.change(playerInputs[1], { target: { value: '' } });
    
    const startButton = screen.getByRole('button', { name: /ゲーム開始/ });
    expect(startButton).toBeDisabled();
  });

  it('should enable start game button when player names are entered', async () => {
    renderGameSetup();
    
    const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
    
    fireEvent.change(playerInputs[0], { target: { value: 'Alice' } });
    fireEvent.change(playerInputs[1], { target: { value: 'Bob' } });

    await waitFor(() => {
      const startButton = screen.getByRole('button', { name: /ゲーム開始/ });
      expect(startButton).toBeEnabled();
    });
  });

  it('should call onStartGame with correct parameters for SET_MATCH', async () => {
    const mockOnStartGame = vi.fn();
    renderGameSetup(mockOnStartGame);
    
    const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
    
    fireEvent.change(playerInputs[0], { target: { value: 'Alice' } });
    fireEvent.change(playerInputs[1], { target: { value: 'Bob' } });

    const startButton = screen.getByRole('button', { name: /ゲーム開始/ });
    fireEvent.click(startButton);

          expect(mockOnStartGame).toHaveBeenCalledWith(
        [
          { name: 'Alice', targetScore: 120, targetSets: 5 },
          { name: 'Bob', targetScore: 120, targetSets: 5 }
        ],
        GameType.SET_MATCH,
        false, // alternatingBreak default value
        undefined // chess clock settings not passed when disabled
      );
  });

  describe('Alternating Break Feature', () => {
    it('should show alternating break toggle only for SET_MATCH game type', () => {
      renderGameSetup();
      
      // Should be visible by default (SET_MATCH is default)
      expect(screen.getByText('交互ブレイク')).toBeInTheDocument();
      
      // Change to ROTATION game type
      const gameTypeSelect = screen.getByText('セットマッチ');
      fireEvent.mouseDown(gameTypeSelect);
      const rotationOption = screen.getByText('ローテーション');
      fireEvent.click(rotationOption);
      
      // Should not be visible for ROTATION
      expect(screen.queryByText('交互ブレイク')).not.toBeInTheDocument();
    });

    it('should toggle alternating break setting', () => {
      renderGameSetup();
      
      const alternatingBreakToggle = screen.getByRole('checkbox', { name: /交互ブレイク/ });
      
      // Should be unchecked by default
      expect(alternatingBreakToggle).not.toBeChecked();
      
      // Click to enable
      fireEvent.click(alternatingBreakToggle);
      expect(alternatingBreakToggle).toBeChecked();
      
      // Click to disable
      fireEvent.click(alternatingBreakToggle);
      expect(alternatingBreakToggle).not.toBeChecked();
    });

    it('should call onStartGame with alternating break setting when enabled', async () => {
      const mockOnStartGame = vi.fn();
      renderGameSetup(mockOnStartGame);
      
      const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
      
      fireEvent.change(playerInputs[0], { target: { value: 'Alice' } });
      fireEvent.change(playerInputs[1], { target: { value: 'Bob' } });

      // Enable alternating break
      const alternatingBreakToggle = screen.getByRole('checkbox', { name: /交互ブレイク/ });
      fireEvent.click(alternatingBreakToggle);

      const startButton = screen.getByRole('button', { name: /ゲーム開始/ });
      fireEvent.click(startButton);

      expect(mockOnStartGame).toHaveBeenCalledWith(
        [
          { name: 'Alice', targetScore: 120, targetSets: 5 },
          { name: 'Bob', targetScore: 120, targetSets: 5 }
        ],
        GameType.SET_MATCH,
        true, // alternatingBreak enabled
        undefined // chess clock settings not passed when disabled
      );
    });

    it('should reset alternating break setting when changing game type', () => {
      renderGameSetup();
      
      // Enable alternating break
      const alternatingBreakToggle = screen.getByRole('checkbox', { name: /交互ブレイク/ });
      fireEvent.click(alternatingBreakToggle);
      expect(alternatingBreakToggle).toBeChecked();
      
      // Change to ROTATION game type
      const gameTypeSelect = screen.getByText('セットマッチ');
      fireEvent.mouseDown(gameTypeSelect);
      const rotationOption = screen.getByText('ローテーション');
      fireEvent.click(rotationOption);
      
      // Change back to SET_MATCH
      fireEvent.mouseDown(gameTypeSelect);
      const setMatchOption = screen.getByText('セットマッチ');
      fireEvent.click(setMatchOption);
      
      // Should be reset to false
      const newAlternatingBreakToggle = screen.getByRole('checkbox', { name: /交互ブレイク/ });
      expect(newAlternatingBreakToggle).not.toBeChecked();
    });
  });

  describe('Chess Clock Feature', () => {
    it('should show chess clock toggle only for SET_MATCH and ROTATION game types', () => {
      renderGameSetup();
      
      // Should be visible by default (SET_MATCH is default)
      expect(screen.getByText('チェスクロック')).toBeInTheDocument();
      
      // Change to ROTATION game type
      const gameTypeSelect = screen.getByText('セットマッチ');
      fireEvent.mouseDown(gameTypeSelect);
      const rotationOption = screen.getByText('ローテーション');
      fireEvent.click(rotationOption);
      
      // Should still be visible for ROTATION
      expect(screen.getByText('チェスクロック')).toBeInTheDocument();
      
      // Change to BOWLARD game type
      fireEvent.mouseDown(gameTypeSelect);
      const bowlardOption = screen.getByText('ボーラード');
      fireEvent.click(bowlardOption);
      
      // Should not be visible for BOWLARD
      expect(screen.queryByText('チェスクロック')).not.toBeInTheDocument();
    });

    it('should show chess clock settings when chess clock is enabled', () => {
      renderGameSetup();
      
      const chessClockToggle = screen.getByRole('checkbox', { name: /チェスクロック/ });
      
      // Should be unchecked by default
      expect(chessClockToggle).not.toBeChecked();
      
      // Click to enable
      fireEvent.click(chessClockToggle);
      expect(chessClockToggle).toBeChecked();
      
      // Should show chess clock settings
      expect(screen.getByText('制限時間（分）')).toBeInTheDocument();
      expect(screen.getByText('プレイヤー別に設定')).toBeInTheDocument();
      expect(screen.getByText('警告時間を設定する（デフォルト3分）')).toBeInTheDocument();
    });

    it('should hide chess clock settings when chess clock is disabled', () => {
      renderGameSetup();
      
      const chessClockToggle = screen.getByRole('checkbox', { name: /チェスクロック/ });
      
      // Enable chess clock first
      fireEvent.click(chessClockToggle);
      expect(screen.getByText('制限時間（分）')).toBeInTheDocument();
      
      // Disable chess clock
      fireEvent.click(chessClockToggle);
      expect(screen.queryByText('制限時間（分）')).not.toBeInTheDocument();
    });

    it('should call onStartGame with chess clock settings when enabled', async () => {
      const mockOnStartGame = vi.fn();
      renderGameSetup(mockOnStartGame);
      
      const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
      
      fireEvent.change(playerInputs[0], { target: { value: 'Alice' } });
      fireEvent.change(playerInputs[1], { target: { value: 'Bob' } });

      // Enable chess clock
      const chessClockToggle = screen.getByRole('checkbox', { name: /チェスクロック/ });
      fireEvent.click(chessClockToggle);

      const startButton = screen.getByRole('button', { name: /ゲーム開始/ });
      fireEvent.click(startButton);

      expect(mockOnStartGame).toHaveBeenCalledWith(
        [
          { name: 'Alice', targetScore: 120, targetSets: 5 },
          { name: 'Bob', targetScore: 120, targetSets: 5 }
        ],
        GameType.SET_MATCH,
        false, // alternatingBreak default value
        expect.objectContaining({
          enabled: true,
          individualTime: false,
          timeLimit: 30,
          warningEnabled: false,
          warningTime: 3,
          player1TimeLimit: 30,
          player2TimeLimit: 30,
        })
      );
    });

    it('should not call onStartGame with chess clock settings when disabled', async () => {
      const mockOnStartGame = vi.fn();
      renderGameSetup(mockOnStartGame);
      
      const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
      
      fireEvent.change(playerInputs[0], { target: { value: 'Alice' } });
      fireEvent.change(playerInputs[1], { target: { value: 'Bob' } });

      // Chess clock should be disabled by default
      const startButton = screen.getByRole('button', { name: /ゲーム開始/ });
      fireEvent.click(startButton);

      expect(mockOnStartGame).toHaveBeenCalledWith(
        [
          { name: 'Alice', targetScore: 120, targetSets: 5 },
          { name: 'Bob', targetScore: 120, targetSets: 5 }
        ],
        GameType.SET_MATCH,
        false, // alternatingBreak default value
        undefined // chess clock settings not passed when disabled
      );
    });

    it('should reset chess clock settings when changing to unsupported game type', () => {
      renderGameSetup();
      
      // Enable chess clock
      const chessClockToggle = screen.getByRole('checkbox', { name: /チェスクロック/ });
      fireEvent.click(chessClockToggle);
      expect(chessClockToggle).toBeChecked();
      
      // Change to BOWLARD game type (not supported)
      const gameTypeSelect = screen.getByText('セットマッチ');
      fireEvent.mouseDown(gameTypeSelect);
      const bowlardOption = screen.getByText('ボーラード');
      fireEvent.click(bowlardOption);
      
      // Should be reset to false
      expect(screen.queryByText('チェスクロック')).not.toBeInTheDocument();
      
      // Change back to SET_MATCH
      fireEvent.mouseDown(gameTypeSelect);
      const setMatchOption = screen.getByText('セットマッチ');
      fireEvent.click(setMatchOption);
      
      // Should be visible again but disabled
      const newChessClockToggle = screen.getByRole('checkbox', { name: /チェスクロック/ });
      expect(newChessClockToggle).not.toBeChecked();
    });
  });
});