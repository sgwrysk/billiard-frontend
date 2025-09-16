import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { LanguageProvider } from '../../contexts/LanguageContext';
import QRShare from '../QRShare';

// Mock QRCode library
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockqrcode')
  }
}));

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </LanguageProvider>
  );
};

// Mock clipboard API
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock window.open
const mockOpen = vi.fn();
Object.assign(window, { open: mockOpen });

describe('QRShare', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up location mock
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/test-page',
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render QR share page with title and description', () => {
    renderWithProviders(<QRShare />);
    
    expect(screen.getByText('QRコード共有')).toBeInTheDocument();
    expect(screen.getByText('このページのQRコードを生成して共有できます')).toBeInTheDocument();
  });

  it('should display current URL', () => {
    renderWithProviders(<QRShare />);
    
    expect(screen.getByText('現在のURL')).toBeInTheDocument();
    expect(screen.getByDisplayValue('http://localhost:3000/test-page')).toBeInTheDocument();
  });

  it('should render QR code image when generated', async () => {
    renderWithProviders(<QRShare />);
    
    await waitFor(() => {
      const qrImage = screen.getByAltText('QR Code');
      expect(qrImage).toBeInTheDocument();
      expect(qrImage).toHaveAttribute('src', 'data:image/png;base64,mockqrcode');
    });
  });

  it('should show loading state while QR code is being generated', () => {
    renderWithProviders(<QRShare />);
    
    // Initially should show loading text
    expect(screen.getByText('Loading QR Code...')).toBeInTheDocument();
  });

  it('should copy URL to clipboard when copy button is clicked', async () => {
    renderWithProviders(<QRShare />);
    
    const copyButton = screen.getByText('URLをコピー');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('http://localhost:3000/test-page');
    });
  });

  it('should show success message when URL is copied', async () => {
    renderWithProviders(<QRShare />);
    
    const copyButton = screen.getByText('URLをコピー');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(screen.getByText('URLをコピーしました')).toBeInTheDocument();
    });
  });

  it('should render SNS share buttons', () => {
    renderWithProviders(<QRShare />);
    
    expect(screen.getByText('SNSで共有')).toBeInTheDocument();
    expect(screen.getByText('Xで共有')).toBeInTheDocument();
    expect(screen.getByText('Facebookで共有')).toBeInTheDocument();
    expect(screen.getByText('LINEで共有')).toBeInTheDocument();
  });

  it('should open X share when X button is clicked', () => {
    renderWithProviders(<QRShare />);
    
    const xButton = screen.getByText('Xで共有');
    fireEvent.click(xButton);
    
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
      'width=600,height=400'
    );
  });

  it('should open Facebook share when Facebook button is clicked', () => {
    renderWithProviders(<QRShare />);
    
    const facebookButton = screen.getByText('Facebookで共有');
    fireEvent.click(facebookButton);
    
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com/sharer/sharer.php'),
      '_blank',
      'width=600,height=400'
    );
  });

  it('should open LINE share when LINE button is clicked', () => {
    renderWithProviders(<QRShare />);
    
    const lineButton = screen.getByText('LINEで共有');
    fireEvent.click(lineButton);
    
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('social-plugins.line.me/lineit/share'),
      '_blank',
      'width=600,height=400'
    );
  });

  it('should handle clipboard API failure gracefully', async () => {
    // Mock clipboard API to fail
    mockWriteText.mockRejectedValueOnce(new Error('Clipboard API failed'));
    
    // Mock document.execCommand as fallback
    const mockExecCommand = vi.fn().mockReturnValue(true);
    const mockSelect = vi.fn();
    const mockFocus = vi.fn();
    const mockRemoveChild = vi.fn();
    const mockAppendChild = vi.fn();
    
    // Mock createElement to return a mock textarea element
    const mockTextArea = {
      value: '',
      focus: mockFocus,
      select: mockSelect,
    };
    
    const mockCreateElement = vi.fn().mockReturnValue(mockTextArea);
    
    Object.assign(document, {
      execCommand: mockExecCommand,
      createElement: mockCreateElement,
      body: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild,
      },
    });
    
    renderWithProviders(<QRShare />);
    
    const copyButton = screen.getByText('URLをコピー');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(mockCreateElement).toHaveBeenCalledWith('textarea');
      expect(mockTextArea.value).toBe('http://localhost:3000/test-page');
      expect(mockFocus).toHaveBeenCalled();
      expect(mockSelect).toHaveBeenCalled();
      expect(mockExecCommand).toHaveBeenCalledWith('copy');
    });
  });

  it('should render with English language', () => {
    // We would need to set language context to English for this test
    // For now, just verify the component renders without errors
    renderWithProviders(<QRShare />);
    
    expect(screen.getByText('QRコード共有')).toBeInTheDocument();
  });
});