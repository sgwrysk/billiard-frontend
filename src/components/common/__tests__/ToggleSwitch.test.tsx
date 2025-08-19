import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ToggleSwitch from '../ToggleSwitch';

// Material-UIのテーマを提供するためのラッパー
const renderWithTheme = (component: React.ReactElement) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ToggleSwitch', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with label', () => {
    renderWithTheme(
      <ToggleSwitch
        checked={false}
        onChange={mockOnChange}
        label="Test Label"
      />
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with description when provided', () => {
    renderWithTheme(
      <ToggleSwitch
        checked={false}
        onChange={mockOnChange}
        label="Test Label"
        description="Test Description"
      />
    );

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('calls onChange when switch is clicked', () => {
    renderWithTheme(
      <ToggleSwitch
        checked={false}
        onChange={mockOnChange}
        label="Test Label"
      />
    );

    const switchElement = screen.getByRole('checkbox');
    fireEvent.click(switchElement);

    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('reflects checked state correctly', () => {
    renderWithTheme(
      <ToggleSwitch
        checked={true}
        onChange={mockOnChange}
        label="Test Label"
      />
    );

    const switchElement = screen.getByRole('checkbox');
    expect(switchElement).toBeChecked();
  });

  it('can be disabled', () => {
    renderWithTheme(
      <ToggleSwitch
        checked={false}
        onChange={mockOnChange}
        label="Test Label"
        disabled={true}
      />
    );

    const switchElement = screen.getByRole('checkbox');
    expect(switchElement).toBeDisabled();
  });

  it('does not call onChange when disabled', () => {
    renderWithTheme(
      <ToggleSwitch
        checked={false}
        onChange={mockOnChange}
        label="Test Label"
        disabled={true}
      />
    );

    const switchElement = screen.getByRole('checkbox');
    fireEvent.click(switchElement);

    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
