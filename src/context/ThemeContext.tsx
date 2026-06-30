import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemePreset = 'indigo' | 'cyber' | 'sakura' | 'emerald';
export type FontSizePreset = 'normal' | 'lg' | 'xl';

interface ThemeContextType {
  theme: ThemePreset;
  darkMode: boolean;
  fontSize: FontSizePreset;
  highContrast: boolean;
  setThemePreset: (preset: ThemePreset) => void;
  toggleDarkMode: () => void;
  setFontSizePreset: (size: FontSizePreset) => void;
  toggleHighContrast: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemePreset>(() => {
    return (localStorage.getItem('aira_theme_preset') as ThemePreset) || 'indigo';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('aira_dark_mode');
    return saved !== null ? saved === 'true' : true; // default is dark mode for futuristic feel
  });

  const [fontSize, setFontSize] = useState<FontSizePreset>(() => {
    return (localStorage.getItem('aira_font_size') as FontSizePreset) || 'normal';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('aira_high_contrast') === 'true';
  });

  // Apply theme settings to document element
  useEffect(() => {
    const root = document.documentElement;
    
    // 1. Reset theme presets
    root.classList.remove('theme-cyber', 'theme-sakura', 'theme-emerald');
    if (theme !== 'indigo') {
      root.classList.add(`theme-${theme}`);
    }

    // 2. Dark Mode
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 3. Font Size Accessibility
    root.classList.remove('font-accessible-lg', 'font-accessible-xl');
    if (fontSize === 'lg') root.classList.add('font-accessible-lg');
    if (fontSize === 'xl') root.classList.add('font-accessible-xl');

    // 4. High Contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Save states
    localStorage.setItem('aira_theme_preset', theme);
    localStorage.setItem('aira_dark_mode', String(darkMode));
    localStorage.setItem('aira_font_size', fontSize);
    localStorage.setItem('aira_high_contrast', String(highContrast));
  }, [theme, darkMode, fontSize, highContrast]);

  const setThemePreset = (preset: ThemePreset) => setTheme(preset);
  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const setFontSizePreset = (size: FontSizePreset) => setFontSize(size);
  const toggleHighContrast = () => setHighContrast(prev => !prev);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        darkMode,
        fontSize,
        highContrast,
        setThemePreset,
        toggleDarkMode,
        setFontSizePreset,
        toggleHighContrast
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
