import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('simulador-theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  const applyTheme = (value: boolean) => {
    setDarkMode(value);
    localStorage.setItem('simulador-theme', value ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', value);
  };

  const toggleTheme = () => applyTheme(!darkMode);
  const setDarkModeValue = (value: boolean) => applyTheme(value);

  return (
    <ThemeContext.Provider value={{
      darkMode,
      toggleTheme,
      setDarkMode: setDarkModeValue,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
