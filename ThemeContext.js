import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const THEMES = {
  purple: { 
    primary: '#6C5CE7', 
    secondary: '#A29BFE',
    name: 'Mor',
    light: '#F0EEFF',
  },
  blue: { 
    primary: '#4A90E2', 
    secondary: '#74B9FF',
    name: 'Mavi',
    light: '#E3F2FD',
  },
  green: { 
    primary: '#2ECC71', 
    secondary: '#55EFC4',
    name: 'Yeşil',
    light: '#E8F8F5',
  },
  orange: { 
    primary: '#E67E22', 
    secondary: '#FFA502',
    name: 'Turuncu',
    light: '#FFF5E6',
  },
  pink: { 
    primary: '#E84393', 
    secondary: '#FD79A8',
    name: 'Pembe',
    light: '#FCE4EC',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('purple');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const settings = await AsyncStorage.getItem('settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.isDark !== undefined) setIsDark(parsed.isDark);
      }
    } catch (error) {
      console.error('Tema yüklenirken hata:', error);
    }
  };

  const saveTheme = async (newTheme) => {
    try {
      const settings = await AsyncStorage.getItem('settings');
      const current = settings ? JSON.parse(settings) : {};
      current.theme = newTheme;
      await AsyncStorage.setItem('settings', JSON.stringify(current));
      setTheme(newTheme);
    } catch (error) {
      console.error('Tema kaydedilirken hata:', error);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newMode = !isDark;
      const settings = await AsyncStorage.getItem('settings');
      const current = settings ? JSON.parse(settings) : {};
      current.isDark = newMode;
      await AsyncStorage.setItem('settings', JSON.stringify(current));
      setIsDark(newMode);
    } catch (error) {
      console.error('Dark mode kaydedilirken hata:', error);
    }
  };

  const colors = {
    // Dinamik renkler
    primary: THEMES[theme].primary,
    secondary: THEMES[theme].secondary,
    light: THEMES[theme].light,
    
    // Dark/Light mode renkleri
    background: isDark ? '#1a1a1a' : '#F8F9FA',
    card: isDark ? '#2a2a2a' : '#fff',
    text: isDark ? '#ffffff' : '#333',
    textSecondary: isDark ? '#aaa' : '#888',
    textTertiary: isDark ? '#666' : '#CCC',
    border: isDark ? '#3a3a3a' : '#F0F0F0',
    input: isDark ? '#2a2a2a' : '#F8F9FA',
    
    // Sabit renkler
    success: '#4ECDC4',
    warning: '#FFD93D',
    danger: '#FF6B6B',
    white: '#fff',
    black: '#000',
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: saveTheme, isDark, toggleDarkMode, colors, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};