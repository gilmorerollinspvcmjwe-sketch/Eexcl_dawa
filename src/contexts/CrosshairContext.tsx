import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

interface CrosshairContextType {
  mousePosition: MousePosition;
  isCrosshairVisible: boolean;
  setCrosshairVisible: (visible: boolean) => void;
}

const CrosshairContext = createContext<CrosshairContextType | undefined>(undefined);

interface CrosshairProviderProps {
  children: ReactNode;
}

export const CrosshairProvider: React.FC<CrosshairProviderProps> = ({ children }) => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isCrosshairVisible, setIsCrosshairVisible] = useState(false);
  
  // Use ref for requestAnimationFrame optimization
  const rafIdRef = useRef<number | null>(null);
  const pendingPositionRef = useRef<MousePosition>({ x: 0, y: 0 });

  const setCrosshairVisible = useCallback((visible: boolean) => {
    setIsCrosshairVisible(visible);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Store the new position
      pendingPositionRef.current = { x: e.clientX, y: e.clientY };
      
      // Use requestAnimationFrame for smooth updates
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          setMousePosition({ ...pendingPositionRef.current });
          rafIdRef.current = null;
        });
      }
    };

    // Add event listener
    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      // Cancel any pending animation frame
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  return (
    <CrosshairContext.Provider value={{ mousePosition, isCrosshairVisible, setCrosshairVisible }}>
      {children}
    </CrosshairContext.Provider>
  );
};

export const useCrosshair = (): CrosshairContextType => {
  const context = useContext(CrosshairContext);
  if (context === undefined) {
    throw new Error('useCrosshair must be used within a CrosshairProvider');
  }
  return context;
};