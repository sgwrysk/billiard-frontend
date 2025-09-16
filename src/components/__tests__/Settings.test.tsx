import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { BallDesignProvider } from '../../contexts/BallDesignContext';
import Settings from '../Settings';

const theme = createTheme();

// Test wrapper with all necessary providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    <BallDesignProvider>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </BallDesignProvider>
  </LanguageProvider>
);

describe('Settings', () => {
  it('should render settings title and ball design section', () => {
    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );

    // Check if settings title is displayed
    expect(screen.getByText('設定')).toBeInTheDocument();
    
    // Check if ball design settings section is displayed
    expect(screen.getByText('ボールデザイン設定')).toBeInTheDocument();
    expect(screen.getByText('ゲーム内で使用するボールのデザインを選択できます。')).toBeInTheDocument();
  });

  it('should display ball design selection prompt', () => {
    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );

    // Check if ball design selection prompt is displayed
    expect(screen.getByText('ボールデザインを選択してください:')).toBeInTheDocument();
  });

  it('should display available ball designs with radio buttons', () => {
    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );

    // Check if default design is displayed
    expect(screen.getByText('デフォルト (オリジナル)')).toBeInTheDocument();
    expect(screen.getByText('選択中')).toBeInTheDocument();
    
    // Check if radio buttons are present
    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons.length).toBeGreaterThan(0);
    
    // Check if default is selected
    expect(screen.getByDisplayValue('default')).toBeChecked();
  });

  it('should display ball preview for each design', () => {
    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );

    // Check if all 15 ball numbers are displayed in preview (multiple times for multiple designs)
    for (let i = 1; i <= 15; i++) {
      const ballElements = screen.getAllByText(i.toString());
      expect(ballElements.length).toBeGreaterThan(0);
    }
  });

  it('should display future settings section', () => {
    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );

    // Check if future settings section is displayed
    expect(screen.getByText('その他の設定')).toBeInTheDocument();
    expect(screen.getByText('今後、その他の設定項目がここに追加される予定です。')).toBeInTheDocument();
  });
});