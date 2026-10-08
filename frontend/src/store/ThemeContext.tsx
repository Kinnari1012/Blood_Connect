import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeColor = string;
type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  color: ThemeColor;
  secondaryColor: ThemeColor;
  mode: ThemeMode;
  setColor: (color: ThemeColor) => void;
  setSecondaryColor: (color: ThemeColor) => void;
  setMode: (mode: ThemeMode) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [color, setColorState] = useState<ThemeColor>(() => {
    return localStorage.getItem('BloodConnect_theme_color') || '#C62828'; // BloodConnect Red default
  });

  const [secondaryColor, setSecondaryColorState] = useState<ThemeColor>(() => {
    return localStorage.getItem('BloodConnect_theme_secondary') || '#0F172A'; // Slate default
  });

  const [mode, setModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('BloodConnect_theme_mode') as ThemeMode) || 'light';
  });

  const setColor = (newColor: ThemeColor) => {
    setColorState(newColor);
    localStorage.setItem('BloodConnect_theme_color', newColor);
  };

  const setSecondaryColor = (newColor: ThemeColor) => {
    setSecondaryColorState(newColor);
    localStorage.setItem('BloodConnect_theme_secondary', newColor);
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('BloodConnect_theme_mode', newMode);
  };

  const resetTheme = () => {
    setColor('#C62828');
    setSecondaryColor('#0F172A');
    setMode('light');
  };

  useEffect(() => {
    // Apply Theme Colors globally
    document.documentElement.style.setProperty('--c-primary', color);
    document.documentElement.style.setProperty('--c-secondary', secondaryColor);
  }, [color, secondaryColor]);

  useEffect(() => {
    // Apply Light/Dark Mode
    const root = document.documentElement;
    if (mode === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else if (mode === 'light') {
      root.removeAttribute('data-theme');
    } else {
      // System
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ color, secondaryColor, mode, setColor, setSecondaryColor, setMode, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
