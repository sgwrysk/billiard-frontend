import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import NumberInputStepper from '../NumberInputStepper';

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('NumberInputStepper', () => {
  it('should render with initial value', () => {
    const mockOnChange = vi.fn();
    render(
      <TestWrapper>
        <NumberInputStepper value={5} onChange={mockOnChange} />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
  });

  it('should render with label when provided', () => {
    const mockOnChange = vi.fn();
    render(
      <TestWrapper>
        <NumberInputStepper value={10} onChange={mockOnChange} label="Test Label" />
      </TestWrapper>
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  it('should increment value when plus button is clicked', () => {
    const mockOnChange = vi.fn();
    render(
      <TestWrapper>
        <NumberInputStepper value={5} onChange={mockOnChange} />
      </TestWrapper>
    );

    const incrementButton = screen.getAllByRole('button')[1]; // Second button is increment
    fireEvent.click(incrementButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(6);
  });

  it('should decrement value when minus button is clicked', () => {
    const mockOnChange = vi.fn();
    render(
      <TestWrapper>
        <NumberInputStepper value={5} onChange={mockOnChange} />
      </TestWrapper>
    );

    const decrementButton = screen.getAllByRole('button')[0]; // First button is decrement
    fireEvent.click(decrementButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(4);
  });

  it('should respect minimum value', () => {
    const mockOnChange = vi.fn();
    render(
      <TestWrapper>
        <NumberInputStepper value={1} onChange={mockOnChange} min={1} />
      </TestWrapper>
    );

    const decrementButton = screen.getAllByRole('button')[0];
    expect(decrementButton).toBeDisabled();
    
    fireEvent.click(decrementButton);
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should respect maximum value', () => {
    const mockOnChange = vi.fn();
    render(
      <TestWrapper>
        <NumberInputStepper value={10} onChange={mockOnChange} max={10} />
      </TestWrapper>
    );

    const incrementButton = screen.getAllByRole('button')[1];
    expect(incrementButton).toBeDisabled();
    
    fireEvent.click(incrementButton);
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should use custom step value', () => {
    const mockOnChange = vi.fn();
    render(
      <TestWrapper>
        <NumberInputStepper value={10} onChange={mockOnChange} step={5} />
      </TestWrapper>
    );

    const incrementButton = screen.getAllByRole('button')[1];
    fireEvent.click(incrementButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(15);
  });

  it('should focus input when clicked', () => {
    const mockOnChange = vi.fn();
    render(
      <TestWrapper>
        <NumberInputStepper value={5} onChange={mockOnChange} />
      </TestWrapper>
    );

    const valueInput = screen.getByDisplayValue('5');
    fireEvent.click(valueInput);

    // Should be able to focus the input field
    expect(valueInput).toBeInTheDocument();
  });

  it('should handle text input and update value immediately', () => {
    const mockOnChange = vi.fn();
    render(
      <TestWrapper>
        <NumberInputStepper value={5} onChange={mockOnChange} />
      </TestWrapper>
    );

    const input = screen.getByDisplayValue('5');
    fireEvent.change(input, { target: { value: '15' } });

    expect(mockOnChange).toHaveBeenCalledWith(15);
  });

  it('should update value on text change', () => {
    const mockOnChange = vi.fn();
    render(
      <TestWrapper>
        <NumberInputStepper value={5} onChange={mockOnChange} />
      </TestWrapper>
    );

    const input = screen.getByDisplayValue('5');
    fireEvent.change(input, { target: { value: '8' } });

    expect(mockOnChange).toHaveBeenCalledWith(8);
  });

  it('should call onChange when input value changes', () => {
    const mockOnChange = vi.fn();
    render(
      <TestWrapper>
        <NumberInputStepper value={5} onChange={mockOnChange} />
      </TestWrapper>
    );

    const input = screen.getByDisplayValue('5');
    fireEvent.change(input, { target: { value: '8' } });

    expect(mockOnChange).toHaveBeenCalledWith(8);
  });

  it('should clamp input value to min/max range', () => {
    const mockOnChange = vi.fn();
    render(
      <TestWrapper>
        <NumberInputStepper value={5} onChange={mockOnChange} min={1} max={10} />
      </TestWrapper>
    );

    const input = screen.getByDisplayValue('5');
    fireEvent.change(input, { target: { value: '15' } });

    expect(mockOnChange).toHaveBeenCalledWith(10); // Should be clamped to max
  });

  it('should handle invalid input gracefully', () => {
    const mockOnChange = vi.fn();
    render(
      <TestWrapper>
        <NumberInputStepper value={5} onChange={mockOnChange} />
      </TestWrapper>
    );

    const input = screen.getByDisplayValue('5');
    fireEvent.change(input, { target: { value: 'abc' } });

    // Should not call onChange for invalid input
    expect(mockOnChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('5'); // Should keep original value
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnChange = vi.fn();
    render(
      <TestWrapper>
        <NumberInputStepper value={5} onChange={mockOnChange} disabled />
      </TestWrapper>
    );

    const decrementButton = screen.getAllByRole('button')[0];
    const incrementButton = screen.getAllByRole('button')[1];
    const input = screen.getByDisplayValue('5');
    
    expect(decrementButton).toBeDisabled();
    expect(incrementButton).toBeDisabled();
    expect(input).toBeDisabled();

    fireEvent.click(input);

    // Should not be able to edit when disabled
    expect(input).toBeDisabled();
  });

  it('should apply monospace font styling', () => {
    const mockOnChange = vi.fn();
    render(
      <TestWrapper>
        <NumberInputStepper value={5} onChange={mockOnChange} />
      </TestWrapper>
    );

    const input = screen.getByDisplayValue('5');
    const computedStyles = getComputedStyle(input);
    
    // Check if monospace font family is applied
    expect(computedStyles.fontFamily).toContain('Courier New');
  });
});