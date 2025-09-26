import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { storage } from '../utils/storage';
import { BallRenderer } from '../utils/BallRenderer';

// Define design info structure based on Strategy Pattern
interface BallDesignInfo {
  id: string;
  name: string;
  manufacturer: string;
}

interface BallDesignContextType {
  currentDesign: BallDesignInfo;
  availableDesigns: BallDesignInfo[];
  setCurrentDesign: (designId: string) => void;
  getBallColor: (ballNumber: number) => string;
  getBallStyle: (ballNumber: number) => React.CSSProperties;
}

const BallDesignContext = createContext<BallDesignContextType | undefined>(undefined);

interface BallDesignProviderProps {
  children: React.ReactNode;
}

// Storage key for ball design settings
const BALL_DESIGN_STORAGE_KEY = 'billiard_ball_design_settings';

export const BallDesignProvider: React.FC<BallDesignProviderProps> = ({ children }) => {
  // Get available designs from BallRenderer (Strategy Pattern) - memoized to prevent infinite loops
  const availableDesigns = useMemo(() => BallRenderer.getAllDesigns(), []);
  const defaultDesign = useMemo(() =>
    availableDesigns.find(d => d.id === 'default') || availableDesigns[0],
    [availableDesigns]
  );

  const [currentDesign, setCurrentDesignState] = useState<BallDesignInfo>(defaultDesign);

  // Load saved design from localStorage on mount - only run once
  useEffect(() => {
    const savedDesignId = storage.get<string>(BALL_DESIGN_STORAGE_KEY);
    if (savedDesignId) {
      const savedDesign = availableDesigns.find(design => design.id === savedDesignId);
      if (savedDesign) {
        setCurrentDesignState(savedDesign);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setCurrentDesign = useCallback((designId: string) => {
    const design = availableDesigns.find(d => d.id === designId);
    if (design) {
      setCurrentDesignState(design);
      storage.set(BALL_DESIGN_STORAGE_KEY, designId);
    }
  }, [availableDesigns]);

  const getBallColorForDesign = useCallback((ballNumber: number): string => {
    return BallRenderer.getColor(ballNumber, currentDesign.id);
  }, [currentDesign.id]);

  const getBallStyleForDesign = useCallback((ballNumber: number): React.CSSProperties => {
    // For backward compatibility, return medium size style as CSSProperties
    // 下位互換性のため、中サイズスタイルをCSSPropertiesとして返す
    return BallRenderer.getStyle(ballNumber, currentDesign.id, 'medium') as React.CSSProperties;
  }, [currentDesign.id]);

  const contextValue = useMemo<BallDesignContextType>(() => ({
    currentDesign,
    availableDesigns,
    setCurrentDesign,
    getBallColor: getBallColorForDesign,
    getBallStyle: getBallStyleForDesign,
  }), [currentDesign, availableDesigns, setCurrentDesign, getBallColorForDesign, getBallStyleForDesign]);

  return (
    <BallDesignContext.Provider value={contextValue}>
      {children}
    </BallDesignContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBallDesign = (): BallDesignContextType => {
  const context = useContext(BallDesignContext);
  if (context === undefined) {
    throw new Error('useBallDesign must be used within a BallDesignProvider');
  }
  return context;
};