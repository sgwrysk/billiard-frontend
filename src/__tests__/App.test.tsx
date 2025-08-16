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

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should render app title', () => {
    render(<App />);
    
    expect(screen.getByText(/ビリヤードスコア/)).toBeInTheDocument();
  });

  it('should render language selector with Japanese text', () => {
    render(<App />);
    
    expect(screen.getByText('🇯🇵 日本語')).toBeInTheDocument();
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
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
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
      expect(screen.getByText('Alice')).toBeInTheDocument();
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
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // Reset game using Home button
    const resetButton = screen.getByTitle(/ホームに戻る/);
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText(/ゲーム開始/)).toBeInTheDocument();
    });
  });
});