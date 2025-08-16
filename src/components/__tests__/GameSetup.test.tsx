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
      GameType.SET_MATCH
    );
  });
});