import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BallDesignProvider, useBallDesign } from '../BallDesignContext';

// Mock storage
vi.mock('../../utils/storage', () => ({
  storage: {
    get: vi.fn().mockReturnValue(null),
    set: vi.fn(),
  },
}));

// Test component to access context
const TestComponent: React.FC = () => {
  const { currentDesign, getBallColor } = useBallDesign();

  return (
    <div>
      <div data-testid="current-design-id">{currentDesign.id}</div>
      <div data-testid="current-design-name">{currentDesign.name}</div>
      <div data-testid="ball-1-color">{getBallColor(1)}</div>
    </div>
  );
};

describe('BallDesignContext', () => {
  it('should provide default design and ball colors', () => {
    render(
      <BallDesignProvider>
        <TestComponent />
      </BallDesignProvider>
    );

    expect(screen.getByTestId('current-design-id')).toHaveTextContent('default');
    expect(screen.getByTestId('current-design-name')).toHaveTextContent('デフォルト');
    // Test that ball color is returned (exact color will depend on Strategy Pattern implementation)
    expect(screen.getByTestId('ball-1-color')).toHaveTextContent('#');
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useBallDesign must be used within a BallDesignProvider');

    consoleSpy.mockRestore();
  });
});