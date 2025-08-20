import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfirmDialog } from '../ConfirmDialog';
import { LanguageProvider } from '../../contexts/LanguageContext';

const MockLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

const defaultProps = {
  open: true,
  title: 'Test Title',
  message: 'Test message',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('ConfirmDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(
      <MockLanguageProvider>
        <ConfirmDialog {...defaultProps} />
      </MockLanguageProvider>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '確認' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <MockLanguageProvider>
        <ConfirmDialog {...defaultProps} open={false} />
      </MockLanguageProvider>
    );

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <MockLanguageProvider>
        <ConfirmDialog {...defaultProps} onConfirm={onConfirm} />
      </MockLanguageProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: '確認' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(
      <MockLanguageProvider>
        <ConfirmDialog {...defaultProps} onCancel={onCancel} />
      </MockLanguageProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('uses custom button texts when provided', () => {
    render(
      <MockLanguageProvider>
        <ConfirmDialog
          {...defaultProps}
          confirmText="Delete"
          cancelText="Keep"
        />
      </MockLanguageProvider>
    );

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
  });

  it('calls onCancel when dialog backdrop is clicked', () => {
    const onCancel = vi.fn();
    render(
      <MockLanguageProvider>
        <ConfirmDialog {...defaultProps} onCancel={onCancel} />
      </MockLanguageProvider>
    );

    // Click on the backdrop (outside the dialog)
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(
      <MockLanguageProvider>
        <ConfirmDialog {...defaultProps} />
      </MockLanguageProvider>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-dialog-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'confirm-dialog-description');
    
    expect(screen.getByText('Test Title')).toHaveAttribute('id', 'confirm-dialog-title');
    expect(screen.getByText('Test message')).toHaveAttribute('id', 'confirm-dialog-description');
  });

  it('confirm button has error color variant', () => {
    render(
      <MockLanguageProvider>
        <ConfirmDialog {...defaultProps} />
      </MockLanguageProvider>
    );

    const confirmButton = screen.getByRole('button', { name: '確認' });
    expect(confirmButton).toHaveClass('MuiButton-containedError');
  });

  it('cancel button has primary color', () => {
    render(
      <MockLanguageProvider>
        <ConfirmDialog {...defaultProps} />
      </MockLanguageProvider>
    );

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    expect(cancelButton).toHaveClass('MuiButton-colorPrimary');
  });

  it('dialog has proper maxWidth and fullWidth properties', () => {
    render(
      <MockLanguageProvider>
        <ConfirmDialog {...defaultProps} />
      </MockLanguageProvider>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('MuiDialog-paperWidthSm');
    expect(dialog).toHaveClass('MuiDialog-paperFullWidth');
  });
});