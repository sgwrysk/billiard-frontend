import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LanguageProvider, useLanguage } from '../LanguageContext';

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

const TestComponent: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div>
      <span data-testid="current-language">{language}</span>
      <span data-testid="translated-text">{t('app.title')}</span>
      <button onClick={() => setLanguage('en')}>Switch to English</button>
      <button onClick={() => setLanguage('ja')}>Switch to Japanese</button>
    </div>
  );
};

describe('LanguageContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should provide default language as Japanese', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-language')).toHaveTextContent('ja');
  });

  it('should translate text correctly in Japanese', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('translated-text')).toHaveTextContent('ビリヤードスコア');
  });

  it('should switch language and translate correctly', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByText('Switch to English'));

    expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    expect(screen.getByTestId('translated-text')).toHaveTextContent('Billiard Score');
  });

  it('should save language preference to localStorage', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByText('Switch to English'));

    expect(localStorageMock.setItem).toHaveBeenCalledWith('billiard-language', 'en');
  });

  it('should load language preference from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('en');

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    expect(screen.getByTestId('translated-text')).toHaveTextContent('Billiard Score');
  });

  it('should return fallback text for missing translation keys', () => {
    const TestComponentWithMissingKey: React.FC = () => {
      const { t } = useLanguage();
      return <span data-testid="missing-key">{t('nonexistent.key')}</span>;
    };

    render(
      <LanguageProvider>
        <TestComponentWithMissingKey />
      </LanguageProvider>
    );

    expect(screen.getByTestId('missing-key')).toHaveTextContent('nonexistent.key');
  });

  it('should handle corrupted localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-language');

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Should fallback to default language
    expect(screen.getByTestId('current-language')).toHaveTextContent('ja');
  });

  it('should switch back to Japanese from English', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Switch to English first
    fireEvent.click(screen.getByText('Switch to English'));
    expect(screen.getByTestId('current-language')).toHaveTextContent('en');

    // Switch back to Japanese
    fireEvent.click(screen.getByText('Switch to Japanese'));
    expect(screen.getByTestId('current-language')).toHaveTextContent('ja');
    expect(screen.getByTestId('translated-text')).toHaveTextContent('ビリヤードスコア');
  });
});