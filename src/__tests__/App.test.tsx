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

  describe('Hamburger Menu', () => {
    it('should show hamburger menu when menu button is clicked', async () => {
      render(<App />);
      
      const menuButton = screen.getByLabelText('menu');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText(/スコア入力/)).toBeInTheDocument();
        expect(screen.getByText(/開発者にコーヒーをおごる/)).toBeInTheDocument();
      });
    });

    it('should show Buy Me Coffee menu item with coffee icon', async () => {
      render(<App />);
      
      const menuButton = screen.getByLabelText('menu');
      fireEvent.click(menuButton);

      await waitFor(() => {
        const coffeeMenuItem = screen.getByText(/開発者にコーヒーをおごる/);
        expect(coffeeMenuItem).toBeInTheDocument();
        
        // Check if coffee icon is present (LocalCafe icon)
        const coffeeIcon = coffeeMenuItem.closest('[role="menuitem"]')?.querySelector('svg');
        expect(coffeeIcon).toBeInTheDocument();
      });
    });

    it('should show divider between menu items', async () => {
      render(<App />);
      
      const menuButton = screen.getByLabelText('menu');
      fireEvent.click(menuButton);

      await waitFor(() => {
        // Find all menu items and check if divider exists between them
        const scoreInputItem = screen.getByText(/スコア入力/);
        const coffeeItem = screen.getByText(/開発者にコーヒーをおごる/);
        
        expect(scoreInputItem).toBeInTheDocument();
        expect(coffeeItem).toBeInTheDocument();
        
        // Check that divider exists (Material-UI Divider creates an hr element)
        const divider = document.querySelector('hr');
        expect(divider).toBeInTheDocument();
      });
    });

    it('should open Buy Me Coffee URL when menu item is clicked', async () => {
      render(<App />);
      
      const menuButton = screen.getByLabelText('menu');
      fireEvent.click(menuButton);

      await waitFor(() => {
        const coffeeMenuItem = screen.getByText(/開発者にコーヒーをおごる/);
        fireEvent.click(coffeeMenuItem);
        
        expect(windowOpenMock).toHaveBeenCalledWith(
          'https://buymeacoffee.com/latteemielr',
          '_blank',
          'noopener,noreferrer'
        );
      });
    });

    it('should close menu when Buy Me Coffee item is clicked', async () => {
      render(<App />);
      
      const menuButton = screen.getByLabelText('menu');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText(/開発者にコーヒーをおごる/)).toBeInTheDocument();
      });

      const coffeeMenuItem = screen.getByText(/開発者にコーヒーをおごる/);
      fireEvent.click(coffeeMenuItem);

      await waitFor(() => {
        expect(screen.queryByText(/開発者にコーヒーをおごる/)).not.toBeInTheDocument();
      });
    });

    it('should show Buy Me Coffee in English when language is switched', async () => {
      render(<App />);
      
      // Switch to English - find the select element and click it
      const languageSelect = screen.getByText('🇯🇵 日本語').closest('[role="combobox"]');
      fireEvent.mouseDown(languageSelect!);
      
      await waitFor(() => {
        const englishOption = screen.getByText(/🇺🇸 English/);
        fireEvent.click(englishOption);
      });

      // Wait for language change to take effect
      await waitFor(() => {
        expect(screen.getByText('Billiard Score')).toBeInTheDocument();
      });

      // Open hamburger menu
      const menuButton = screen.getByLabelText('menu');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText(/Buy Coffee for Developer/)).toBeInTheDocument();
        expect(screen.getByText(/Score Input/)).toBeInTheDocument();
      });
    });
  });
});