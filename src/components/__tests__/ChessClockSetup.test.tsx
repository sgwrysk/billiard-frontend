import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ChessClockSetup from '../ChessClockSetup';
import { LanguageProvider } from '../../contexts/LanguageContext';
import type { ChessClockSettings } from '../../types/index';

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </LanguageProvider>
);

const defaultChessClockSettings: ChessClockSettings = {
  enabled: true,
  individualTime: false,
  timeLimit: 30,
  warningEnabled: false,
  warningTime: 3,
  player1TimeLimit: 30,
  player2TimeLimit: 30,
};

const defaultPlayers = [
  { name: 'Alice' },
  { name: 'Bob' }
];

const renderChessClockSetup = (
  chessClock: ChessClockSettings = defaultChessClockSettings,
  onChessClockChange = vi.fn(),
  players = defaultPlayers
) => {
  return render(
    <TestWrapper>
      <ChessClockSetup
        chessClock={chessClock}
        onChessClockChange={onChessClockChange}
        players={players}
      />
    </TestWrapper>
  );
};

describe('ChessClockSetup', () => {
  describe('Basic Rendering', () => {
    it('should not render when chess clock is disabled', () => {
      const disabledSettings = { ...defaultChessClockSettings, enabled: false };
      const { container } = renderChessClockSetup(disabledSettings);
      
      expect(container.firstChild).toBeNull();
    });

    it('should render when chess clock is enabled', () => {
      renderChessClockSetup();
      
      expect(screen.getByText('制限時間（分）')).toBeInTheDocument();
      expect(screen.getByText('プレイヤー別に設定')).toBeInTheDocument();
      expect(screen.getByText('警告時間を設定する（デフォルト3分）')).toBeInTheDocument();
    });
  });

  describe('Time Limit Settings', () => {
    it('should display current time limit', () => {
      renderChessClockSetup();
      
      const timeInput = screen.getByDisplayValue('30');
      expect(timeInput).toBeInTheDocument();
    });

    it('should show preset time limit buttons', () => {
      renderChessClockSetup();
      
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('35')).toBeInTheDocument();
      expect(screen.getByText('40')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
    });

    it('should highlight current time limit preset', () => {
      renderChessClockSetup();
      
      const currentPreset = screen.getByText('30').closest('div');
      expect(currentPreset).toHaveClass('MuiChip-filled');
    });

    it('should call onChessClockChange when preset is clicked', () => {
      const mockOnChange = vi.fn();
      renderChessClockSetup(defaultChessClockSettings, mockOnChange);
      
      const presetButton = screen.getByText('25');
      fireEvent.click(presetButton);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultChessClockSettings,
        timeLimit: 25,
        player1TimeLimit: 25,
        player2TimeLimit: 25,
      });
    });

    it('should increment time limit when plus button is clicked', () => {
      const mockOnChange = vi.fn();
      renderChessClockSetup(defaultChessClockSettings, mockOnChange);
      
      const plusButton = screen.getByTestId('AddIcon');
      fireEvent.click(plusButton);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultChessClockSettings,
        timeLimit: 31,
        player1TimeLimit: 31,
        player2TimeLimit: 31,
      });
    });

    it('should decrement time limit when minus button is clicked', () => {
      const mockOnChange = vi.fn();
      renderChessClockSetup(defaultChessClockSettings, mockOnChange);
      
      const minusButton = screen.getByTestId('RemoveIcon');
      fireEvent.click(minusButton);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultChessClockSettings,
        timeLimit: 29,
        player1TimeLimit: 29,
        player2TimeLimit: 29,
      });
    });

    it('should not decrement below 1', () => {
      const mockOnChange = vi.fn();
      const minTimeSettings = { ...defaultChessClockSettings, timeLimit: 1 };
      renderChessClockSetup(minTimeSettings, mockOnChange);
      
      const minusButton = screen.getByTestId('RemoveIcon');
      fireEvent.click(minusButton);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...minTimeSettings,
        timeLimit: 1,
        player1TimeLimit: 1,
        player2TimeLimit: 1,
      });
    });

    it('should update time limit when input field is changed', () => {
      const mockOnChange = vi.fn();
      renderChessClockSetup(defaultChessClockSettings, mockOnChange);
      
      const timeInput = screen.getByDisplayValue('30');
      fireEvent.change(timeInput, { target: { value: '45' } });
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultChessClockSettings,
        timeLimit: 45,
        player1TimeLimit: 45,
        player2TimeLimit: 45,
      });
    });
  });

  describe('Individual Time Settings', () => {
    it('should show individual time inputs when individual time is enabled', () => {
      const individualTimeSettings = { ...defaultChessClockSettings, individualTime: true };
      renderChessClockSetup(individualTimeSettings);
      
      const timeInputs = screen.getAllByDisplayValue('30');
      expect(timeInputs).toHaveLength(2);
    });

    it('should show player names in individual time mode', () => {
      const individualTimeSettings = { ...defaultChessClockSettings, individualTime: true };
      renderChessClockSetup(individualTimeSettings);
      
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should call onChessClockChange when individual time toggle is changed', () => {
      const mockOnChange = vi.fn();
      renderChessClockSetup(defaultChessClockSettings, mockOnChange);
      
      const individualToggle = screen.getByRole('checkbox', { name: /プレイヤー別に設定/ });
      fireEvent.click(individualToggle);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultChessClockSettings,
        individualTime: true,
        player1TimeLimit: 30,
        player2TimeLimit: 30,
      });
    });

    it('should update individual player time limits when changed', () => {
      const mockOnChange = vi.fn();
      const individualTimeSettings = { ...defaultChessClockSettings, individualTime: true };
      renderChessClockSetup(individualTimeSettings, mockOnChange);
      
      const player1TimeInput = screen.getAllByDisplayValue('30')[0];
      fireEvent.change(player1TimeInput, { target: { value: '25' } });
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...individualTimeSettings,
        player1TimeLimit: 25,
      });
    });
  });

  describe('Warning Time Settings', () => {
    it('should not show warning time input when warning is disabled', () => {
      renderChessClockSetup();
      
      expect(screen.queryByDisplayValue('3')).not.toBeInTheDocument();
    });

    it('should show warning time input when warning is enabled', () => {
      const warningEnabledSettings = { ...defaultChessClockSettings, warningEnabled: true };
      renderChessClockSetup(warningEnabledSettings);
      
      expect(screen.getByDisplayValue('3')).toBeInTheDocument();
    });

    it('should call onChessClockChange when warning toggle is changed', () => {
      const mockOnChange = vi.fn();
      renderChessClockSetup(defaultChessClockSettings, mockOnChange);
      
      const warningToggle = screen.getByRole('checkbox', { name: /警告時間を設定する/ });
      fireEvent.click(warningToggle);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultChessClockSettings,
        warningEnabled: true,
        warningTime: 3,
      });
    });

    it('should increment warning time when plus button is clicked', () => {
      const mockOnChange = vi.fn();
      const warningEnabledSettings = { ...defaultChessClockSettings, warningEnabled: true };
      renderChessClockSetup(warningEnabledSettings, mockOnChange);
      
      const plusButton = screen.getAllByTestId('AddIcon')[1]; // Second plus button (warning time)
      fireEvent.click(plusButton);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...warningEnabledSettings,
        warningTime: 4,
      });
    });

    it('should decrement warning time when minus button is clicked', () => {
      const mockOnChange = vi.fn();
      const warningEnabledSettings = { ...defaultChessClockSettings, warningEnabled: true };
      renderChessClockSetup(warningEnabledSettings, mockOnChange);
      
      const minusButton = screen.getAllByTestId('RemoveIcon')[1]; // Second minus button (warning time)
      fireEvent.click(minusButton);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...warningEnabledSettings,
        warningTime: 2,
      });
    });

    it('should not decrement warning time below 1', () => {
      const mockOnChange = vi.fn();
      const warningEnabledSettings = { ...defaultChessClockSettings, warningEnabled: true, warningTime: 1 };
      renderChessClockSetup(warningEnabledSettings, mockOnChange);
      
      const minusButton = screen.getAllByTestId('RemoveIcon')[1];
      fireEvent.click(minusButton);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...warningEnabledSettings,
        warningTime: 1,
      });
    });

    it('should not increment warning time above time limit minus 1', () => {
      const mockOnChange = vi.fn();
      const warningEnabledSettings = { ...defaultChessClockSettings, warningEnabled: true, warningTime: 29, timeLimit: 30 };
      renderChessClockSetup(warningEnabledSettings, mockOnChange);
      
      const plusButton = screen.getAllByTestId('AddIcon')[1];
      fireEvent.click(plusButton);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...warningEnabledSettings,
        warningTime: 29, // Should not exceed timeLimit - 1
      });
    });

    it('should update warning time when input field is changed', () => {
      const mockOnChange = vi.fn();
      const warningEnabledSettings = { ...defaultChessClockSettings, warningEnabled: true };
      renderChessClockSetup(warningEnabledSettings, mockOnChange);
      
      const warningTimeInput = screen.getByDisplayValue('3');
      fireEvent.change(warningTimeInput, { target: { value: '5' } });
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...warningEnabledSettings,
        warningTime: 5,
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle preset time change with individual time enabled', () => {
      const mockOnChange = vi.fn();
      const individualTimeSettings = { ...defaultChessClockSettings, individualTime: true };
      renderChessClockSetup(individualTimeSettings, mockOnChange);
      
      const presetButton = screen.getByText('40');
      fireEvent.click(presetButton);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...individualTimeSettings,
        timeLimit: 40,
        player1TimeLimit: 40,
        player2TimeLimit: 40,
      });
    });

    it('should maintain individual time settings when toggling individual time off and on', () => {
      const mockOnChange = vi.fn();
      const individualTimeSettings = { 
        ...defaultChessClockSettings, 
        individualTime: true,
        player1TimeLimit: 25,
        player2TimeLimit: 35
      };
      renderChessClockSetup(individualTimeSettings, mockOnChange);
      
      // Toggle individual time off
      const individualToggle = screen.getByRole('checkbox', { name: /プレイヤー別に設定/ });
      fireEvent.click(individualToggle);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...individualTimeSettings,
        individualTime: false,
      });
    });
  });
});
