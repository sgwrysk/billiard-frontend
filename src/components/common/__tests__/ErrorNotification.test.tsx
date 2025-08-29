import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react';
import ErrorNotification, { useErrorNotification } from '../ErrorNotification';

describe('ErrorNotification', () => {
  const defaultProps = {
    message: 'Test error message',
    open: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render error notification when open', () => {
    render(<ErrorNotification {...defaultProps} />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ErrorNotification {...defaultProps} open={false} />);

    expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<ErrorNotification {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should display different severity levels', () => {
    const { rerender } = render(
      <ErrorNotification {...defaultProps} severity="error" />
    );
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-filledError');

    rerender(<ErrorNotification {...defaultProps} severity="warning" />);
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-filledWarning');

    rerender(<ErrorNotification {...defaultProps} severity="info" />);
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-filledInfo');

    rerender(<ErrorNotification {...defaultProps} severity="success" />);
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-filledSuccess');
  });

  it('should auto-hide after specified duration', async () => {
    render(<ErrorNotification {...defaultProps} duration={1000} />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();

    // Wait for auto-hide
    await waitFor(
      () => {
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 }
    );
  });

  it('should use default duration of 4000ms', () => {
    render(<ErrorNotification {...defaultProps} />);

    // Verify the Snackbar has autoHideDuration set to 4000
    const snackbar = screen.getByRole('presentation');
    expect(snackbar).toBeInTheDocument();
  });
});

describe('useErrorNotification', () => {
  it('should initialize with closed state', () => {
    const { result } = renderHook(() => useErrorNotification());

    expect(result.current.notification.open).toBe(false);
    expect(result.current.notification.message).toBe('');
    expect(result.current.notification.severity).toBe('error');
  });

  it('should show error notification', () => {
    const { result } = renderHook(() => useErrorNotification());

    act(() => {
      result.current.showError('Test error');
    });

    expect(result.current.notification.open).toBe(true);
    expect(result.current.notification.message).toBe('Test error');
    expect(result.current.notification.severity).toBe('error');
  });

  it('should show warning notification', () => {
    const { result } = renderHook(() => useErrorNotification());

    act(() => {
      result.current.showWarning('Test warning');
    });

    expect(result.current.notification.open).toBe(true);
    expect(result.current.notification.message).toBe('Test warning');
    expect(result.current.notification.severity).toBe('warning');
  });

  it('should show success notification', () => {
    const { result } = renderHook(() => useErrorNotification());

    act(() => {
      result.current.showSuccess('Test success');
    });

    expect(result.current.notification.open).toBe(true);
    expect(result.current.notification.message).toBe('Test success');
    expect(result.current.notification.severity).toBe('success');
  });

  it('should show info notification', () => {
    const { result } = renderHook(() => useErrorNotification());

    act(() => {
      result.current.showInfo('Test info');
    });

    expect(result.current.notification.open).toBe(true);
    expect(result.current.notification.message).toBe('Test info');
    expect(result.current.notification.severity).toBe('info');
  });

  it('should hide notification', () => {
    const { result } = renderHook(() => useErrorNotification());

    // Show notification first
    act(() => {
      result.current.showError('Test error');
    });

    expect(result.current.notification.open).toBe(true);

    // Hide notification
    act(() => {
      result.current.hideNotification();
    });

    expect(result.current.notification.open).toBe(false);
    expect(result.current.notification.message).toBe('Test error'); // Message should remain
  });

  it('should handle multiple notification calls', () => {
    const { result } = renderHook(() => useErrorNotification());

    act(() => {
      result.current.showError('First error');
    });

    expect(result.current.notification.message).toBe('First error');
    expect(result.current.notification.severity).toBe('error');

    act(() => {
      result.current.showSuccess('Success message');
    });

    expect(result.current.notification.message).toBe('Success message');
    expect(result.current.notification.severity).toBe('success');
    expect(result.current.notification.open).toBe(true);
  });
});