import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.open
const windowOpenMock = vi.fn();
Object.defineProperty(window, 'open', {
  value: windowOpenMock,
});

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    windowOpenMock.mockClear();
  });

  it('should render app title', () => {
    render(<App />);
    
    expect(screen.getByText(/ビリヤードスコア/)).toBeInTheDocument();
  });

  it('should render language selector with Japanese text', () => {
    render(<App />);
    
    // Confirm that Japanese flag and Japanese text exist in language selector
    expect(screen.getByText('🇯🇵')).toBeInTheDocument();
    expect(screen.getByText('日本語')).toBeInTheDocument();
  });

  it('should start on setup screen', () => {
    render(<App />);
    
    expect(screen.getByText(/ゲーム開始/)).toBeInTheDocument();
  });

  it('should navigate to game screen when game is started', async () => {
    render(<App />);
    
    // Fill in player names
    const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
    fireEvent.change(playerInputs[0], { target: { value: 'Alice' } });
    fireEvent.change(playerInputs[1], { target: { value: 'Bob' } });

    // Start game
    const startButton = screen.getByRole('button', { name: /ゲーム開始/ });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Bob').length).toBeGreaterThan(0);
    });
  });

  it('should navigate between screens', async () => {
    render(<App />);
    
    // Start a game
    const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
    fireEvent.change(playerInputs[0], { target: { value: 'Alice' } });
    fireEvent.change(playerInputs[1], { target: { value: 'Bob' } });

    const startButton = screen.getByRole('button', { name: /ゲーム開始/ });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
    });

    // Return to setup screen using home button
    const homeButton = screen.getByTitle(/ホームに戻る/);
    fireEvent.click(homeButton);

    await waitFor(() => {
      expect(screen.getByText(/ゲーム開始/)).toBeInTheDocument();
    });
  });

  it('should reset game and return to setup', async () => {
    render(<App />);
    
    // Start a game
    const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
    fireEvent.change(playerInputs[0], { target: { value: 'Alice' } });
    fireEvent.change(playerInputs[1], { target: { value: 'Bob' } });

    const startButton = screen.getByRole('button', { name: /ゲーム開始/ });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
    });

    // Return to setup screen using home button
    const homeButton = screen.getByTitle(/ホームに戻る/);
    fireEvent.click(homeButton);

    await waitFor(() => {
      expect(screen.getByText(/ゲーム開始/)).toBeInTheDocument();
    });
  });

  it('should display game type in AppBar title when game is active', async () => {
    render(<App />);
    
    // Start a Set Match game
    const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
    fireEvent.change(playerInputs[0], { target: { value: 'Alice' } });
    fireEvent.change(playerInputs[1], { target: { value: 'Bob' } });

    const startButton = screen.getByRole('button', { name: /ゲーム開始/ });
    fireEvent.click(startButton);

    await waitFor(() => {
      // AppBar should show "Set Match" instead of "Billiard Score"
      expect(screen.getByText('セットマッチ')).toBeInTheDocument();
      expect(screen.queryByText('ビリヤードスコア')).not.toBeInTheDocument();
    });
  });

  it('should display different game types for different games', async () => {
    render(<App />);
    
    // Start a Rotation game
    const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
    fireEvent.change(playerInputs[0], { target: { value: 'Alice' } });
    fireEvent.change(playerInputs[1], { target: { value: 'Bob' } });

    // Change game type to Rotation by clicking on the select and then the option
    const gameTypeSelects = screen.getAllByRole('combobox');
    const gameTypeSelect = gameTypeSelects[1]; // Second combobox (game type selection)
    fireEvent.mouseDown(gameTypeSelect);
    const rotationOption = screen.getByText('ローテーション');
    fireEvent.click(rotationOption);

    const startButton = screen.getByRole('button', { name: /ゲーム開始/ });
    fireEvent.click(startButton);

    await waitFor(() => {
      // AppBar should show "Rotation"
      expect(screen.getByText('ローテーション')).toBeInTheDocument();
    });
  });

  it('should show Home icon in AppBar when game is active', async () => {
    render(<App />);
    
    // Start a game
    const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
    fireEvent.change(playerInputs[0], { target: { value: 'Alice' } });
    fireEvent.change(playerInputs[1], { target: { value: 'Bob' } });

    const startButton = screen.getByRole('button', { name: /ゲーム開始/ });
    fireEvent.click(startButton);

    await waitFor(() => {
      // Home icon should be visible in AppBar
      const homeButton = screen.getByTitle(/ホームに戻る/);
      expect(homeButton).toBeInTheDocument();
    });
  });

  it('should not show Home icon in AppBar on home/setup screen', () => {
    render(<App />);
    
    // Home icon should not be visible on setup screen
    const homeButton = screen.queryByTitle(/ホームに戻る/);
    expect(homeButton).not.toBeInTheDocument();
  });

  it('should return to home without confirmation when game is in initial state', async () => {
    render(<App />);
    
    // Start a game
    const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
    fireEvent.change(playerInputs[0], { target: { value: 'Alice' } });
    fireEvent.change(playerInputs[1], { target: { value: 'Bob' } });

    const startButton = screen.getByRole('button', { name: /ゲーム開始/ });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
    });

    // Click Home icon - should return to home without confirmation
    const homeButton = screen.getByTitle(/ホームに戻る/);
    fireEvent.click(homeButton);

    await waitFor(() => {
      // Should return to setup screen without confirmation dialog
      expect(screen.getByText(/ゲーム開始/)).toBeInTheDocument();
    });
  });

  it('should display Bowlard game type in AppBar title', async () => {
    render(<App />);
    
    // Start a Bowlard game
    const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
    fireEvent.change(playerInputs[0], { target: { value: 'Alice' } });

    // Change game type to Bowlard by clicking on the select and then the option
    const gameTypeSelects = screen.getAllByRole('combobox');
    const gameTypeSelect = gameTypeSelects[1]; // Second combobox (game type selection)
    fireEvent.mouseDown(gameTypeSelect);
    const bowlardOption = screen.getByText('ボーラード');
    fireEvent.click(bowlardOption);

    const startButton = screen.getByRole('button', { name: /ゲーム開始/ });
    fireEvent.click(startButton);

    await waitFor(() => {
      // AppBar should show "Bowlard"
      expect(screen.getByText('ボーラード')).toBeInTheDocument();
    });
  });

  it('should return to home without confirmation for Bowlard in initial state', async () => {
    render(<App />);
    
    // Start a Bowlard game
    const playerInputs = screen.getAllByLabelText(/プレイヤー名/);
    fireEvent.change(playerInputs[0], { target: { value: 'Alice' } });

    // Change game type to Bowlard by clicking on the select and then the option
    const gameTypeSelects = screen.getAllByRole('combobox');
    const gameTypeSelect = gameTypeSelects[1]; // Second combobox (game type selection)
    fireEvent.mouseDown(gameTypeSelect);
    const bowlardOption = screen.getByText('ボーラード');
    fireEvent.click(bowlardOption);

    const startButton = screen.getByRole('button', { name: /ゲーム開始/ });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('ボーラード')).toBeInTheDocument();
    });

    // Click Home icon - should return to home without confirmation for Bowlard
    const homeButton = screen.getByTitle(/ホームに戻る/);
    fireEvent.click(homeButton);

    await waitFor(() => {
      // Should return to setup screen without confirmation dialog
      expect(screen.getByText(/ゲーム開始/)).toBeInTheDocument();
    });
  });

  describe('Hamburger Menu', () => {
    it('should show hamburger menu when menu button is clicked', async () => {
      render(<App />);
      
      const menuButton = screen.getByLabelText('menu');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText(/スコア入力/)).toBeInTheDocument();
      });
    });

    it('should show divider between menu items', async () => {
      render(<App />);
      
      const menuButton = screen.getByLabelText('menu');
      fireEvent.click(menuButton);

      await waitFor(() => {
        // Find menu items and check if divider exists
        const scoreInputItem = screen.getByText(/スコア入力/);
        
        expect(scoreInputItem).toBeInTheDocument();
        
        // Check that divider exists (Material-UI Divider creates an hr element)
        const divider = document.querySelector('hr');
        expect(divider).toBeInTheDocument();
      });
    });

  });
});