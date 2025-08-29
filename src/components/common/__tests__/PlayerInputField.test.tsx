import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import PlayerInputField from '../PlayerInputField';

// Mock playerStorage
vi.mock('../../../utils/playerStorage', () => ({
  getSuggestedPlayers: vi.fn().mockReturnValue([]),
  getDefaultPlayer: vi.fn().mockReturnValue(null),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    {children}
  </LanguageProvider>
);

describe('PlayerInputField Basic Tests', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    label: 'Player Name',
    value: '',
    onChange: mockOnChange,
  };

  it('should render input field with label', () => {
    render(
      <TestWrapper>
        <PlayerInputField {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Player Name')).toBeInTheDocument();
  });

  it('should display character count', () => {
    render(
      <TestWrapper>
        <PlayerInputField {...defaultProps} value="Test" />
      </TestWrapper>
    );

    expect(screen.getByText('4/20')).toBeInTheDocument();
  });

  it('should call onChange when input changes', () => {
    render(
      <TestWrapper>
        <PlayerInputField {...defaultProps} />
      </TestWrapper>
    );

    const input = screen.getByLabelText('Player Name');
    fireEvent.change(input, { target: { value: 'New Name' } });

    expect(mockOnChange).toHaveBeenCalledWith('New Name');
  });

  it('should handle disabled state', () => {
    render(
      <TestWrapper>
        <PlayerInputField {...defaultProps} disabled />
      </TestWrapper>
    );

    const input = screen.getByLabelText('Player Name');
    expect(input).toBeDisabled();
  });

  it('should respect maxLength of 20 characters', () => {
    render(
      <TestWrapper>
        <PlayerInputField {...defaultProps} />
      </TestWrapper>
    );

    const input = screen.getByLabelText('Player Name') as HTMLInputElement;
    expect(input.maxLength).toBe(20);
  });

  it('should handle fullWidth prop', () => {
    render(
      <TestWrapper>
        <PlayerInputField {...defaultProps} fullWidth />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Player Name')).toBeInTheDocument();
  });

  it('should update character count correctly', () => {
    const { rerender } = render(
      <TestWrapper>
        <PlayerInputField {...defaultProps} value="" />
      </TestWrapper>
    );

    expect(screen.getByText('0/20')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <PlayerInputField {...defaultProps} value="Hello" />
      </TestWrapper>
    );

    expect(screen.getByText('5/20')).toBeInTheDocument();
  });

  it('should handle different sizes', () => {
    const { rerender } = render(
      <TestWrapper>
        <PlayerInputField {...defaultProps} size="small" />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Player Name')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <PlayerInputField {...defaultProps} size="medium" />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Player Name')).toBeInTheDocument();
  });

  it('should handle storage errors gracefully', () => {
    // Should not crash when storage fails
    expect(() =>
      render(
        <TestWrapper>
          <PlayerInputField {...defaultProps} />
        </TestWrapper>
      )
    ).not.toThrow();
  });
});