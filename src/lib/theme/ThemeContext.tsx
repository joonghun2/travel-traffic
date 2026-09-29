'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode, AccentColor } from '@/types';

interface ThemeContextType {
  themeMode: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  accentColor: AccentColor;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (accent: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  resolvedTheme: 'dark',
  accentColor: 'crimson',
  setThemeMode: () => {},
  setAccentColor: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');
  const [accentColor, setAccentColorState] = useState<AccentColor>('crimson');

  // Initialize theme from storage
  useEffect(() => {
    const savedMode = localStorage.getItem('cep_theme_mode') as ThemeMode | null;
    const savedAccent = localStorage.getItem('cep_accent_color') as AccentColor | null;

    if (savedMode && ['system', 'dark', 'light'].includes(savedMode)) {
      setThemeModeState(savedMode);
    }
    if (savedAccent && ['crimson', 'ocean', 'emerald', 'violet'].includes(savedAccent)) {
      setAccentColorState(savedAccent);
    }
  }, []);

  // Handle system color scheme changes & apply DOM attributes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      let isDark = false;
      if (themeMode === 'system') {
        isDark = mediaQuery.matches;
      } else {
        isDark = themeMode === 'dark';
      }

      const activeTheme = isDark ? 'dark' : 'light';
      setResolvedTheme(activeTheme);

      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }

      root.setAttribute('data-theme', activeTheme);
      root.setAttribute('data-accent', accentColor);
    };

    updateTheme();

    const listener = () => {
      if (themeMode === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [themeMode, accentColor]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('cep_theme_mode', mode);
  };

  const setAccentColor = (accent: AccentColor) => {
    setAccentColorState(accent);
    localStorage.setItem('cep_accent_color', accent);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        resolvedTheme,
        accentColor,
        setThemeMode,
        setAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
