import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { LanguageProvider } from '../../contexts/LanguageContext';
import GameSetup from '../GameSetup';

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <LanguageProvider>
        {component}
      </LanguageProvider>
    </ThemeProvider>
  );
};

describe('GameSetup - Japan Game Integration', () => {
  const mockOnStartGame = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show Japan game type option', () => {
    renderWithProviders(<GameSetup onStartGame={mockOnStartGame} />);
    
    const gameTypeSelect = screen.getByLabelText('ゲームタイプ');
    fireEvent.mouseDown(gameTypeSelect);
    
    expect(screen.getByText('5-9, 5-10 (ジャパンルール)')).toBeInTheDocument();
  });

  it('should show Japan settings when Japan game type is selected', () => {
    renderWithProviders(<GameSetup onStartGame={mockOnStartGame} />);
    
    const gameTypeSelect = screen.getByLabelText('ゲームタイプ');
    fireEvent.mouseDown(gameTypeSelect);
    
    const japanOption = screen.getByText('5-9, 5-10 (ジャパンルール)');
    fireEvent.click(japanOption);
    
    expect(screen.getByText('5-9, 5-10 (ジャパンルール) 設定')).toBeInTheDocument();
    expect(screen.getByText('ハンディキャップボール')).toBeInTheDocument();
  });

  it('should allow adding players when Japan game is selected', () => {
    renderWithProviders(<GameSetup onStartGame={mockOnStartGame} />);
    
    // Select Japan game type
    const gameTypeSelect = screen.getByLabelText('ゲームタイプ');
    fireEvent.mouseDown(gameTypeSelect);
    const japanOption = screen.getByText('5-9, 5-10 (ジャパンルール)');
    fireEvent.click(japanOption);
    
    // Should show add player button
    expect(screen.getByRole('button', { name: 'プレイヤー追加' })).toBeInTheDocument();
    
    // Click add player button
    const addButton = screen.getByRole('button', { name: 'プレイヤー追加' });
    fireEvent.click(addButton);
    
    // Should now have 3 player input fields
    const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
    expect(playerInputs).toHaveLength(3);
  });

  it('should allow removing players when there are more than 2', () => {
    renderWithProviders(<GameSetup onStartGame={mockOnStartGame} />);
    
    // Select Japan game type
    const gameTypeSelect = screen.getByLabelText('ゲームタイプ');
    fireEvent.mouseDown(gameTypeSelect);
    const japanOption = screen.getByText('5-9, 5-10 (ジャパンルール)');
    fireEvent.click(japanOption);
    
    // Add a third player first
    const addButton = screen.getByRole('button', { name: 'プレイヤー追加' });
    fireEvent.click(addButton);
    
    // Now should have remove buttons (×) visible
    const removeButtons = screen.getAllByText('×');
    expect(removeButtons.length).toBeGreaterThan(0);
    
    // Click first remove button
    fireEvent.click(removeButtons[0]);
    
    // Should be back to 2 players
    const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
    expect(playerInputs).toHaveLength(2);
  });

  it('should limit players to 10 for Japan game', () => {
    renderWithProviders(<GameSetup onStartGame={mockOnStartGame} />);
    
    // Select Japan game type
    const gameTypeSelect = screen.getByLabelText('ゲームタイプ');
    fireEvent.mouseDown(gameTypeSelect);
    const japanOption = screen.getByText('5-9, 5-10 (ジャパンルール)');
    fireEvent.click(japanOption);
    
    // Click add 8 times (starting with 2, should get to 10)
    for (let i = 0; i < 8; i++) {
      const currentAddButton = screen.queryByRole('button', { name: 'プレイヤー追加' });
      if (currentAddButton) {
        fireEvent.click(currentAddButton);
      }
    }
    
    // Should have 10 players now
    const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
    expect(playerInputs).toHaveLength(10);
    
    // Add button should not be present or disabled
    const addButtonAfter = screen.queryByRole('button', { name: 'プレイヤー追加' });
    expect(addButtonAfter).toBeNull();
  });

  it('should not allow removing players below minimum (2)', () => {
    renderWithProviders(<GameSetup onStartGame={mockOnStartGame} />);
    
    // Select Japan game type
    const gameTypeSelect = screen.getByLabelText('ゲームタイプ');
    fireEvent.mouseDown(gameTypeSelect);
    const japanOption = screen.getByText('5-9, 5-10 (ジャパンルール)');
    fireEvent.click(japanOption);
    
    // With only 2 players, should not show remove buttons
    const removeButtons = screen.queryAllByText('×');
    expect(removeButtons).toHaveLength(0);
  });

  it('should show validation error when neither 9 nor 10 handicap ball is selected', () => {
    renderWithProviders(<GameSetup onStartGame={mockOnStartGame} />);
    
    // Select Japan game type
    const gameTypeSelect = screen.getByLabelText('ゲームタイプ');
    fireEvent.mouseDown(gameTypeSelect);
    const japanOption = screen.getByText('5-9, 5-10 (ジャパンルール)');
    fireEvent.click(japanOption);
    
    // Click ball 9 to deselect it (it's selected by default)
    const ball9Button = screen.getByText('9');
    fireEvent.click(ball9Button);
    
    // Should show validation error
    expect(screen.getByText('9番か10番のどちらかを必ず選択してください')).toBeInTheDocument();
  });
});